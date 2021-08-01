import React, { useState } from 'react';

import { SwitchData, TradeBtnStatus, WithdrawProps } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, IBData, WalletMap } from '@loopring-web/common-resources';
import { ConnectorNames, OffchainFeeReqType, toBig, VALID_UNTIL } from 'loopring-sdk';
import { useTokenMap } from '../stores/token';
import { useAccount } from '../stores/account';
import { useChargeFees } from './useChargeFees';
import { useCustomDCEffect } from './common/useCustomDCEffect';
import { LoopringAPI } from '../stores/apis/api';
import { useSystem } from '../stores/system';
import { connectProvides } from '@loopring-web/web3-provider';
// import { useCustomDCEffect } from '../../hooks/common/useCustomDCEffect';
// import { useChargeFeeList } from './hook';

export const useWithdraw = <R extends IBData<T>, T>(walletMap2: WalletMap<T> | undefined, ShowWithdraw: (isShow: boolean, defaultProps?: any) => void): {
    // handleWithdraw: (inputValue:R) => void,
    withdrawProps: WithdrawProps<R, T>
    // withdrawValue: R
} => {
    const {tokenMap, coinMap} = useTokenMap();
    const {account} = useAccount()
    const {exchangeInfo, chainId} = useSystem();
    const [withdrawFeeInfo, setWithdrawFeeInfo] = useState<{ belong: string, fee: any, __raw__: any } | undefined>(undefined)
    const [withdrawValue, setWithdrawValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)
    const {chargeFeeList} = useChargeFees(withdrawValue.belong, OffchainFeeReqType.TRANSFER, tokenMap)
    const [withdrawAddr, setWithdrawAddr] = useState<string>()
    const [feeInfo, setFeeInfo] = React.useState<any>()

    useCustomDCEffect(() => {
        if (chargeFeeList.length > 0) {
            setWithdrawFeeInfo(chargeFeeList[ 0 ])
        }
    }, [chargeFeeList])
    const handleWithdraw = React.useCallback(async (inputValue: R) => {
        const {accountId, accAddress, readyState, apiKey, connectName, eddsaKey} = account
        if (readyState === AccountStatus.ACTIVATED && tokenMap && exchangeInfo && connectProvides.usedWeb3 && withdrawAddr && withdrawFeeInfo) {
            try {
                const withdrawToken = tokenMap[ inputValue.belong as string ]
                const feeToken = tokenMap[ feeInfo.belong ]
                const withdrawVol = toBig(inputValue.tradeValue).times('1e' + withdrawToken.decimals).toFixed(0, 0)
                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId: accountId,
                    sellTokenId: withdrawToken.tokenId
                }, apiKey)
                const response = await await LoopringAPI.userAPI?.submitOffchainWithdraw({
                        exchange: exchangeInfo.exchangeAddress,
                        owner: accAddress,
                        to: withdrawAddr,
                        accountId: account.accountId,
                        storageId: storageId?.offchainId,
                        token: {
                            tokenId: withdrawToken.tokenId,
                            volume: withdrawVol,
                        },
                        maxFee: {
                            tokenId: feeToken.tokenId,
                            volume: withdrawFeeInfo.__raw__,
                        },
                        extraData: '',
                        minGas: 0,
                        validUntil: VALID_UNTIL,
                    },
                    connectProvides.usedWeb3,
                    chainId === 'unknown' ? 1 : chainId, connectName as ConnectorNames,
                    eddsaKey, apiKey)
                //TODO check success or failed API
            } catch (e) {

            }

        } else {
            return false
        }

    }, [account, tokenMap, feeInfo])
    const [withdrawProps, setWithdrawProps] = React.useState<Partial<WithdrawProps<R, T>>>({
        tradeData: {belong: undefined} as any,
        coinMap: coinMap as CoinMap<T>,
        walletMap: walletMap2 as WalletMap<any>,
        withdrawBtnStatus: TradeBtnStatus.AVAILABLE,
        onWithdrawClick: () => {
            if (withdrawValue && withdrawValue.belong) {
                handleWithdraw(withdrawValue as R)
            }

            ShowWithdraw(false)
        },
        handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
            setFeeInfo(value)
        },
        handlePanelEvent: async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res: any) => {
                if (data?.tradeData?.belong) {
                    if (withdrawValue !== data.tradeData) {
                        setWithdrawValue(data.tradeData)
                    }
                    // setWithdrawTokenSymbol(data.tradeData.belong)
                } else {
                    setWithdrawValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
                }
                // else{
                //     setWithdrawValue({ belong: undefined, amt: 0 })
                // }

                res();
            })
        },
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
            // myLog('withdraw handleOnAddressChange', value);
            setWithdrawAddr(value)
        },
        handleAddressError: (_value: any) => {
            return {error: false, message: ''}
        }
    })

    React.useEffect(() => {
        setWithdrawProps({
                ...withdrawProps,
                walletMap: walletMap2 as WalletMap<any>,
            }
        )
    }, [walletMap2])


    return {
        // handleWithdraw,
        withdrawProps: withdrawProps as WithdrawProps<R, T>,
    }
}

