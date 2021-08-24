import React, { useCallback } from 'react';

import { AccountStep, DepositProps, SwitchData, TradeBtnStatus, useOpenModals } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, ConnectProviders, IBData, WalletMap } from '@loopring-web/common-resources';
import * as sdk from 'loopring-sdk';
import { dumpError400, GetAllowancesRequest } from 'loopring-sdk';
import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { useSystem } from 'stores/system';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from 'api_wrapper';
import { myLog } from 'utils/log_tools';
import { useWalletLayer1 } from 'stores/walletLayer1';
import { useTranslation } from 'react-i18next';
import { ActionResult, ActionResultCode } from 'defs/common_defs';
import { makeWalletLayer2 } from 'hooks/help';
import { useWalletHook } from 'services/wallet/useWalletHook';
import store from 'stores';

export const useDeposit = <R extends IBData<T>, T>(): {
    depositProps: DepositProps<R, T>
} => {
    const {tokenMap, totalCoinMap,} = useTokenMap()
    const {account} = useAccount()
    const {exchangeInfo, chainId, gasPrice} = useSystem()
    const [depositValue, setDepositValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)

    const { walletLayer1 } = useWalletLayer1()
    const {setShowDeposit, setShowAccount} = useOpenModals()
    const {t} = useTranslation('common')

    const  walletLayer1Callback = React.useCallback(()=>{

        if (walletLayer1) {
            const keys = Reflect.ownKeys(walletLayer1)
            for (var key in keys) {
                const keyVal = keys[key] as any
                const walletInfo = walletLayer1[keyVal]
                if (sdk.toBig(walletInfo.count).gt(0)) {
                    
                    setDepositValue({
                       belong: keyVal as any,
                       tradeValue: 0,
                       balance: walletInfo.count,
                   })

                   return
                }
            }
        }
    },[walletLayer1, setDepositValue, ])

    useWalletHook({ walletLayer1Callback })

    // walletMap1: WalletMap<T> | undefined, ShowDeposit: (isShow: boolean, defaultProps?: any) => void
    const handleDeposit = React.useCallback(async (inputValue: any) => {
        const {readyState, connectName} = account

        console.log(LoopringAPI.exchangeAPI, connectProvides.usedWeb3)

        let result: ActionResult = {code: ActionResultCode.NoError}

        if ((readyState !== AccountStatus.UN_CONNECT
            && inputValue.tradeValue)
            && tokenMap && exchangeInfo?.exchangeAddress
            && connectProvides.usedWeb3 && LoopringAPI.exchangeAPI) {
            try {
                const tokenInfo = tokenMap[ inputValue.belong ]
                const gasLimit = parseInt(tokenInfo.gasAmounts.deposit)
                let nonce = await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)

                const fee = 0

                const isMetaMask = connectName === ConnectProviders.MetaMask

                const realGasPrice = gasPrice ?? 30

                if (tokenInfo.symbol.toUpperCase() !== 'ETH') {

                    const req: GetAllowancesRequest = {owner: account.accAddress, token: tokenInfo.symbol}

                    const {tokenAllowances} = await LoopringAPI.exchangeAPI.getAllowances(req, tokenMap)

                    const allowance = sdk.toBig(tokenAllowances[ tokenInfo.symbol ])

                    const curValInWei = sdk.toBig(inputValue.tradeValue).times('1e' + tokenInfo.decimals)

                    if (curValInWei.gt(allowance)) {

                        myLog(curValInWei, allowance, ' need approveMax!')

                        setShowAccount({isShow: true, step: AccountStep.TokenApproveInProcess})

                        try {
                            await sdk.approveMax(connectProvides.usedWeb3, account.accAddress, tokenInfo.address,
                                exchangeInfo?.depositAddress, realGasPrice, gasLimit, chainId === 'unknown' ? undefined : chainId, nonce, isMetaMask)
                            nonce += 1
                        } catch (reason) {
                            result.code = ActionResultCode.ApproveFailed
                            result.data = reason

                            setShowAccount({isShow: true, step: AccountStep.TokenApproveFailed})
                            return
                        }

                    } else {
                        myLog('allowance is enough! don\'t need approveMax!')
                    }

                }

                setShowAccount({isShow: true, step: AccountStep.DepositInProcess})

                myLog('before deposit:', chainId, connectName, isMetaMask)

                const realChainId = chainId === 'unknown' ? 1 : chainId

                const response = await sdk.deposit(connectProvides.usedWeb3, account.accAddress,
                    exchangeInfo.exchangeAddress, tokenInfo, inputValue.tradeValue, fee,
                    realGasPrice, gasLimit, realChainId, nonce, isMetaMask)

                myLog('response:', response)

                result.data = response

                if (response?.hash === undefined && response?.errInfo) {
                    // deposit failed
                    setShowAccount({isShow: true, step: AccountStep.DepositFailed})
                } else {
                    // deposit sucess
                    setShowAccount({isShow: true, step: AccountStep.Depositing})
                }

            } catch (reason) {
                dumpError400(reason)
                result.code = ActionResultCode.DepositFailed
                result.data = reason

                //deposit failed
                setShowAccount({isShow: true, step: AccountStep.DepositFailed})
            }

        } else {
            result.code = ActionResultCode.DataNotReady
        }

        return result

    }, [account, tokenMap, chainId, exchangeInfo, gasPrice, LoopringAPI.exchangeAPI, setShowAccount])

    const onDepositClick = useCallback(async (depositValue) => {
        myLog('onDepositClick depositValue:', depositValue)
        setShowDeposit({isShow: false})

        if (depositValue && depositValue.belong) {
            await handleDeposit(depositValue as R)
        }

    }, [depositValue, handleDeposit, setShowDeposit, setShowAccount])

    const handlePanelEvent = useCallback(async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise<void>((res: any) => {
            res();
        })
    }, [depositValue, setDepositValue])


    const depositProps = React.useMemo(() => {
        const isNewAccount = account.readyState === AccountStatus.NO_ACCOUNT ? true : false;
        const title = account.readyState === AccountStatus.NO_ACCOUNT ? t('labelCreateLayer2Title') : t('depositTitle');
        return {
            isNewAccount,
            title,
            tradeData: depositValue as any,
            coinMap: totalCoinMap as CoinMap<any>,
            walletMap: walletLayer1 as WalletMap<any>,
            depositBtnStatus: TradeBtnStatus.AVAILABLE,
            onDepositClick,
        }
    }, [account.readyState, totalCoinMap, walletLayer1, onDepositClick])

    return {
        depositProps,
    }
}
