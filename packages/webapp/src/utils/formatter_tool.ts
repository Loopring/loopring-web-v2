import store from 'stores'

import * as sdk from 'loopring-sdk'
import { Side, toBig } from 'loopring-sdk'
import { getShowStr, TradeTypes } from '@loopring-web/common-resources'
import { volumeToCountAsBigNumber } from 'hooks/help'

const getTokenInfo = (symbol: string) => {
    const tokenMap = store.getState().tokenMap.tokenMap

    if (!tokenMap || !tokenMap[symbol]) {
        return undefined
    }

    return tokenMap[symbol]
}

const getMarketInfo = (symbol: string) => {
    const marketMap = store.getState().tokenMap.marketMap

    if (!marketMap || !marketMap[symbol]) {
        return undefined
    }

    return marketMap[symbol]
}

export function StringToNumberWithPrecision(rawVal: string, symbol: string) {

    if (rawVal === undefined || rawVal === null || rawVal.trim() === '')
        return 0

    const tokenInfo = getTokenInfo(symbol)

    if (!tokenInfo) {
        return undefined
    }

    return parseFloat(sdk.toBig(rawVal).toFixed(tokenInfo.precision, 0))
}

/*
* format volume to real number
*/
export function VolToNumberWithPrecision(rawVal: string | number, symbol: string) {

    const tokenInfo = getTokenInfo(symbol)

    if (!tokenInfo) {
        return undefined
    }

    if (rawVal === undefined || rawVal === null || isNaN(Number(rawVal)))
        return 0

    return sdk.toBig(rawVal).div('1e' + tokenInfo.decimals).toFixed(tokenInfo.precision, 0)
}

/*
* format raw val with precision
*/
export function FormatValWithPrecision(rawVal: string, symbol: string) {

    const tokenInfo = getTokenInfo(symbol)

    if (!tokenInfo) {
        return undefined
    }

    if (rawVal === undefined || rawVal === null || rawVal.trim() === '')
        return 0

    return sdk.toBig(rawVal).toFixed(tokenInfo.precision, 0)
}

/*
* format order price with precision
*/
export function formatPriceWithPrecision(rawVal: string,
    symbol: string) {

    const marketInfo = getMarketInfo(symbol)
    if (!rawVal || !marketInfo || !symbol) {
        return '0'
    }

    return sdk.toBig(rawVal).toFixed(marketInfo.precisionForPrice)

}

export function tradeItemToTableDataItem(tradeItem: any) {
    const marketList = tradeItem.market.split('-')
    // due to AMM case, we cannot use first index
    const side = tradeItem.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
    const isBuy = side === TradeTypes.Buy

    const base = marketList[marketList.length - 2]
    const quote = marketList[marketList.length - 1]
    const baseValue = volumeToCountAsBigNumber(base, tradeItem.volume)
    const quoteValue = baseValue?.times(tradeItem.price)
    const sellToken = isBuy ? quote : base
    const buyToken = isBuy ? base : quote
    const sellValue = getShowStr((isBuy ? quoteValue : baseValue)?.toNumber())
    const buyValue = getShowStr((isBuy ? baseValue : quoteValue)?.toNumber())

    const feeKey = buyToken
    const feeValue = getShowStr(volumeToCountAsBigNumber(feeKey, tradeItem.fee)?.toString())

    return ({
        side,
        price: {
            key: sellToken,
            value: getShowStr(toBig(tradeItem.price).toString()),
        },
        fee: {
            key: feeKey,
            value: feeKey && feeValue ? feeValue : '--'
        },
        time: Number(tradeItem.tradeTime),
        amount: {
            from: {
                key: sellToken,
                value: sellToken ? sellValue : undefined
            },
            to: {
                key: buyToken,
                value: buyValue ? buyValue : undefined
            }
        }
    })
}