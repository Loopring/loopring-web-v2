import { updateAccountStatus } from '../../stores/account';
import { AccountStep, setShowAccount, setShowConnect } from '@loopring-web/component-lib';
import store from '../../stores';
import { AccountStatus } from '@loopring-web/common-resources';
import { myLog } from 'utils/log_tools';
import { LoopringAPI } from 'stores/apis/api';
import { connectProvides } from '@loopring-web/web3-provider';
import * as sdk from 'loopring-sdk'
import { REFRESH_RATE } from 'defs/common_defs';

export async function activeAccount({ reason, shouldShow }: { reason: any, shouldShow: boolean }) {
    const account = store.getState().account;
    // const {exchangeInfo} = store.getState().system;
    if (reason?.response?.data?.resultInfo?.code === 100001) {
        // deposited, but need update account
        console.log('SignAccount')
        store.dispatch(setShowConnect({ isShow: false }));
        store.dispatch(setShowAccount({ isShow: true, step: AccountStep.SignAccount }));
        store.dispatch(updateAccountStatus({ readyState: AccountStatus.DEPOSITING }));

    } else {
        // need to deposit.
        let activeDeposit = localStorage.getItem('activeDeposit');
        if (activeDeposit) {
            activeDeposit = JSON.stringify(activeDeposit);
        }
        if (activeDeposit && activeDeposit[account.accAddress]) {
            console.log('DEPOSITING')
            store.dispatch(setShowConnect({ isShow: false }));
            store.dispatch(setShowAccount({ isShow: shouldShow, step: AccountStep.Depositing }));
            store.dispatch(updateAccountStatus({ readyState: AccountStatus.DEPOSITING }));
            // store.dispatch(statusAccountUnset(undefined))
        } else {
            console.log('NO_ACCOUNT')
            setShowConnect({ isShow: false });
            setShowAccount({ isShow: shouldShow, step: AccountStep.NoAccount });
            store.dispatch(updateAccountStatus({ readyState: AccountStatus.NO_ACCOUNT }));
            // store.dispatch(statusAccountUnset(undefined));
        }
    }
}

export enum UpdateAccountResult {
    NoError,
    GetAccError,
    GenEddsaKeyError,
    UpdateAccoutError,
}

export async function updateAccountFromServer() {

    const system = store.getState().system
    const account = store.getState().account

    myLog('before check!', account)

    try {

        if (LoopringAPI.userAPI && LoopringAPI.exchangeAPI && system.exchangeInfo && connectProvides.usedWeb3 && account
            && system.chainId !== 'unknown' && account.connectName !== 'unknown') {
            const feeMap = {
                'ETH': '529000000000000',
                'LRC': '34000000000000000000',
                'USDT': '7850000',
                'DAI': '98100000000000000000',
            }

            const { accInfo } = (await LoopringAPI.exchangeAPI.getAccount({
                owner: account.accAddress
            }))

            if (accInfo?.owner && accInfo?.accountId) {

                const connectName = account.connectName as sdk.ConnectorNames

                try {
                    const eddsaKey = await sdk
                        .generateKeyPair(
                            connectProvides.usedWeb3,
                            accInfo.owner,
                            system.exchangeInfo.exchangeAddress,
                            accInfo.keyNonce as number,
                            connectName,
                        )

                    try {
                        const request: sdk.UpdateAccountRequestV3 = {
                            exchange: system.exchangeInfo.exchangeAddress,
                            owner: accInfo.owner,
                            accountId: accInfo.accountId,
                            publicKey: { x: eddsaKey.formatedPx, y: eddsaKey.formatedPy },
                            maxFee: { tokenId: 0, volume: feeMap['ETH'] },
                            validUntil: sdk.VALID_UNTIL,
                            nonce: accInfo.nonce as number,
                        }

                        myLog('req:', request)

                        const updateAccountResponse = await LoopringAPI.userAPI.updateAccount(request,
                            connectProvides.usedWeb3, system.chainId, connectName)

                        await sdk.sleep(REFRESH_RATE)

                        myLog('updateAccountResponse:', updateAccountResponse)

                    } catch (reason) {

                        return UpdateAccountResult.UpdateAccoutError

                    }


                } catch (reason) {

                    return UpdateAccountResult.GenEddsaKeyError

                }

            }

        }

    } catch (reason) {

        return UpdateAccountResult.GetAccError

    }

    return UpdateAccountResult.NoError
}