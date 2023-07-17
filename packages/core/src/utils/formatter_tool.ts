import { store } from '../index'

import * as sdk from '@loopring-web/loopring-sdk'
import {
  GET_IPFS_STRING,
  getValuePrecisionThousand,
  IPFS_HEAD_URL,
  IPFS_HEAD_URL_REG,
  IPFS_LOOPRING_SITE,
  TradeTypes,
} from '@loopring-web/common-resources'
import { volumeToCountAsBigNumber } from '../hooks/help'

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
  if (rawVal === undefined || rawVal === null || rawVal.trim() === '') return 0

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

  if (rawVal === undefined || rawVal === null || isNaN(Number(rawVal))) return 0

  return sdk
    .toBig(rawVal)
    .div('1e' + tokenInfo.decimals)
    .toFixed(tokenInfo.precision, 0)
}

/*
 * format raw val with precision
 */
export function FormatValWithPrecision(rawVal: string, symbol: string) {
  const tokenInfo = getTokenInfo(symbol)

  if (!tokenInfo) {
    return undefined
  }

  if (rawVal === undefined || rawVal === null || rawVal.trim() === '') return 0

  return sdk.toBig(rawVal).toFixed(tokenInfo.precision, 0)
}

/*
 * format order price with precision
 */
export function formatPriceWithPrecision(rawVal: string, symbol: string) {
  const marketInfo = getMarketInfo(symbol)
  if (!rawVal || !marketInfo || !symbol) {
    return '0'
  }

  return sdk.toBig(rawVal).toFixed(marketInfo.precisionForPrice)
}

export function tradeItemToTableDataItem(tradeItem: any) {
  const { tokenMap } = store.getState().tokenMap
  const marketList = tradeItem.market.split('-')
  // due to AMM case, we cannot use first index
  const side = tradeItem.side === sdk.Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
  const isBuy = side === TradeTypes.Buy

  const base = marketList[marketList.length - 2]
  const quote = marketList[marketList.length - 1]
  const baseValue = volumeToCountAsBigNumber(base, tradeItem.volume)
  //
  const quoteValue = baseValue?.times(tradeItem.price)
  const sellToken = isBuy ? quote : base
  const buyToken = isBuy ? base : quote
  const sellValue = (isBuy ? quoteValue : baseValue)?.toNumber()
  const buyValue = (isBuy ? baseValue : quoteValue)?.toNumber()

  const feeKey = isBuy ? base : quote
  const feeKeyPrecision = tokenMap ? tokenMap[feeKey].precision : undefined

  const feeValue = getValuePrecisionThousand(
    volumeToCountAsBigNumber(feeKey, tradeItem.fee),
    feeKeyPrecision,
    feeKeyPrecision,
    undefined,
    false,
    {
      floor: false,
      // isTrade: true,
    },
  ) as any
  const counterparty = marketList.length === 3 ? 'Orderbook' : 'Pool'
  // myLog ('....',tokenMap[base].precision)
  return {
    side,
    role: tradeItem.type,
    counterparty: counterparty,
    price: {
      key: sellToken,
      value: sdk.toBig(tradeItem.price).toNumber(),
    },
    fee: {
      key: feeKey,
      value: feeKey && feeValue ? feeValue : undefined,
    },
    time: Number(tradeItem.tradeTime),
    amount: {
      from: {
        key: sellToken,
        value: sellToken ? sellValue : undefined,
      },
      to: {
        key: buyToken,
        value: buyValue ? buyValue : undefined,
      },

      volume: getValuePrecisionThousand(
        baseValue,
        //@ts-ignore
        tokenMap[base].precisionForOrder,
        tokenMap[base].precisionForOrder,
        tokenMap[base].precisionForOrder,
        true,
      ),
    },
    __raw__: tradeItem,
  }
}

export function getFloatValue(rawVal: any) {
  if (rawVal === undefined || rawVal === null) {
    return 0
  }

  const isStr = typeof rawVal === 'string'
  return isStr ? parseFloat(rawVal.trim()) : rawVal
}

export function isIntNum(val: any) {
  var regPos = /^\d+$/
  var regNeg = /^-[1-9][0-9]*$/
  return regPos.test(val) && regNeg.test(val)
}

export function isPosIntNum(val: any) {
  var regPos = /^\d+$/
  return regPos.test(val)
}

export const getIPFSString: GET_IPFS_STRING = (url: string | undefined, _baseURL: string) => {
  if (url === undefined) {
    return ''
  } else if (url.startsWith('http')) {
    return url
  } else if (url.startsWith(IPFS_HEAD_URL)) {
    const _url = url.replace(IPFS_HEAD_URL_REG, IPFS_LOOPRING_SITE)
    return _url
    // myLog(_url, url);
    // return baseURL + "/api/v3/delegator/ipfs" + `?path=` + _url;
  } else {
    return url
  }
}
