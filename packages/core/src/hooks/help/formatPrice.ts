import { getExistedMarket, toBig } from '@loopring-web/loopring-sdk'
import { store } from '../../index'

export function formatedVal(rawData: string, base: string, quote: string) {
  const { marketMap, marketArray } = store.getState().tokenMap

  if (!rawData || !base || !quote || !marketMap || !marketArray) {
    return ''
  }

  const { market } = getExistedMarket(marketArray, base, quote)
  const marketInfo = marketMap[market]

  const showVal = toBig(rawData).toFixed(marketInfo.precisionForPrice)

  return showVal
}
