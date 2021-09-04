import * as sdk from 'loopring-sdk';
import bigNumber from 'bignumber.js'
import store from '../../stores';
import { getThousandFormattedNumbers, getValuePrecision, TradeTypes } from '@loopring-web/common-resources';
import { LoopringAPI, } from 'api_wrapper';
import { AmmRecordRow, AmmTradeType, RawDataTradeItem } from '@loopring-web/component-lib';
import { volumeToCount, volumeToCountAsBigNumber } from './volumeToCount';
import { myError } from 'utils/log_tools';

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


                // const marketList = o.market.split('-')
                // due to AMM case, we cannot use first index
                // const side = item.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
                const isBuy = item.side === sdk.Side.Buy
                const market = item.market.split('-')
                if (market.length === 3) {
                    market.shift()
                }
                const [tokenFirst, tokenLast] = market
                // const tokenFirst = marketList[marketList.length - 2]
                // const tokenLast = marketList[marketList.length - 1]
                const baseToken = isBuy ? tokenLast : tokenFirst
                const quoteToken = isBuy ? tokenFirst : tokenLast
                const feeKey = isBuy ? quoteToken : baseToken
                const baseValue = isBuy ? volumeToCountAsBigNumber(quoteToken, item.volume)?.times(item.price).toNumber() : volumeToCountAsBigNumber(baseToken, item.volume)
                const quoteValue = isBuy ? volumeToCountAsBigNumber(quoteToken, item.volume) : volumeToCountAsBigNumber(baseToken, item.volume)?.times(item.price).toNumber()
                const feeValue = volumeToCountAsBigNumber(feeKey, item.fee)

                // const baseToken = tokenMap[ base as string ]
                // const quoteToken = tokenMap[ quote as string ]
                // const feeKey = item.side === sdk.Side.Buy ? base : quote
                // @ts-ignore
                tradeArray.push({
                    side: item.side === sdk.Side.Sell ? TradeTypes.Sell : TradeTypes.Buy,
                    amount: {
                        from: {
                            // key: base as string,
                            // value: base ? volumeToCount(base, item.volume) : undefined
                            key: baseToken as string,
                            value: getValuePrecision(getThousandFormattedNumbers(new bigNumber(baseValue || 0) as any), 4) as any,
                        },
                        to: {
                            // key: quote as string,
                            // value: base ? volumeToCountAsBigNumber(base, item.volume)?.times(item.price).toNumber():undefined
                            key: quoteToken as string,
                            value: getValuePrecision(getThousandFormattedNumbers(new bigNumber(quoteValue || 0) as any), 4) as any,
                        },

                    },
                    price: {
                        key: '',
                        value: getValuePrecision(sdk.toBig(item.price).toNumber(), 4) as any,
                    },
                    fee: {
                        key: feeKey || '--',
                        // value: feeKey ? volumeToCountAsBigNumber(feeKey, item.fee)?.toNumber() : undefined, 
                        // value: feeValue && Number(feeValue) > 1 ? feeValue?.toFixed(6) : feeValue?.toPrecision(2) as any
                        value: getValuePrecision(getThousandFormattedNumbers(new bigNumber(feeValue || 0) as any)) as any,
                    },
                    time: parseInt(item.tradeTime.toString()),
                })
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
