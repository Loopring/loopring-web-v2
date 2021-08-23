import * as sdk from 'loopring-sdk';
import store from '../../stores';
import { TradeTypes } from '@loopring-web/common-resources';
import { LoopringAPI, } from 'api_wrapper';
import { AmmRecordRow, AmmTradeType,RawDataTradeItem } from '@loopring-web/component-lib';
import { volumeToCount, volumeToCountAsBigNumber } from './volumeToCount';
import { debug } from 'console';

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
                const [tokenFirst, tokenLast] = item.market.split('-')
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
                            value: baseValue as number,
                        },
                        to: {
                            // key: quote as string,
                            // value: base ? volumeToCountAsBigNumber(base, item.volume)?.times(item.price).toNumber():undefined
                            key: quoteToken as string,
                            value: quoteValue as number,
                        },

                    },
                    price: {
                        key: '',
                        value: sdk.toBig(item.price).toNumber(),
                    },
                    fee: {
                        key: feeKey || '--',
                        // value: feeKey ? volumeToCountAsBigNumber(feeKey, item.fee)?.toNumber() : undefined, 
                        value: feeValue && Number(feeValue) > 1 ? feeValue?.toFixed(6) : feeValue?.toPrecision(2) as any
                    },
                    time: parseInt(item.tradeTime.toString()),
                })
            }
        } catch (error) {
            //CATCHERROR:
            console.log(error)
            // new CustomError()
        }

    })
    // console.log('tradeArray:', tradeArray)
    return tradeArray as RawDataTradeItem[];

}

export const getUserAmmTransaction = () => {
    const {accountId, apiKey} = store.getState().account
    return LoopringAPI.ammpoolAPI?.getUserAmmPoolTxs({accountId}, apiKey).then(({userAmmPoolTxs}) => {
        return userAmmPoolTxs
    })
    // }

}


export const makeMyAmmMarketArray = <C extends { [ key: string ]:any }>(coinKey: string|undefined, marketTransaction: sdk.UserAmmPoolTx[]): AmmRecordRow<C>[] => {

    const tradeArray: Array<Partial<AmmRecordRow<C>>> = []
    const {tokenMap, coinMap, idIndex} = store.getState().tokenMap
    const { forex } = store.getState().system

    if (marketTransaction) {
        marketTransaction.forEach((item: sdk.UserAmmPoolTx) => {
            try {
                if (coinMap && tokenMap && idIndex
                    && !(coinKey && tokenMap['LP-'+coinKey].tokenId !== item.lpToken.tokenId) ) {
                    // @ts-ignore
                    const [, coinA, coinB] = idIndex[item.lpToken.tokenId].match(/LP-(\w+)-(\w+)/i);
                     
                    tradeArray.push({
                            type: item.txType === sdk.AmmTxType.JOIN ? AmmTradeType.add : AmmTradeType.remove,
                            //TODO:
                            totalDollar: 1000,
                            totalYuan: 1000 / Number(forex),
                            amountA: volumeToCount(coinA,item.poolTokens[ 0 ]?.actualAmount),
                            amountB: volumeToCount(coinA,item.poolTokens[ 1 ]?.actualAmount),
                            time: Number(item.updatedAt),
                            // @ts-ignore
                            coinA: coinMap[ coinA ],
                            // @ts-ignore
                            coinB: coinMap[ coinB ],
                            status: item.txStatus
                        })
                    }
                    return tradeArray
                }
             catch (error) {
                //CATCHERROR:
                console.log(error)
                // new CustomError()
            }
        })

    }
    // console.log('tradeArray:', tradeArray)
    return tradeArray as AmmRecordRow<C>[];

}


export const makeMarketAmmArray = <C extends object>(coinKey: any, marketTransaction: sdk.AmmPoolTx[]): AmmRecordRow<C>[] => {

    let tradeArray: Array<Partial<AmmRecordRow<C>>> = [];

    // marketTransaction.forEach((item: AmmPoolTx) => {
    //     try {
    //         const {base, quote} = getBaseQuote(coinKey)
    //         const {forex} = store.getState().system
    //         // const {currency} = store.getState().settings
    //         const coinMap = store.getState().tokenMap.coinMap as CoinMap<C>
    //         if (coinMap) {
    //
    //             // id: number;
    //             // from: string;
    //             // to: string;
    //             // token: string;
    //             // amount: string;
    //             // tokenF: string;
    //             // amountF: string;
    //             // status: TxStatus;
    //             // txHash: string;
    //             // billType: BillType;
    //             // income: boolean;
    //             // timestamp: number;
    //             // memo: string;
    //             // price: string;
    //             // transferType: TransferType;
    //             // label: string;
    //             tradeArray.push({
    //                 // type: item.billType === BillType.ORDER ?
    //                 //     AmmTradeType.swap : item.billType === BillType.TRANSFER && item.income ?
    //                 //         AmmTradeType.add : AmmTradeType.remove,
    //                 // // //TODO:
    //                 // totalDollar: 1000,
    //                 // totalYuan: 1000 / Number(forex),
    //                 // amountA: Number(item.poolTokens[ 0 ].amount),
    //                 // amountB: Number(item.poolTokens[ 1 ].amount),
    //                 // time: Number(item.updatedAt),
    //                 // coinA: coinMap[ base as keyof C],
    //                 // coinB: coinMap[ quote as keyof C ],
    //             })
    //         }
    //     } catch (error) {
    //         //CATCHERROR:
    //         console.log(error)
    //         // new CustomError()
    //     }
    //
    // })
    // console.log('tradeArray:', tradeArray)
    return tradeArray as AmmRecordRow<C>[];

}
