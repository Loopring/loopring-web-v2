import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'

import { TradingInterval, ChainId, ExchangeInfo, TokenInfo, TickerData, } from 'loopring-sdk'

export interface TradingInfo {
  chainId: number
  interval: TradingInterval
  ammPoolStats: any
  ammPoolConf: any
  ammActivityRules: any
  markets: any
  marketTrades: any
  tickerMap: {[key: string]: TickerData}
  tokens: {[key: string]: [value: TokenInfo]}
  exchangeInfo?: ExchangeInfo
}

const defaultInterval = process.env.REACT_APP_TEST_INTERVAL ? process.env.REACT_APP_TEST_INTERVAL : TradingInterval.hr1

const initialState = {
  chainId: ChainId.GORLI,
  interval: defaultInterval,
  ammPoolConf: {},
  ammActivityRules: {},
  ammPoolStats: {},
  markets: [],
  marketTrades: {},
  tokens: {},
  tickerMap: {},
  refreshRate: 1000,
  refreshRateSlow: 3000,
} as TradingInfo

const tradingSlice:Slice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setChainId(state, action: PayloadAction<number>) {
      state.chainId = action.payload
    },
    changeTradingInterval(state, action: PayloadAction<any>) {
      state.interval = action.payload
    },
    setTickerMap(state, action: PayloadAction<any>) {
      state.tickerMap = action.payload
    },
    setAmmPoolStats(state, action: PayloadAction<any>) {
      state.ammPoolStats = action.payload
    },
    setAmmActivityRules(state, action: PayloadAction<any>) {
      state.ammActivityRules = action.payload
    },
    setAmmPoolConf(state, action: PayloadAction<any>) {
      state.ammPoolConf = action.payload
    },
    setMarketTrades(state, action: PayloadAction<any>) {
      state.marketTrades = action.payload
    },
    setMarkets(state, action: PayloadAction<any>) {
      state.markets = action.payload
    },
    setTokens(state, action: PayloadAction<{}>) {
      state.tokens = action.payload
    },
    setExchangeInfo(state, action: PayloadAction<ExchangeInfo>) {
      state.exchangeInfo = action.payload
    },
  },
})

export const {
  setChainId, 
  setAmmPoolStats,
  setAmmActivityRules,
  setMarketTrades, 
  setTickerMap, 
  setAmmPoolConf, 
  changeTradingInterval, 
  setMarkets, 
  setTokens, 
  setExchangeInfo, 
} = tradingSlice.actions

export default tradingSlice
