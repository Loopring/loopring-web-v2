import React from 'react';

import { DepositProps, SwitchData, TradeBtnStatus } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, ConnectProviders, IBData, WalletMap } from '@loopring-web/common-resources';
import * as sdk from 'loopring-sdk';
import { useTokenMap } from '../stores/token';
import { useAccount } from '../stores/account';
import { useSystem } from '../stores/system';
import { connectProvides } from '@loopring-web/web3-provider';
import { useCustomDCEffect } from './common/useCustomDCEffect';
import { myLog } from 'utils/log_tools';


export const useDeposit = <R extends IBData<T>, T>(walletMap1: WalletMap<T> | undefined, ShowDeposit: (isShow: boolean, defaultProps?: any) => void): {
    depositProps: DepositProps<R, T>
} => {
    const {tokenMap, coinMap} = useTokenMap();
    const {account} = useAccount()
    const {exchangeInfo, chainId, gasPrice} = useSystem();
    const [depositValue, setDepositValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)

    const handleDeposit = React.useCallback(async (inputValue: any) => {
        const {accountId, accAddress, readyState, apiKey, connectName, eddsaKey} = account
        if ((readyState !== AccountStatus.UN_CONNECT
            // && readyState !== Acco   untStatus.RESET
            && inputValue.tradeValue)
            && tokenMap && exchangeInfo && connectProvides.usedWeb3) {
            try {
                const tokenInfo = tokenMap[ inputValue.belong ]
                // const gasPrice = gasPrice ?? 20
                const gasLimit = parseInt(tokenInfo.gasAmounts.deposit)
                const nonce = await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)
                const isMetaMask = connectName === ConnectProviders.MetaMask;
                await sdk.approveMax(connectProvides.usedWeb3, account.accAddress, tokenInfo.address,
                    exchangeInfo?.depositAddress, gasPrice ?? 20, gasLimit, chainId === 'unknown' ? undefined : chainId, nonce, isMetaMask)

                const fee = 0

                const response2 = await sdk.deposit(connectProvides.usedWeb3, account.accAddress,
                    exchangeInfo?.exchangeAddress, tokenInfo, inputValue.tradeValue, fee,
                    gasPrice ?? 20, gasLimit, chainId === 'unknown' ? 1 : chainId, nonce + 1, isMetaMask)

                //  myLog('!!!!deposit r:', response2)
                //TODO check success or failed API
            } catch (e) {

            }

        } else {
            return false
        }

    }, [account, tokenMap, chainId, exchangeInfo, gasPrice])

    const [depositProps, setDepositProps] = React.useState<Partial<DepositProps<R, T>>>({
        tradeData: {belong: undefined} as any,
        coinMap: coinMap as CoinMap<any>,
        walletMap: walletMap1 as WalletMap<any>,
        depositBtnStatus: TradeBtnStatus.AVAILABLE,
        onDepositClick: () => {
            if (depositValue && depositValue.belong) {
                handleDeposit(depositValue as R)
            }
            ShowDeposit(false)
        },
        handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res) => {
                if (data?.tradeData?.belong) {
                    if (depositValue !== data.tradeData) {
                        setDepositValue(data.tradeData)
                    }
                    // setTokenSymbol(data.tradeData.belong)
                } else {
                    setDepositValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
                }
                res();
            })
        },
    })

    useCustomDCEffect(() => {
        setDepositProps({
                ...depositProps,
                walletMap: walletMap1 as WalletMap<any>,
            }
        )
    }, [walletMap1])


    return {
        // handleDeposit,
        depositProps: depositProps as DepositProps<R, T>,
    }
}

// const [depositValue, setDepositValue] = React.useState<IBData<any>>({
//     belong: undefined,
//     tradeValue: 0,
//     balance: 0
// } as IBData<unknown>)
// const checkAccountStatus  = useCallback(()=>{
//
//     return false;
// },[account,ConnectProvides])
// const deposit = useCallback(async (token: string, amt: any) => {
//     if (!LoopringAPI.exchangeAPI || !tokenMap || !account.accAddress || !ConnectProvides.usedWeb3 || !exchangeInfo?.exchangeAddress || !exchangeInfo?.depositAddress) {
//         return
//     }
//
//     try {
//         const tokenInfo: TokenInfo = tokenMap[ token ]
// const provider = await connector.getProvider()
// const web3 = new Web3(provider as any)
// const  ConnectProvides
// let sendByMetaMask = account.connectName === ConnectorNames.Injected
// let sendByMetaMask = true;
// const gasPrice = store.getState().system.gasPrice ?? 20
// const gasLimit = parseInt(tokenInfo.gasAmounts.deposit)
//     } catch (reason) {
//         dumpError400(reason)
//     }
//
// }, [chainId, ConnectProvides, account, tokenMap])
// let depositProps: DepositProps<any, any> = {
//     tradeData: {belong: undefined},
//     coinMap: coinMap as CoinMap<any>,
//     walletMap: walletMap1 as WalletMap<any>,
//     depositBtnStatus: TradeBtnStatus.AVAILABLE,
//     onDepositClick: (tradeData: any) => {
//         if (depositValue && depositValue.belong) {
//             deposit(depositValue.belong.toString(), depositValue.tradeValue)
//         }
//         ShowDeposit(false)
//     },
//     handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
//         return new Promise((res) => {
//             if (data?.tradeData?.belong) {
//                 if (depositValue !== data.tradeData) {
//                     setDepositValue(data.tradeData)
//                 }
//                 setTokenSymbol(data.tradeData.belong)
//             } else {
//                 setDepositValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
//             }
//             res();
//         })
//     },
// }
