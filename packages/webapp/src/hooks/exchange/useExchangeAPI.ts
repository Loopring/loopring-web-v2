import { useState, } from 'react'

import { TradesData, TickerData, DepthData, 
  TokensResponse,
  MarketsResponse, } from 'loopring-sdk'

import { usePromiseJob } from 'hooks/common/useCommon'
import { useExchangeAPI, } from './useApi'

export function useGetGas() {

  const [gas, setGas] = useState<any>()

  const api = useExchangeAPI()

  const fetchData = () => {
    if (!api) {
      return undefined
    }
    return api.getGasPrice()
  }

  usePromiseJob(fetchData, setGas, undefined, 'useGetGas', [api])

  return { gas }

}

export function useGetMixMarkets() {

  const [markets, setMarkets] = useState<MarketsResponse>()
    const api = useExchangeAPI()

    const fetchData = () => {
      if (!api) {
        return undefined
      }
      return api.getMixMarkets()
    }
  
    usePromiseJob(fetchData, setMarkets, undefined, 'useGetMarkets', [api])
    
    return { markets }

}

export function useGetMarkets() {

  const [markets, setMarkets] = useState<MarketsResponse>()
    const api = useExchangeAPI()

    const fetchData = () => {
      if (!api) {
        return undefined
      }
      return api.getMarkets()
    }
  
    usePromiseJob(fetchData, setMarkets, undefined, 'useGetMarkets', [api])
    
    return { markets }

}

export function useGetExchangeInfo() {

  const [exchangeInfo, setExchangeInfo] = useState<any>()
    const api = useExchangeAPI()

    const fetchData = () => {
      if (!api) {
        return undefined
      }
      return api.getExchangeInfo()
    }
  
    usePromiseJob(fetchData, setExchangeInfo, 'exchangeInfo', 'useGetExchangeInfo', [api])
    
    return { exchangeInfo }

}

export function useGetTokens() {

  const [tokens, setTokens] = useState<TokensResponse>()
    const api = useExchangeAPI()

    const fetchData = () => {
      if (!api) {
        return undefined
      }
      return api.getTokens()
    }
  
    usePromiseJob(fetchData, setTokens, undefined, 'useGetTokens', [api])
    
    return { tokens }

}


export function useTrades(symbol: string) {

  const [trades, setTrades] = useState<TradesData>()

  const api = useExchangeAPI()

  const fetchData = () => {
    if (!api) {
      return undefined
    }
    return api.getMarketTrades({
      market: symbol
    })
  }

  usePromiseJob(fetchData, setTrades, undefined, 'useTrades', [api, symbol])

  return { trades, }

}

export function useTickerMap(market: string) {

  const [tickerMap, setTickerMap] = useState<{[key: string]: TickerData}>()

  const api = useExchangeAPI()

  const fetchData = () => {
    if (!api) {
      return undefined
    }
    return api.getTicker({
      market
    })
  }

  usePromiseJob(fetchData, setTickerMap, 'tickMap', 'useTickerMap', [api, market])

  return { tickerMap, }

}

export function useDepth(symbol: string) {

  const api = useExchangeAPI()

  const [depth, setDepth] = useState<DepthData>()

    const fetchData = () => {
      if (!api) {
        return undefined
      }
      return api.getMixDepth({
        market: symbol
      })
    }
  
    usePromiseJob(fetchData, setDepth, 'depth', 'useDepth', [api, symbol])

  return { depth, }

}
