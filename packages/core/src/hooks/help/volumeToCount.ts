import { store } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'
import BigNumber from 'bignumber.js'

export const volumeToCount = (
  symbol: string,
  volumn: string | number | BigNumber,
  tokenMap = store.getState().tokenMap.tokenMap,
): number | undefined => {
  const result = volumeToCountAsBigNumber(symbol, volumn, tokenMap)
  return result ? result.toNumber() : undefined
}

export const volumeToCountAsBigNumber = (
  symbol: string,
  volumn: string | number | BigNumber,
  tokenMap = store.getState().tokenMap.tokenMap,
): BigNumber | undefined => {
  if (tokenMap && tokenMap[symbol] && typeof volumn !== 'undefined') {
    try {
      return sdk.toBig(volumn).div('1e' + tokenMap[symbol].decimals)
    } catch (error: any) {
      throw error
    }
  } else {
    return undefined
  }
}

export const getTokenNameFromTokenId = (
  tokenId: number | string,
  tokenMap = store.getState().tokenMap.tokenMap,
) => {
  if (tokenMap) {
    const valueList = Object.values(tokenMap)
    const hasToken = valueList.find((o) => o.tokenId === tokenId)
    if (hasToken) {
      return hasToken.symbol
    }
    return ''
  }
  return ''
}
