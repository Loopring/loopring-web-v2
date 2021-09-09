import * as sdk from 'loopring-sdk';
import store from '../../stores';
import { LoopringAPI, } from 'api_wrapper';
import { AmmRecordRow, AmmTradeType, RawDataTradeItem } from '@loopring-web/component-lib';
import { volumeToCount, } from './volumeToCount';
import { myError } from "@loopring-web/common-resources";
import { tradeItemToTableDataItem } from 'utils/formatter_tool';

export const getUserTrades = (market: string) => {
    if (!LoopringAPI.userAPI) {
        return undefined
    }
    const {accountId, apiKey} = store.getState().account
    return LoopringAPI.userAPI.getUserTrades({accountId, market,}, apiKey).then((response: {
        totalNum: any;
        userTrades: sdk.UserTrade[];
        raw_data: any;
    }) => {
        return response.userTrades
    })
}
export const makeMarketArray = (coinKey: any, marketTrades: sdk.MarketTradeInfo[]): RawDataTradeItem[] => {

    let tradeArray: Array<Partial<RawDataTradeItem>> = []

    const {tokenMap} = store.getState().tokenMap

    marketTrades.forEach((item: sdk.MarketTradeInfo) => {
        try {
            // const {base, quote} = sdk.getBaseQuote(item.market)
            if (tokenMap) {
                tradeArray.push(tradeItemToTableDataItem(item))
            }
        } catch (error) {
            myError(error)
        }

    })
    // console.log('tradeArray:', tradeArray)
    return tradeArray as RawDataTradeItem[];

}

export const getUserAmmTransaction = ({
                                          address,
                                          offset,
                                          limit
                                      }: any) => {
    const {accountId, apiKey} = store.getState().account
    return LoopringAPI.ammpoolAPI?.getUserAmmPoolTxs({
        accountId,
        ammPoolAddress: address,
        limit,
        offset,
    }, apiKey).then(({userAmmPoolTxs, totalNum}) => {
        return {
            userAmmPoolTxs,
            totalNum
        }
    })
    // }

}

// getAmmPoolTxs

export const getRecentAmmTransaction = ({
                                            address,
                                            offset,
                                            limit
                                        }: any) => {
    // const {apiKey} = store.getState().account
    return LoopringAPI.ammpoolAPI?.getAmmPoolTxs({
        poolAddress: address,
        limit,
        offset,
    }).then(({transactions, totalNum}) => {
        return {
            ammPoolTrades: transactions,
            totalNum
        }
    })
}


