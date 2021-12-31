import { AccountStatus, } from '@loopring-web/common-resources';

import { Subject } from 'rxjs';
import { Commands } from './command';
import { LoopringAPI } from 'api_wrapper';
import { myLog } from "@loopring-web/common-resources";
import store from 'stores';
import { updateAccountStatus } from 'stores/account';
import * as sdk from '@loopring-web/loopring-sdk'
import _ from 'lodash'
import { unlockAccount } from './unlockAccount';
import { resetLayer12Data, resetLayer2Data } from './resetAccount';

const subject = new Subject<{ status: keyof typeof Commands, data: any, }>();

export const accountServices = {
    //INFO: for update Account and unlock account
    sendSign: async () => {
        // const account = store.getState().account;
        // const {exchangeInfo} = store.getState().system;
        subject.next({
            status: Commands.ProcessSign,
            data: undefined,
        })
    },
    sendSignDeniedByUser: () => {
        subject.next({
            status: Commands.SignDeniedByUser,
            data: undefined,
        })
    },
    sendErrorUnlock: () => {
        subject.next({
            status: Commands.ErrorSign,
            data: undefined,
        })
    },

    sendUpdateAccStatusAndReset: (readyState: AccountStatus, accountId: number = -1) => {
        store.dispatch(updateAccountStatus({
            accountId,
            readyState,
            apiKey: '',
            eddsaKey: '',
            publicKey: '',
            nonce: undefined,
        }))

        if (readyState === AccountStatus.ERROR_NETWORK) {
            resetLayer12Data();
            subject.next({
                status: Commands.ErrorNetwork,
                data: undefined,
            })
        } else {
            const {accAddress} = store.getState().account
            accountServices.sendCheckAccount(accAddress);
        }

    },

    //INFO: for lock account todo clear the private info, user click or provider on wrong network
    sendAccountLock: async (accInfo?: sdk.AccountInfo) => {
        const updateInfo = accInfo ? {
            readyState: AccountStatus.LOCKED,
            accountId: accInfo.accountId,
            nonce: accInfo.nonce,
            level: accInfo.tags,
            keyNonce: accInfo.keyNonce,
            keySeed: accInfo.keySeed,
        } : {
            readyState: AccountStatus.LOCKED,
            apiKey: '',
            eddsaKey: '',
            publicKey: '',
            nonce: undefined,
        }
        store.dispatch(updateAccountStatus(updateInfo))
        resetLayer2Data()
        // await sleep(50)


        _.delay(()=>{
            subject.next({
                status: Commands.LockAccount,
                data: undefined,
            })

        },10)

    },
    sendActiveAccountDeposit: () => {
    },
    sendAccountSigned: ({accountId, apiKey, eddsaKey, isReset, nonce, }: {
        accountId?: number, apiKey?: string, eddsaKey?: any, isReset?: boolean, nonce?: number,
    }) => {
        const updateInfo = accountId && apiKey && eddsaKey && nonce !== undefined ? {
            accountId,
            apiKey,
            eddsaKey,
            nonce,
            publicKey: {
                x: sdk.toHex(sdk.toBig(eddsaKey.keyPair.publicKeyX)),
                y: sdk.toHex(sdk.toBig(eddsaKey.keyPair.publicKeyY)),
            },
            readyState: AccountStatus.ACTIVATED
        } : {readyState: AccountStatus.ACTIVATED}

        store.dispatch(updateAccountStatus(updateInfo))

        if (!isReset) {
            subject.next({
                status: Commands.AccountUnlocked,
                data: undefined
            })
        } else {
            myLog('sendAccountSigned: isReset!!!!!')
        }
    },
    sendNoAccount: () => {
        store.dispatch(updateAccountStatus({readyState: AccountStatus.NO_ACCOUNT,}))
        subject.next({
            status: Commands.NoAccount,
            data: undefined
        })
    },
    sendNeedUpdateAccount: async (accInfo: sdk.AccountInfo) => {
        myLog('sendNeedUpdateAccount accInfo:', accInfo)
        store.dispatch(updateAccountStatus({readyState: AccountStatus.NOT_ACTIVE}))
        subject.next({
            status: Commands.SignAccount,
            data: accInfo
        })
    },
    sendCheckAcc: async () => {
        myLog('-------sendCheckAcc enter!')
        if (store) {
            const account = store.getState().account
            if (LoopringAPI.exchangeAPI) {
                const {accInfo} = (await LoopringAPI.exchangeAPI.getAccount({
                    owner: account.accAddress
                }))

                if (accInfo === undefined) {
                    accountServices.sendNoAccount()
                } else {
                    if (account.accountId) {
                        if (!account.publicKey.x || !account.publicKey.y) {
                            myLog('-------sendCheckAcc need update account!')
                            accountServices.sendNeedUpdateAccount(accInfo)
                        } else {
                            myLog('-------need unlockAccount!')
                            unlockAccount()
                        }
                    } else {
                        myLog('unexpected accInfo:', accInfo)
                        throw Error('unexpected accinfo:' + accInfo)
                    }
                }
            }
        }


    },
    sendCheckAccount: async (ethAddress: string) => {
        const self = this;
        myLog('After connect >>,sendCheckAccount: step3 processAccountCheck', ethAddress)
        store.dispatch(updateAccountStatus({accAddress: ethAddress, readyState: AccountStatus.UN_CONNECT}))
        subject.next({
            status: Commands.ProcessAccountCheck,
            data: undefined
        })
        if (LoopringAPI.exchangeAPI) {
            const {accInfo} = (await LoopringAPI.exchangeAPI.getAccount({
                owner: ethAddress
            }))
            myLog('After connect >>,checkAccount: step3', accInfo)

            //TODO code is notaccount
            if (accInfo === undefined) {
                accountServices.sendNoAccount()
            } else {
                if (accInfo.accountId) {
                    if (!accInfo.publicKey.x || !accInfo.publicKey.y) {
                        myLog('-------sendCheckAccount need update account!')
                        accountServices.sendNeedUpdateAccount(accInfo)
                    } else {
                        accountServices.sendAccountLock(accInfo)
                    }
                } else {
                    myLog('unexpected accInfo:', accInfo)
                    throw Error('unexpected accinfo:' + accInfo)
                }
            }
        }

        // try {
        //
        //
        //     if (accInfo && accInfo.accountId) {
        //         await unlockAccount({accInfo, shouldShow: shouldShow ?? false})
        //     }
        //     statusAccountUnset();
        // } catch (reason) {
        //     dumpError400(reason)
        //     await activeAccount({reason, shouldShow: shouldShow ?? false});
        //     statusAccountUnset();
        // }


    },

    onSocket: () => subject.asObservable()
    // clearMessages: () => subject.next(),
    // onSocket: () => subject.asObservable()
};