// // withdraw
// const [withdrawValue, setWithdrawValue] = useState<IBData<any>>({
//     belong: undefined,
//     tradeValue: 0,
//     balance: 0
// } as IBData<unknown>);
//
// const [tokenSymbol, setTokenSymbol] = useState<string>('')
// const [withdrawType, setWithdrawType] = useState<OffchainFeeReqType>(OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)
// const {chargeFeeList: withdrawalFeeList} = useChargeFeeList(tokenSymbol, withdrawType, tokenMap, withdrawValue.tradeValue)
//
// const withdrawType2 = withdrawType === OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL ? 'Fast' : 'Standard'
// const [withdrawFeeInfo, setWithdrawFeeInfo] = useState<any>()
//
// const [withdrawAddr, setWithdrawAddr] = useState<string>()
//
// useCustomDCEffect(() => {
//
//     if (withdrawalFeeList.length > 0) {
//         setWithdrawFeeInfo(withdrawalFeeList[ 0 ])
//     }
//
// }, [withdrawalFeeList])
//
// const withdraw = useCallback(async (withdrawValue: any) => {
//
//     const exchangeInfo = store.getState().system.exchangeInfo

// if (!LoopringAPI.userAPI || !account || !account.accountId || !account.accAddr
//     || !connector || !chainId || !apiKey || !exchangeInfo
//     || !exchangeInfo.exchangeAddress || !withdrawFeeInfo
//     || !withdrawValue || !tokenMap || !withdrawAddr) {
//     console.error('withdraw return directly!', account, connector, chainId, apiKey, exchangeInfo)
//     console.error('withdraw return directly!', withdrawValue, withdrawFeeInfo, tokenMap)
//     return
// }

// const symbol = withdrawValue.belong as string


// const amt = toBig(withdrawValue.tradeValue).times('1e' + withdrawToken.decimals).toFixed(0, 0)

// try {

// const request: GetNextStorageIdRequest = {
//     accountId: account.accountId,
//     sellTokenId: withdrawToken.tokenId
// }
//
// const storageId = await LoopringAPI.userAPI.getNextStorageId(request, apiKey)

// const request2: OffChainWithdrawalRequestV3 = {
//
// }

//     const provider = await connector.getProvider()
//     const web3 = new Web3(provider as any)
//
//     const response = await LoopringAPI.userAPI.submitOffchainWithdraw(request2, web3, chainId, ConnectorNames.Injected,
//         account.eddsaKey, apiKey, false)
//
//     myLog(response)
//
// } catch (reason) {
//     dumpError400(reason)
// }

// }, [apiKey, account, connector, chainId, withdrawFeeInfo, tokenMap, withdrawAddr])
//
// let withdrawProps: WithdrawProps<any, any> = {
//     tradeData: {belong: undefined},
//     coinMap: coinMap as CoinMap<any>,
//     walletMap: walletMap2 as WalletMap<any>,
//     withdrawBtnStatus: TradeBtnStatus.AVAILABLE,
//     onWithdrawClick: (tradeData: any) => {
//         if (withdrawValue && withdrawValue.belong) {
//             withdraw(withdrawValue)
//         }
//         ShowWithdraw(false)
//     },
//
//     handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
//         return new Promise((res: any) => {
//             if (data?.tradeData?.belong) {
//                 if (withdrawValue !== data.tradeData) {
//                     setWithdrawValue(data.tradeData)
//                 }
//                 setTokenSymbol(data.tradeData.belong)
//             } else {
//                 setWithdrawValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>);
//             }
//             res();
//         })
//     },
//     withdrawType: withdrawType2,
//     withdrawTypes: WithdrawTypes,
//     chargeFeeToken: 'ETH',
//     chargeFeeTokenList: withdrawalFeeList,
//     handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
//         myLog('handleWithdrawFee', value);
//         setWithdrawFeeInfo(value)
//     },
//     handleWithdrawTypeChange: (value: any) => {
//         myLog('handleWithdrawTypeChange', value)
//         const offchainType = value === WithdrawType.Fast ? OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL : OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
//         setWithdrawType(offchainType)
//     },
//     handleOnAddressChange: (value: any) => {
//         myLog('handleOnAddressChange', value);
//         setWithdrawAddr(value)
//     },
//     handleAddressError: (_value: any) => {
//         return {error: false, message: ''}
//     }
// }
