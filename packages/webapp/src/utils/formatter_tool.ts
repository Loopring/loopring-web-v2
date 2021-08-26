import store from 'stores'

import * as sdk from 'loopring-sdk'

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
export function VolToNumberWithPrecision(rawVal: string|number, symbol: string) {

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

export function getShowStr(_minimumReceived: string | undefined, fixed: number = 2, precision: number = 4) {
        let minimumReceived: any = undefined
        if (_minimumReceived) {
            minimumReceived = parseFloat(_minimumReceived)
            if (minimumReceived > 10) {
                minimumReceived = minimumReceived.toFixed(fixed)
            } else {
                minimumReceived = sdk.toBig(minimumReceived).toPrecision(precision)
            }
        }
        return minimumReceived
}
