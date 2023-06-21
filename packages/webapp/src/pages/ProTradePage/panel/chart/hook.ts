import React, { useEffect } from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { TradingInterval } from '@loopring-web/loopring-sdk'
import { IOHLCData, RawDataTradeItem } from '@loopring-web/component-lib'
import { LoopringAPI, store, usePageTradePro, useTokenMap, volumeToCount } from '@loopring-web/core'
import moment from 'moment'
import { getValuePrecisionThousand, myLog } from '@loopring-web/common-resources'

export enum TradingIntervalToTimer {
  '1min' = 60000,
  '5min' = 300000,
  '15min' = 15 * 60000,
  '30min' = 30 * 60000,
  '1hr' = 3600000000,
  '2hr' = 2 * 3600000000,
  '4hr' = 4 * 3600000000,
  '12hr' = 12 * 3600000000,
  '1d' = 24 * 3600000000,
  '1w' = 7 * 24 * 3600000000,
}

export function useKlineChart(market: string | undefined) {
  const { tokenMap, marketMap } = useTokenMap()
  const [timeInterval, setTimeInterval] = React.useState(TradingInterval.hr4)

  const [lastMinutes, setLastMinutes] = React.useState(Date.now())
  const [candlestickViewData, setCandlestickViewData] = React.useState<IOHLCData[]>([])
  const {
    pageTradePro: { tradeArray },
  } = usePageTradePro()

  const genCandlestickData = React.useCallback(
    async ({
      market,
      timeInterval = sdk.TradingInterval.d1,
    }: {
      market: string | undefined
      timeInterval?: sdk.TradingInterval
    }) => {
      if (market && LoopringAPI.exchangeAPI && tokenMap) {
        // @ts-ignore
        const [_, coinBase, coinQuote] = market.match(/(\w+)-(\w+)/i)

        const decimals = tokenMap[coinBase] ? tokenMap[coinBase].decimals : -1

        if (decimals > 0) {
          const candlesticks = await LoopringAPI.exchangeAPI.getMixCandlestick({
            market,
            interval: timeInterval,
          })
          setLastMinutes(Date.now())
          let candlestickViewData: IOHLCData[] = []

          candlesticks.candlesticks.forEach((item: sdk.Candlestick) => {
            const dataItem: IOHLCData = {
              date: new Date(item.timestamp),
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
              volume: sdk
                .toBig(item.baseVol)
                .div('1e' + decimals)
                .toNumber(),
              txs: item.txs,
            }

            candlestickViewData.push(dataItem)
          })

          setCandlestickViewData(candlestickViewData.reverse())
        } else {
          throw Error('wrong decimals')
        }
      }
    },
    [tokenMap],
  )

  const addCandlestick = React.useCallback(() => {
    if (market) {
      const now = Date.now()
      const [, base, quote] = market.replace('AMM-', '').match(/(\w+)-(\w+)/i)
      const precision = marketMap[market]?.precisionForPrice
      const tradeArray = store.getState()._router_pageTradePro.pageTradePro.tradeArray
      setCandlestickViewData((candlestickViewData) => {
        if (tradeArray && candlestickViewData.length) {
          const viewDate = candlestickViewData[candlestickViewData.length - 1].date

          let index =
            tradeArray.findIndex((item) => {
              myLog(
                'millisecond',
                new Date(item.time),
                new Date(lastMinutes),
                moment(item.time).diff(moment(lastMinutes), 'millisecond'),
              )
              return moment(item.time).diff(moment(lastMinutes), 'millisecond') < 0
            }) - 1
          let newtTadeArrayView: RawDataTradeItem[] = [],
            volume = 0,
            _high = 0,
            _low = Infinity
          if (index >= 0) {
            for (let i = index; i >= 0; i--) {
              const item: RawDataTradeItem = tradeArray[i]
              newtTadeArrayView.push(item)
              let price = getValuePrecisionThousand(
                tradeArray[i].price.value,
                undefined,
                undefined,
                precision,
                true,
                { isPrice: true },
              )

              volume += volumeToCount(base, item.__raw__.volume ?? 0) ?? 0
              if (price < _low) {
                _low = price
              }
              if (price > _high) {
                _high = price
              }
            }
          }
          myLog('addCandlestick', newtTadeArrayView.length)
          if (
            moment(now).diff(moment(viewDate), 'millisecond') > TradingIntervalToTimer[timeInterval]
          ) {
            let index = Math.floor(
              (now - viewDate.getTime()) / TradingIntervalToTimer[timeInterval],
            )
            const open =
              newtTadeArrayView.length && newtTadeArrayView[0].price?.value
                ? getValuePrecisionThousand(
                    newtTadeArrayView[0].price.value,
                    undefined,
                    undefined,
                    precision,
                    true,
                    { isPrice: true },
                  )
                : candlestickViewData[candlestickViewData.length - 1].close
            let i = 1
            while (i <= index) {
              candlestickViewData.push({
                date: new Date(
                  viewDate.getTime() + TradingIntervalToTimer[timeInterval] * i,
                  // now - index * TradingIntervalToTimer[timeInterval]
                ),
                open,
                high: open,
                low: open,
                close: open,
                volume: 0,
                txs: 0,
              })
              i++
            }
          }
          if (newtTadeArrayView.length) {
            let lastOne = candlestickViewData[candlestickViewData.length - 1]
            lastOne.volume += volume
            lastOne.close = getValuePrecisionThousand(
              newtTadeArrayView[newtTadeArrayView.length - 1].price.value,
              undefined,
              undefined,
              precision,
              true,
              { isPrice: true },
            )
            lastOne.high = lastOne.high > _high ? lastOne.high : _high
            lastOne.low = lastOne.low < _low ? lastOne.low : _low
            lastOne.txs += newtTadeArrayView.length
          }
        }
        return candlestickViewData
      })
      setLastMinutes(now)
    }
  }, [market, marketMap, , lastMinutes])
  const handleTimeIntervalChange = React.useCallback((timeInterval: TradingInterval) => {
    setTimeInterval(timeInterval)
  }, [])
  React.useEffect(() => {
    genCandlestickData({ market, timeInterval })
  }, [market, timeInterval])

  useEffect(() => {
    addCandlestick()
  }, [tradeArray])

  return {
    market,
    timeInterval,
    candlestickViewData,
    genCandlestickData,
    handleTimeIntervalChange,
  }
}
