import React from 'react';

import { SwitchData, TradeBtnStatus, TransferProps } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, IBData, WalletMap } from '@loopring-web/common-resources';
import { ConnectorNames, OffchainFeeReqType, toBig, VALID_UNTIL } from 'loopring-sdk';
import { useTokenMap } from '../stores/token';
import { useAccount } from '../stores/account';
import { useChargeFees } from './useChargeFees';
import { LoopringAPI } from '../stores/apis/api';
import { useSystem } from '../stores/system';
import { connectProvides } from '@loopring-web/web3-provider';
// import { useCustomDCEffect } from '../../hooks/common/useCustomDCEffect';
// import { useChargeFeeList } from './hook';

export const useTransfer = <R extends IBData<T>, T>(walletMap2: WalletMap<T> | undefined, ShowTransfer: (isShow: boolean, defaultProps?: any) => void): {
    // handleTransfer: (inputValue:R) => void,
    transferProps: TransferProps<R, T>
    // transferValue: R
} => {
    const {tokenMap, coinMap} = useTokenMap();
    const {account} = useAccount()
    const {exchangeInfo, chainId} = useSystem();
    const [transferValue, setTransferValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)
    const {chargeFeeList} = useChargeFees(transferValue.belong, OffchainFeeReqType.TRANSFER, tokenMap)

    const [feeInfo, setFeeInfo] = React.useState<any>()
    const [payeeAddr, setPayeeAddr] = React.useState<string>('');

    // useCustomDCEffect(() => {
    //     if (chargeFeeList.length > 0) {
    //         setFeeInfo(chargeFeeList[ 0 ])
    //     }
    // }, [chargeFeeList])
    const handleTransfer = React.useCallback(async (inputValue: R) => {
        const {accountId, accAddress, readyState, apiKey, connectName, eddsaKey} = account
        if (readyState === AccountStatus.ACTIVATED && tokenMap && exchangeInfo && connectProvides.usedWeb3) {
            try {
                const sellToken = tokenMap[ inputValue.belong as string ]
                const feeToken = tokenMap[ feeInfo.belong ]
                const transferVol = toBig(inputValue.tradeValue).times('1e' + sellToken.decimals).toFixed(0, 0)
                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId: accountId,
                    sellTokenId: sellToken.tokenId
                }, apiKey)
                const response = await LoopringAPI.userAPI?.submitInternalTransfer({
                        exchange: exchangeInfo.exchangeAddress,
                        payerAddr: accAddress,
                        payerId: accountId,
                        payeeAddr,
                        payeeId: 0,
                        storageId: storageId?.offchainId,
                        token: {
                            tokenId: sellToken.tokenId,
                            volume: transferVol,
                        },
                        maxFee: {
                            tokenId: feeToken.tokenId,
                            volume: feeInfo.__raw__,
                        },
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
    const [transferProps, setTransferProps] = React.useState<Partial<TransferProps<R, T>>>({
        tradeData: {belong: undefined} as any,
        coinMap: coinMap as CoinMap<T>,
        walletMap: walletMap2 as WalletMap<any>,
        transferBtnStatus: TradeBtnStatus.AVAILABLE,
        onTransferClick: () => {
            if (transferValue && transferValue.belong) {
                handleTransfer(transferValue as R)
            }

            ShowTransfer(false)
        },
        handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
            setFeeInfo(value)
        },
        handlePanelEvent: async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
            return new Promise((res: any) => {
                if (data?.tradeData?.belong) {
                    if (transferValue !== data.tradeData) {
                        setTransferValue(data.tradeData)
                    }
                    // setTransferTokenSymbol(data.tradeData.belong)
                } else {
                    setTransferValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
                }
                // else{
                //     setTransferValue({ belong: undefined, amt: 0 })
                // }

                res();
            })
        },
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
            // myLog('transfer handleOnAddressChange', value);
            setPayeeAddr(value)
        },
        handleAddressError: (_value: any) => {
            return {error: false, message: ''}
        }
    })

    React.useEffect(() => {
        setTransferProps({
                ...transferProps,
                walletMap: walletMap2 as WalletMap<any>,
            }
        )
    }, [walletMap2])


    return {
        // handleTransfer,
        transferProps: transferProps as TransferProps<R, T>,
    }
}

// const transfer = useCallback(async (transferValue: any) => {
//
//
//     try {
//
//         const sellToken = tokenMap[ transferValue.belong ]
//
//         const feeToken = tokenMap[ feeInfo.belong ]
//
//         const transferVol = toBig(transferValue.tradeValue).times('1e' + sellToken.decimals).toFixed(0, 0)
//
//         const request: GetNextStorageIdRequest = {
//             accountId:account.accountId,
//             sellTokenId: sellToken.tokenId
//         }
//         const storageId = await LoopringAPI.userAPI.getNextStorageId(request, account.apiKey)
//
//         // const provider = await connector.getProvider()
//         // const web3 = new Web3(provider as any)
//
//         let walletType = account.connectName
//
//         const request2: OriginTransferRequestV3 = {
//             exchange: exchangeInfo.exchangeAddress,
//             payerAddr: account.accAddress,
//             payerId: account.accountId,
//             payeeAddr,
//             payeeId: 0,
//             storageId: storageId.offchainId,
//             token: {
//                 tokenId: sellToken.tokenId,
//                 volume: transferVol,
//             },
//             maxFee: {
//                 tokenId: feeToken.tokenId,
//                 volume: feeInfo.__raw__,
//             },
//             validUntil: VALID_UNTIL,
//         }
//
//         const response = await LoopringAPI.userAPI.submitInternalTransfer(request2, ConnectProvides.usedWeb3, chainId ==='unknown' ? 1 :chainId , walletType,
//             account.eddsaKey, account.apiKey, false)
//
//         myLog('transfer r:', response)
//
//     } catch (reason) {
//         dumpError400(reason)
//     }
//
// }, [ tokenMap, payeeAddr, account, ConnectProvides, chainId, feeInfo])
//
// let transferProps: TransferProps<any, any> = {
//     tradeData: {belong: undefined},
//     coinMap: coinMap as CoinMap<any>,
//     walletMap: walletMap2 as WalletMap<any>,
//     transferBtnStatus: TradeBtnStatus.AVAILABLE,
//     onTransferClick: (tradeData: any) => {
//         if (transferValue && transferValue.belong) {
//             transfer(transferValue)
//         }
//
//         ShowTransfer(false)
//     },
//     handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
//         setFeeInfo(value)
//     },
//     handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
//         return new Promise((res: any) => {
//             if (data?.tradeData?.belong) {
//                 if (transferValue !== data.tradeData) {
//                     setTransferValue(data.tradeData)
//                 }
//                 setTransferTokenSymbol(data.tradeData.belong)
//             } else {
//                 setTransferValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
//             }
//             // else{
//             //     setTransferValue({ belong: undefined, amt: 0 })
//             // }
//
//             res();
//         })
//     },
//
//     chargeFeeToken: 'ETH',
//     chargeFeeTokenList: transferFeeList,
//     handleOnAddressChange: (value: any) => {
//         myLog('transfer handleOnAddressChange', value);
//         setPayeeAddr(value)
//     },
//     handleAddressError: (_value: any) => {
//         return {error: false, message: ''}
//     }
// }
