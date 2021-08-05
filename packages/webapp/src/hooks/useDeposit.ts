import React, { useCallback } from 'react';

import { DepositProps, SwitchData, TradeBtnStatus } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, ConnectProviders, IBData, WalletMap } from '@loopring-web/common-resources';
import * as sdk from 'loopring-sdk';
import { useTokenMap } from '../stores/token';
import { useAccount } from '../stores/account';
import { useSystem } from '../stores/system';
import { connectProvides } from '@loopring-web/web3-provider';
import { useCustomDCEffect } from './common/useCustomDCEffect';
import { LoopringAPI } from 'stores/apis/api';
import { ApproveVal, dumpError400, GetAllowancesRequest } from 'loopring-sdk';
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

        console.log(LoopringAPI.exchangeAPI, connectProvides.usedWeb3)
        if ((readyState !== AccountStatus.UN_CONNECT
            && inputValue.tradeValue)
            && tokenMap && exchangeInfo && connectProvides.usedWeb3 && LoopringAPI.exchangeAPI) {
            try {
                const tokenInfo = tokenMap[inputValue.belong]
                const gasLimit = parseInt(tokenInfo.gasAmounts.deposit)
                let nonce = await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)

                const fee = 0
                
                const isMetaMask = connectName === ConnectProviders.MetaMask

                const req: GetAllowancesRequest = { owner: account.accAddress, token: tokenInfo.symbol}

                const { tokenAllowances } = await LoopringAPI.exchangeAPI.getAllowances(req, tokenMap)

                const allowance = sdk.toBig(tokenAllowances[tokenInfo.symbol])

                const curValInWei = sdk.toBig(inputValue.tradeValue).times('1e' + tokenInfo.decimals)

                myLog(curValInWei.toString(), allowance.toString())

                if (curValInWei.gt(allowance)) {
                    myLog(curValInWei, allowance, ' need approveMax!')
                    await sdk.approveMax(connectProvides.usedWeb3, account.accAddress, tokenInfo.address,
                        exchangeInfo?.depositAddress, gasPrice ?? 30, gasLimit, chainId === 'unknown' ? undefined : chainId, nonce, isMetaMask)
                    nonce += 1
                } else {
                    myLog('allowance is enough! don\'t need approveMax!')
                }

                const response2 = await sdk.deposit(connectProvides.usedWeb3, account.accAddress,
                    exchangeInfo?.exchangeAddress, tokenInfo, inputValue.tradeValue, fee,
                    gasPrice ?? 20, gasLimit, chainId === 'unknown' ? 1 : chainId, nonce + 1, isMetaMask)

                //TODO check success or failed API
            } catch (e) {

                dumpError400(e)

            }

        } else {
            return false
        }

    }, [account, tokenMap, chainId, exchangeInfo, gasPrice, LoopringAPI.exchangeAPI])

    const onDepositClick = useCallback((depositValue) => {
        console.log('onDepositClick depositValue:', depositValue)
        if (depositValue && depositValue.belong) {
            handleDeposit(depositValue as R)
        }
        ShowDeposit(false)
    }, [depositValue, handleDeposit, ShowDeposit])

    const handlePanelEvent = useCallback(async(data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise<void>((res: any) => {
            res();
        })
    }, [depositValue, setDepositValue])

    const [depositProps, setDepositProps] = React.useState<Partial<DepositProps<R, T>>>({
        tradeData: {belong: undefined} as any,
        coinMap: coinMap as CoinMap<any>,
        walletMap: walletMap1 as WalletMap<any>,
        depositBtnStatus: TradeBtnStatus.AVAILABLE,
        onDepositClick,
        handlePanelEvent,
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
