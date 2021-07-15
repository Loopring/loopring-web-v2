import { useState, } from 'react'

import { getAccountArg, getCandlestickArg, 
  getAmmpoolArg, getTickerArg, getOrderArg, WsTopicType, } from 'loopring-sdk'

import { useWs } from './useWebsocketApi'
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'

import { useGetMarkets } from "hooks/exchange/useExchangeAPI"

function useHandleSocketData(data: any) {
  const [account, setAccount] = useState<any>()
  const [ammPool, setAmmPool] = useState<any>()
  const [order, setOrder] = useState<any>()
  const [ticker, setTicker] = useState<any>()

  useCustomDCEffect(() => {

      if (!data) {
        return
      }

      if (data.op) {
        return
      }

      if (!data.topic || !data.topic.topic) {
        return
      }

      switch(data.topic.topic) {
        case WsTopicType.account:
          setAccount(data.data)
          break
        case WsTopicType.ammpool:
          let ammPool = {
            baseAmt: data.data[0][0],
            quoteAmt: data.data[0][1],
            timestamp: data.data[1],
          }
          setAmmPool(ammPool)
          break
        case WsTopicType.candlestick:
          break
        case WsTopicType.order:
          setOrder(data.data)
          break
        case WsTopicType.orderBook:
          break
        case WsTopicType.ticker:
          setTicker(data.data)
          break
        case WsTopicType.trade:
          break
        default:
          throw Error('Unknown WsTopicType:' + data.topic.topic)
      }
  }, [data])

  return {
    account,
    ammPool,
    order,
    ticker,
  }
}

export function useSwapPageWs(poolAddress: string, market: string, apiKey: string) {

  let topics: any[] = []

  topics.push(getAccountArg())
  topics.push(getOrderArg(market))
  topics.push(getAmmpoolArg(poolAddress))

  const { socketData } = useWs(topics, true, apiKey, !!poolAddress && !!market && !!apiKey)

  return useHandleSocketData(socketData)

}

export function useQuotePageWs() {

  const { markets } = useGetMarkets()

  let topics: any[] = []

  if (markets) {

    const keys = Reflect.ownKeys(markets.markets)

    let c = 0
  
    keys.every((item: any) => {
      c += 1
      topics.push(getTickerArg(item))
      if (c >= 20) {
        return false
      }

      return true
    })

  }

  const { socketData } = useWs(topics, false)

  return useHandleSocketData(socketData)

}
