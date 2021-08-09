import React from 'react';

import {  ResetProps } from '@loopring-web/component-lib';
import { IBData,WalletMap } from '@loopring-web/common-resources';



export const useReset = <R extends IBData<T>, T>(walletMap2:WalletMap<T>,ShowReset: (isShow: boolean, defaultProps?: any)=>void): {
    // handleReset: (inputValue:R) => void,
    resetProps: ResetProps<R, T>
    // resetValue: R
} => {
    // const {tokenMap, coinMap} = useTokenMap();
    // const {account} = useAccount()
    // const { exchangeInfo, chainId } = useSystem();
    // const [resetValue, setResetValue] = React.useState<IBData<T>>({
    //     belong: undefined,
    //     tradeValue: 0,
    //     balance: 0
    // } as IBData<unknown>)
    // const {chargeFeeList} = useChargeFees(resetValue.belong, OffchainFeeReqType.TRANSFER, tokenMap)
    //
    // const [feeInfo, setFeeInfo] = React.useState<any>()
    // const [payeeAddr, setPayeeAddr] = React.useState<string>('');

    // useCustomDCEffect(() => {
    //     if (chargeFeeList.length > 0) {
    //         setFeeInfo(chargeFeeList[ 0 ])
    //     }
    // }, [chargeFeeList])
    const handleReset = React.useCallback(async (inputValue: R) => {
        // const {accountId,accAddress,readyState,apiKey,connectName,eddsaKey } = account
        // if (readyState === AccountStatus.ACTIVATED && tokenMap && exchangeInfo && ConnectProvides.usedWeb3) {
        //     try{
        //         const sellToken = tokenMap[ inputValue.belong as string ]
        //         const feeToken = tokenMap[ feeInfo.belong ]
        //         const resetVol = toBig(inputValue.tradeValue).times('1e' + sellToken.decimals).toFixed(0, 0)
        //         const storageId = await LoopringAPI.userAPI?.getNextStorageId({
        //             accountId: accountId,
        //             sellTokenId: sellToken.tokenId
        //         }, apiKey)
        //         const response = await LoopringAPI.userAPI?.submitInternalReset({
        //                 exchange: exchangeInfo.exchangeAddress,
        //                 payerAddr: accAddress,
        //                 payerId: accountId,
        //                 payeeAddr,
        //                 payeeId: 0,
        //                 storageId: storageId?.offchainId,
        //                 token: {
        //                     tokenId: sellToken.tokenId,
        //                     volume: resetVol,
        //                 },
        //                 maxFee: {
        //                     tokenId: feeToken.tokenId,
        //                     volume: feeInfo.__raw__,
        //                 },
        //                 validUntil: VALID_UNTIL,
        //             },
        //             ConnectProvides.usedWeb3,
        //             chainId === 'Unknown' ? 1 : chainId, connectName  as ConnectorNames,
        //             eddsaKey, apiKey, false)
        //         //TODO check success or failed API
        //     } catch (e) {
        //
        //     }
        //
        // } else {
        //     return false
        // }

    }, [
        // account,tokenMap,feeInfo
    ])
    const [resetProps, setResetProps] = React.useState<Partial<ResetProps<R, T>>>({
        // tradeData: {belong: undefined} as any,
        // coinMap: coinMap as CoinMap<T>,
        // walletMap: walletMap2 as WalletMap<any>,
        // resetBtnStatus: TradeBtnStatus.AVAILABLE,
        // onResetClick: () => {
        //     if (resetValue && resetValue.belong) {
        //         handleReset(resetValue as R)
        //     }
        //
        //     ShowReset(false)
        // },
        // handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
        //     setFeeInfo(value)
        // },
        // handlePanelEvent: async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
        //     return new Promise((res: any) => {
        //         if (data?.tradeData?.belong) {
        //             if (resetValue !== data.tradeData) {
        //                 setResetValue(data.tradeData)
        //             }
        //             // setResetTokenSymbol(data.tradeData.belong)
        //         } else {
        //             setResetValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
        //         }
        //         // else{
        //         //     setResetValue({ belong: undefined, amt: 0 })
        //         // }
        //
        //         res();
        //     })
        // },
        // chargeFeeToken: 'ETH',
        // chargeFeeTokenList: chargeFeeList,
        // handleOnAddressChange: (value: any) => {
        //     // myLog('reset handleOnAddressChange', value);
        //     setPayeeAddr(value)
        // },
        // handleAddressError: (_value: any) => {
        //     return {error: false, message: ''}
        // }
    })


    return {
        // handleReset,
        resetProps: resetProps as ResetProps<R, T>,
    }
}

// const reset = useCallback(async (resetValue: any) => {
//
//
//     try {
//
//         const sellToken = tokenMap[ resetValue.belong ]
//
//         const feeToken = tokenMap[ feeInfo.belong ]
//
//         const resetVol = toBig(resetValue.tradeValue).times('1e' + sellToken.decimals).toFixed(0, 0)
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
//         const request2: OriginResetRequestV3 = {
//             exchange: exchangeInfo.exchangeAddress,
//             payerAddr: account.accAddress,
//             payerId: account.accountId,
//             payeeAddr,
//             payeeId: 0,
//             storageId: storageId.offchainId,
//             token: {
//                 tokenId: sellToken.tokenId,
//                 volume: resetVol,
//             },
//             maxFee: {
//                 tokenId: feeToken.tokenId,
//                 volume: feeInfo.__raw__,
//             },
//             validUntil: VALID_UNTIL,
//         }
//
//         const response = await LoopringAPI.userAPI.submitInternalReset(request2, ConnectProvides.usedWeb3, chainId ==='Unknown' ? 1 :chainId , walletType,
//             account.eddsaKey, account.apiKey, false)
//
//         myLog('reset r:', response)
//
//     } catch (reason) {
//         dumpError400(reason)
//     }
//
// }, [ tokenMap, payeeAddr, account, ConnectProvides, chainId, feeInfo])
//
// let resetProps: ResetProps<any, any> = {
//     tradeData: {belong: undefined},
//     coinMap: coinMap as CoinMap<any>,
//     walletMap: walletMap2 as WalletMap<any>,
//     resetBtnStatus: TradeBtnStatus.AVAILABLE,
//     onResetClick: (tradeData: any) => {
//         if (resetValue && resetValue.belong) {
//             reset(resetValue)
//         }
//
//         ShowReset(false)
//     },
//     handleFeeChange(value: { belong: any; fee: number | string; __raw__?: any }): void {
//         setFeeInfo(value)
//     },
//     handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
//         return new Promise((res: any) => {
//             if (data?.tradeData?.belong) {
//                 if (resetValue !== data.tradeData) {
//                     setResetValue(data.tradeData)
//                 }
//                 setResetTokenSymbol(data.tradeData.belong)
//             } else {
//                 setResetValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
//             }
//             // else{
//             //     setResetValue({ belong: undefined, amt: 0 })
//             // }
//
//             res();
//         })
//     },
//
//     chargeFeeToken: 'ETH',
//     chargeFeeTokenList: resetFeeList,
//     handleOnAddressChange: (value: any) => {
//         myLog('reset handleOnAddressChange', value);
//         setPayeeAddr(value)
//     },
//     handleAddressError: (_value: any) => {
//         return {error: false, message: ''}
//     }
// }