export const makeMyAmmMarketArray = <C extends { [ key: string ]: any }>(coinKey: string | undefined, marketTransaction: sdk.UserAmmPoolTx[]): AmmRecordRow<C>[] => {

    const tradeArray: Array<Partial<AmmRecordRow<C>> & { totalBalance: number }> = []
    const {tokenMap, coinMap, idIndex} = store.getState().tokenMap
    const {forex} = store.getState().system


    // if (ammpool && ammpool.userAmmPoolTxs) {
    //     const result = ammpool.userAmmPoolTxs.map(o => ({
    //         side: o.txType === AmmTxType.JOIN ? AmmSideTypes.Join : AmmSideTypes.Exit,
    //         amount: {
    //             from: {
    //                 key: getTokenName(o.poolTokens[0]?.tokenId),
    //                 value: String(volumeToCount(getTokenName(o.poolTokens[0]?.tokenId), o.poolTokens[0]?.actualAmount))
    //             },
    //             to: {
    //                 key: getTokenName(o.poolTokens[1]?.tokenId),
    //                 value: String(volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.actualAmount))
    //             }
    //         },
    //         lpTokenAmount: String(volumeToCount(getTokenName(o.lpToken?.tokenId), o.lpToken?.actualAmount)),
    //         fee: {
    //             key: getTokenName(o.poolTokens[1]?.tokenId),
    //             value: volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.feeAmount)?.toFixed(6)
    //         },
    //         time: o.updatedAt
    //     }))
    //     setAmmRecordList(result)
    //     setShowLoading(false)
    // }

    if (marketTransaction) {
        marketTransaction.forEach((item: sdk.UserAmmPoolTx) => {
            try {
                if (coinMap && tokenMap && idIndex
                    /* && !(coinKey && tokenMap['LP-'+coinKey].tokenId !== item.lpToken.tokenId) */) {
                    // @ts-ignore
                    const [, coinA, coinB] = idIndex[ item.lpToken.tokenId ].match(/LP-(\w+)-(\w+)/i);
                    const balance = item.lpToken.actualAmount

                    tradeArray.push({
                        type: item.txType === sdk.AmmTxType.JOIN ? AmmTradeType.add : AmmTradeType.remove,
                        //TODO:
                        totalDollar: 0,
                        totalYuan: 0 / Number(forex),
                        totalBalance: Number(balance),
                        amountA: volumeToCount(coinA, item.poolTokens[ 0 ]?.actualAmount),
                        amountB: volumeToCount(coinB, item.poolTokens[ 1 ]?.actualAmount),
                        time: Number(item.updatedAt),
                        // @ts-ignore
                        coinA: coinMap[ coinA ],
                        // @ts-ignore
                        coinB: coinMap[ coinB ],
                        status: item.txStatus
                    })
                }
                return tradeArray
            } catch (error) {
                //CATCHERROR:
                console.log(error)
                // new CustomError()
            }
        })

    }
    // console.log('tradeArray:', tradeArray)
    return tradeArray as AmmRecordRow<C>[];

}

// export const makeMarketAmmArray = <C extends object>(coinKey: any, marketTransaction: sdk.AmmPoolTx[]): AmmRecordRow<C>[] => {

//     let tradeArray: Array<Partial<AmmRecordRow<C>>> = [];
//     const {tokenMap, coinMap, idIndex} = store.getState().tokenMap
//     const { forex } = store.getState().system

//     marketTransaction.forEach((item: AmmPoolTx) => {
//         try {
//             // const {base, quote} = getBaseQuote(coinKey)
//             const {forex} = store.getState().system
//             // const {currency} = store.getState().settings
//             const coinMap = store.getState().tokenMap.coinMap as CoinMap<C>
//             // if (coinMap) {
//             if (coinMap && tokenMap && idIndex) {
//                 const [, coinA, coinB] = item.token.split('-')
//                 const balance = item.lpToken.actualAmount
//             }

//                 // id: number;
//                 // from: string;
//                 // to: string;
//                 // token: string;
//                 // amount: string;
//                 // tokenF: string;
//                 // amountF: string;
//                 // status: TxStatus;
//                 // txHash: string;
//                 // billType: BillType;
//                 // income: boolean;
//                 // timestamp: number;
//                 // memo: string;
//                 // price: string;
//                 // transferType: TransferType;
//                 // label: string;
//                 tradeArray.push({
//                     // type: item.billType === BillType.ORDER ?
//                     //     AmmTradeType.swap : item.billType === BillType.TRANSFER && item.income ?
//                     //         AmmTradeType.add : AmmTradeType.remove,
//                     // // //TODO:
//                     // totalDollar: 1000,
//                     // totalYuan: 1000 / Number(forex),
//                     // amountA: Number(item.poolTokens[ 0 ].amount),
//                     // amountB: Number(item.poolTokens[ 1 ].amount),
//                     // time: Number(item.updatedAt),
//                     // coinA: coinMap[ base as keyof C],
//                     // coinB: coinMap[ quote as keyof C ],
//                 })
//             }
//         } catch (error) {
//             //CATCHERROR:
//             console.log(error)
//             // new CustomError()
//         }

//     })
//     // console.log('tradeArray:', tradeArray)
//     return tradeArray as AmmRecordRow<C>[];

// }
