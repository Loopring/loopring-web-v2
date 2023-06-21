import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PageTradeLite, PageTradeLiteStatus } from './interface'
import * as sdk from '@loopring-web/loopring-sdk'
import { MAPFEEBIPS } from '../../../defs'

const initState = {
  market: undefined,
  tradePair: undefined,
  calcTradeParams: undefined,
  priceImpactObj: undefined,
  maxFeeBips: MAPFEEBIPS,
}

const initialState: PageTradeLiteStatus = {
  pageTradeLite: initState,
  __DAYS__: 30,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
}
const pageTradeLiteSlice: Slice<PageTradeLiteStatus> = createSlice({
  name: '_router_pageTradeLite',
  initialState,
  reducers: {
    resetSwap(state) {
      state.pageTradeLite = initState
    },
    updatePageTradeLite(state, action: PayloadAction<Partial<PageTradeLite>>) {
      const {
        market,
        depth,
        ticker,
        ammPoolSnapshot,
        tradePair,
        quoteMinAmtInfo,
        minOrderInfo,
        request,
        calcTradeParams,
        priceImpactObj,
        feeBips,
        totalFee,
        takerRate,
        buyMinAmtInfo,
        sellMinAmtInfo,
        lastStepAt,
        close,
        maxFeeBips,
        feeTakerRate,
        tradeCost,
      } = action.payload
      if (market !== state.pageTradeLite.market) {
        state.pageTradeLite = {
          market,
          tradePair, //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
          request,
          calcTradeParams,
          depth,
          ticker,
          ammPoolSnapshot,
          priceImpactObj,
          tradeChannel: calcTradeParams
            ? calcTradeParams.exceedDepth
              ? sdk.TradeChannel.BLANK
              : sdk.TradeChannel.MIXED
            : undefined,
          orderType: calcTradeParams
            ? calcTradeParams.exceedDepth
              ? sdk.OrderType.ClassAmm
              : sdk.OrderType.TakerOnly
            : undefined,
          feeBips,
          totalFee,
          takerRate,
          quoteMinAmtInfo,
          buyMinAmtInfo,
          sellMinAmtInfo,
          minOrderInfo,
          lastStepAt: undefined,
          close,
          maxFeeBips: MAPFEEBIPS,
          tradeCost: tradeCost,
          feeTakerRate: feeTakerRate,
        }
      } else {
        if (lastStepAt) {
          state.pageTradeLite.lastStepAt = lastStepAt
        }
        if (tradePair && tradePair) {
          state.pageTradeLite.tradePair = tradePair
          state.pageTradeLite.lastStepAt = undefined
        }
        if (depth) {
          state.pageTradeLite.depth = depth
        }
        if (close) {
          state.pageTradeLite.close = close
        }
        if (ticker) {
          state.pageTradeLite.ticker = ticker
        }
        if (ammPoolSnapshot) {
          state.pageTradeLite.ammPoolSnapshot = ammPoolSnapshot
        }
        if (request !== undefined) {
          state.pageTradeLite.request = request
        }
        if (calcTradeParams !== undefined) {
          state.pageTradeLite.calcTradeParams = calcTradeParams
          state.pageTradeLite.orderType = calcTradeParams?.exceedDepth
            ? sdk.OrderType.ClassAmm
            : sdk.OrderType.TakerOnly
          state.pageTradeLite.tradeChannel = calcTradeParams?.exceedDepth
            ? sdk.TradeChannel.BLANK
            : sdk.TradeChannel.MIXED
        }

        if (priceImpactObj) {
          state.pageTradeLite.priceImpactObj = priceImpactObj
        }
        if (feeBips) {
          state.pageTradeLite.feeBips = feeBips
        }
        if (totalFee) {
          state.pageTradeLite.totalFee = totalFee
        }
        if (takerRate) {
          state.pageTradeLite.takerRate = takerRate
        }
        if (sellMinAmtInfo) {
          state.pageTradeLite.sellMinAmtInfo = sellMinAmtInfo
        }
        if (buyMinAmtInfo) {
          state.pageTradeLite.buyMinAmtInfo = buyMinAmtInfo
        }
        if (minOrderInfo) {
          state.pageTradeLite.minOrderInfo = minOrderInfo
        }
        if (maxFeeBips) {
          state.pageTradeLite.maxFeeBips = maxFeeBips
        }
        state.pageTradeLite.tradeCost = tradeCost
        state.pageTradeLite.feeTakerRate = feeTakerRate
      }
    },
  },
})
export { pageTradeLiteSlice }
export const { updatePageTradeLite, resetSwap } = pageTradeLiteSlice.actions
