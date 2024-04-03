import { LoopringMap, TickerData, toBig } from '@loopring-web/loopring-sdk'
import { store } from '../../index'
import { volumeToCount } from './volumeToCount'
import { TickerMap } from '../../stores'
import {
  getValuePrecisionThousand,
  Ticker,
  TickerNew,
  TickerNewMap,
  TokenType,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export const makeTickView = (tick: TickerData) => {
  const { tokenPrices } = store.getState().tokenPrices
  // const { forexMap } = store.getState().system;
  if (tick && tick.base && tick.quote) {
    const price = tokenPrices[tick.base]
    const volume = volumeToCount(tick.quote, tick.quote_token_volume)
    const priceU = toBig(volume ? volume : 0).times(price)

    const change = tick.change && tick.change !== 0 ? tick.change * 100 : undefined
    const qPrice = tick.quote === 'DAI' ? 1 : tokenPrices[tick.quote] || 0
    const closeU = toBig(tick.close).times(qPrice).toNumber()
    // const extraTickerInfo = makeTickView(item);

    return {
      ...tick,
      changeU: toBig(tick.close - (tick.open ?? 0)).toNumber(),
      volume: volume ? Number(volume) : undefined,
      closeDollar: closeU,
      timeUnit: '24h',
      priceU: priceU.toNumber(),
      floatTag: tick.close > tick.open ? 'increase' : 'decrease',
      change: change,
      close: isNaN(tick.close) ? undefined : tick.close,
      high: tick.high === 0 ? undefined : tick.high,
      low: tick.low === 0 ? undefined : tick.low,
      reward: 0,
      rewardToken: '',
      __rawTicker__: tick,
    } as Ticker
  }
}
export const makeTickerMap = <R extends { [key: string]: any }>({
  tickerMap,
}: {
  tickerMap: LoopringMap<TickerData>
}): TickerMap<{ [key: string]: any }> => {
  const { forexMap } = store.getState().system
  const { tokenPrices } = store.getState().tokenPrices

  return Reflect.ownKeys(tickerMap).reduce((prev: TickerMap<R>, key) => {
    const item = tickerMap[key as any]
    if (item && item.quote && forexMap && tokenPrices[item.quote]) {
      const price = tokenPrices[item.quote]
      const volume = volumeToCount(item.symbol.split('-')[1], item.quote_token_volume)
      const priceU = toBig(volume ? volume : 0).times(price)
      const change = item.change && item.change !== 0 ? item.change * 100 : undefined

      const extraTickerInfo = makeTickView(item)

      prev[key as keyof R] = {
        ...item,
        ...extraTickerInfo,
        timeUnit: '24h',
        priceU: priceU?.toNumber() === 0 ? undefined : priceU?.toNumber(),
        volume: volume ? volume.toString() : undefined,
        floatTag: item.close > item.open ? 'increase' : 'decrease',
        change: change,
        close: isNaN(item.close) ? undefined : item.close,
        high: item.high === 0 ? undefined : item.high,
        low: item.low === 0 ? undefined : item.low,
        // APR: 0,
        reward: 0,
        rewardToken: '',
        __rawTicker__: item,
      } as unknown as Ticker
    }
    return prev
  }, {} as TickerMap<R>)
}

export const makeTokenTickerView = ({
  item,
  isVault = false,
}: {
  item: sdk.DatacenterTokenInfoSimple
  isVault?: boolean
}) => {
  const {
    tokenMap: { tokenMap: erc20TokenMap },
    invest: {
      vaultMap: { erc20Map, idIndex },
    },
  } = store.getState()
  const tokenInfo = erc20TokenMap[item.symbol]
  const volume = getValuePrecisionThousand(
    item.volume24H,
    tokenInfo.precision,
    tokenInfo.precision,
    undefined,
  ) //volumeToCount(item.symbol, item.volume24H)
  const priceU = sdk.toBig(item.volume24H ?? 0).times(item.price ?? 0)
  const change = getValuePrecisionThousand(item.percentChange24H ?? 0, 2, 2, 2)
  // @ts-ignore
  return {
    ...tokenInfo,
    ...item,
    timeUnit: '24h',
    volume,
    priceU,
    change,
    type: isVault ? TokenType.vault : TokenType.single,
    erc20Symbol: tokenInfo.symbol,
    symbol: isVault ? idIndex[erc20Map[tokenInfo.symbol].vaultTokenId] : tokenInfo.symbol,
    __rawTicker__: item,
    rawData: item,
  } as unknown as TickerNew
}
export const makeTokenTickerMap = <R>({
  rawData,
  isVault,
}: {
  rawData: sdk.DatacenterTokenInfoSimple[]
  isVault?: boolean
}): TickerNewMap<R> => {
  return rawData.reduce((prev: TickerNewMap<R>, item) => {
    const key = item.symbol
    if (item && item.symbol && item.price) {
      const {
        invest: {
          vaultMap: { tokenMap },
        },
      } = store.getState()
      const priceU = sdk.toBig(item.volume24H ?? 0).times(item.price ?? 0)
      const change = getValuePrecisionThousand(item.percentChange24H ?? 0, 2, 2, 2)
      // @ts-ignore
      prev[key] = {
        // ...tokenInfo,
        ...item,
        ...tokenMap['LV' + item.symbol],
        timeUnit: '24h',
        volume: item.volume24H,
        priceU,
        change,
        type: TokenType.vault,
        erc20Symbol: item.symbol,
        symbol: 'LV' + item.symbol,
        __rawTicker__: item,
        rawData: item,
      } as unknown as TickerNew
    }
    return prev
  }, {} as TickerNewMap<R>)
}
