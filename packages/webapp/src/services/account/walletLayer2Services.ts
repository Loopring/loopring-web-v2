import { Account, AccountStatus } from '@loopring-web/common-resources';
import { Subject } from 'rxjs';
import { Commands } from './command';
import { LoopringAPI } from '../../stores/apis/api';
import { myLog } from '../../utils/log_tools';
import store from 'stores';
import { updateAccountStatus } from 'stores/account';
import { AccountInfo, toBig, toHex } from 'loopring-sdk';

const subject = new Subject<{ status: keyof typeof Commands, data: any, }>();

function getLocalDepositHash(account: Account): { [ key: string ]: any } | undefined {
    let depositsHash = window.localStorage.getItem('__loopring__.depositsHash');
    if (depositsHash) {
        depositsHash = JSON.parse(depositsHash);
        if (depositsHash && depositsHash[ account.accAddress ]) {
            return depositsHash[ account.accAddress ]
        }
    }
    return undefined
}

function clearDepositHash(account: Account, value: string) {
    // @ts-ignore
    let depositsHash: { [ key: string ]: object } = window.localStorage.getItem('__loopring__.depositsHash');
    depositsHash = depositsHash ? JSON.parse(depositsHash as any) : {};
    if (depositsHash[ account.accAddress ] && depositsHash[ account.accAddress ][ value ]) {
        delete depositsHash[ account.accAddress ][ value ];
    }
}

function setLocalDepositHash(account: Account, value: string): void {
    // @ts-ignore
    let depositsHash: { [ key: string ]: object } = window.localStorage.getItem('__loopring__.depositsHash');
    depositsHash = depositsHash ? JSON.parse(depositsHash as any) : {};
    depositsHash[ account.accAddress ] = {
        ...depositsHash[ account.accAddress ],
        [ value ]: 1,
    }
}

export const walletLayer2Services = {
    //INFO: for update Account and unlock account
    sendSign: () => {
        subject.next({
            status: Commands.ProcessSign,
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
            nonce:undefined,
        }))
    },

    //INFO: for lock account todo clear the private info, user click or provider on wrong network
    sendAccountLock: (accInfo?: AccountInfo) => {
        const updateInfo = accInfo ? {
            readyState:AccountStatus.LOCKED,
            accountId: accInfo.accountId,
            nonce: accInfo.nonce,
            level: accInfo.tags,
        }:{readyState:AccountStatus.LOCKED,
            apiKey: '',
            eddsaKey: '',
            publicKey: '',
            nonce: undefined,}
        store.dispatch(updateAccountStatus(updateInfo))
        subject.next({
            status: Commands.LockAccount,
            data: undefined,
        })
    },
    sendActiveAccountDeposit: () => {

    },
    sendAccountSigned: (apiKey?:any,eddsaKey?:any) => {
        const updateInfo = apiKey && eddsaKey ?{
            apiKey,
            eddsaKey,
            publicKey: {
                x: toHex(toBig(eddsaKey.keyPair.publicKeyX)),
                y: toHex(toBig(eddsaKey.keyPair.publicKeyY)),
            },
            readyState: AccountStatus.ACTIVATED
        }:{readyState:AccountStatus.ACTIVATED}
        store.dispatch(updateAccountStatus(updateInfo));
        subject.next({
            status: Commands.AccountUnlocked,
            data: undefined
        })
    },
    sendNoAccount: () => {
        store.dispatch(updateAccountStatus({readyState:AccountStatus.NO_ACCOUNT, }))
        subject.next({
            status: Commands.NoAccount,
            data: undefined
        })
    },
    sendCheckAccount: async (ethAddress: string) => {
        const self = this;
        myLog('After connect >>,checkAccount: step3 processAccountCheck')
        subject.next({
            status: Commands.ProcessAccountCheck,
            data: undefined
        })
        if (LoopringAPI.exchangeAPI) {
            const {accInfo} = (await LoopringAPI.exchangeAPI.getAccount({
                owner: ethAddress
            }))
            myLog('After connect >>,checkAccount: step3',accInfo)

            //TODO code is notaccount
            if (accInfo === undefined) {
                walletLayer2Services.sendNoAccount()
                // subject.next({
                //     status: Commands.NoAccount,
                //     data:undefined
                // })
            } else {
                walletLayer2Services.sendAccountLock(accInfo)
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