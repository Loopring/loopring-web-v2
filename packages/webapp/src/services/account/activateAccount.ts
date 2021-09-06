import { updateAccountStatus } from '../../stores/account';
import { AccountStep, setShowAccount, setShowConnect } from '@loopring-web/component-lib';
import store from '../../stores';
import { AccountStatus } from '@loopring-web/common-resources';
import { myLog } from "@loopring-web/common-resources";
import { LoopringAPI } from 'api_wrapper';
import { connectProvides } from '@loopring-web/web3-provider';
import * as sdk from 'loopring-sdk'
import { dumpError400 } from 'loopring-sdk'
import { ActionResult, ActionResultCode, DAYS, } from 'defs/common_defs';
import { getTimestampDaysLater } from 'utils/dt_tools';

export async function activeAccount({reason, shouldShow}: { reason: any, shouldShow: boolean }) {
    const account = store.getState().account;
    // const {exchangeInfo} = store.getState().system;
    if (reason?.response?.data?.resultInfo?.code === 100001) {
        // deposited, but need update account
        myLog('SignAccount')
        store.dispatch(setShowConnect({isShow: false}));
        store.dispatch(setShowAccount({isShow: true, step: AccountStep.UpdateAccount}));
        store.dispatch(updateAccountStatus({readyState: AccountStatus.DEPOSITING}));

    } else {
        // need to deposit.
        let activeDeposit = localStorage.getItem('activeDeposit');
        if (activeDeposit) {
            activeDeposit = JSON.stringify(activeDeposit);
        }
        if (activeDeposit && activeDeposit[ account.accAddress ]) {
            myLog('DEPOSITING')
            store.dispatch(setShowConnect({isShow: false}));
            store.dispatch(setShowAccount({isShow: shouldShow, step: AccountStep.Deposit_Submit}));
            store.dispatch(updateAccountStatus({readyState: AccountStatus.DEPOSITING}));
            // store.dispatch(statusAccountUnset(undefined))
        } else {
            myLog('NO_ACCOUNT')
            setShowConnect({isShow: false});
            setShowAccount({isShow: shouldShow, step: AccountStep.NoAccount});
            store.dispatch(updateAccountStatus({readyState: AccountStatus.NO_ACCOUNT}));
            // store.dispatch(statusAccountUnset(undefined));
        }
    }
}

export async function updateAccountFromServer({isHWAddr,}: { isHWAddr: boolean, }) {

    const system = store.getState().system
    const account = store.getState().account

    let eddsaKey = account.eddsaKey

    myLog('before check!', account)

    let result: ActionResult = {code: ActionResultCode.NoError,}

    try {

        if (LoopringAPI.userAPI && LoopringAPI.exchangeAPI && system.exchangeInfo && connectProvides.usedWeb3 && account
            && system.chainId !== 'unknown' && account.connectName !== 'unknown') {

            const {accInfo} = (await LoopringAPI.exchangeAPI.getAccount({
                owner: account.accAddress
            }))

            if (accInfo?.owner && accInfo?.accountId) {

                const connectName = account.connectName as sdk.ConnectorNames

                try {
                    if (!eddsaKey) {
                        myLog('no eddsaKey ！!')
                        eddsaKey = await sdk
                            .generateKeyPair(
                                connectProvides.usedWeb3,
                                accInfo.owner,
                                system.exchangeInfo.exchangeAddress,
                                accInfo.nonce,
                                connectName,
                            )
                        myLog('no eddsaKey! after generateKeyPair')
                    }

                    try {

                        const feeMap = {
                            'ETH': '529000000000000',
                            'LRC': '34000000000000000000',
                            'USDT': '7850000',
                            'DAI': '98100000000000000000',
                        }

                        myLog('fee:', sdk.toBig(feeMap[ 'ETH' ]).div('1e18').toNumber())

                        const request: sdk.UpdateAccountRequestV3 = {
                            exchange: system.exchangeInfo.exchangeAddress,
                            owner: accInfo.owner,
                            accountId: accInfo.accountId,
                            publicKey: {x: eddsaKey.formatedPx, y: eddsaKey.formatedPy,},
                            maxFee: {tokenId: 0, volume: feeMap[ 'ETH' ]},
                            validUntil: getTimestampDaysLater(DAYS),
                            nonce: accInfo.nonce as number,
                        }

                        myLog('updateAccountFromServer req:', request)

                        const updateAccountResponse = await LoopringAPI.userAPI.updateAccount({
                            request,
                            web3: connectProvides.usedWeb3,
                            chainId: system.chainId,
                            walletType: connectName,
                            isHWAddr,
                        })

                        myLog('updateAccountResponse:', updateAccountResponse)

                        if (updateAccountResponse.errorInfo) {
                            result.code = ActionResultCode.UpdateAccoutError
                            result.data = {
                                eddsaKey,
                                errorInfo: updateAccountResponse.errorInfo,
                            }
                        } else {
                            result.data = {
                                response: updateAccountResponse,
                                eddsaKey,
                            }
                        }

                    } catch (reason) {
                        result.code = ActionResultCode.UpdateAccoutError
                        result.data = {
                            errorInfo: reason
                        }
                        dumpError400(reason)
                    }

                } catch (reason) {

                    myLog('GenEddsaKeyError!!!!!! ')

                    result.code = ActionResultCode.GenEddsaKeyError
                    result.data = {
                        errorInfo: reason
                    }
                    dumpError400(reason)
                }
            }
        }
    } catch (reason) {

        myLog('other error!!!!!!! ')
        result.code = ActionResultCode.GetAccError
        result.data = reason
        dumpError400(reason)
    }

    return result
}