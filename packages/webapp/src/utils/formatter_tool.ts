import { BIG10 } from 'defs/swap_defs'
import { toBig } from 'loopring-sdk'

import store from 'stores'

const getTokenInfo = (symbol: string) => {
    const tokenMap = store.getState().tokenMap.tokenMap

    if (!tokenMap || !tokenMap[symbol]) {
        return undefined
    }

    return tokenMap[symbol]
}

export function StringToNumberWithPrecision(rawVal: string, symbol: string) {
    
    if (rawVal === undefined || rawVal === null || rawVal.trim() === '')
        return 0

    const tokenInfo = getTokenInfo(symbol)

    if (!tokenInfo) {
        return undefined
    }

    return parseFloat(toBig(rawVal).toFixed(tokenInfo.precision, 0))
}

export function VolToNumberWithPrecision(rawVal: string, symbol: string) {

    const tokenInfo = getTokenInfo(symbol)

    if (!tokenInfo) {
        return undefined
    }

    if (rawVal === undefined || rawVal === null || rawVal.trim() === '')
        return 0

    return parseFloat(toBig(rawVal).div('1e' + tokenInfo.decimals).toFixed(tokenInfo.precision, 0))
}
