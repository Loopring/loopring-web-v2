import * as sdk from '@loopring-web/loopring-sdk'
import { MarketType, Ticker } from '@loopring-web/common-resources'
import { MarketCalcParams, OrderInfoPatch } from '../tradePro'

export type PageTradeLite = {
  market?: MarketType // eg: ETH-LRC, Pair from loopring market
  tradePair?: MarketType //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
  request?: sdk.SubmitOrderRequestV3 | null | undefined
  minOrderInfo?: (sdk.OrderInfo & OrderInfoPatch) | undefined | null
  calcTradeParams?: Partial<MarketCalcParams> | null | undefined
  priceImpactObj?:
    | {
        // account has activated or undefined
        value: number | string
        priceImpactColor: string
        priceLevel: number | string
      }
    | null
    | undefined
  depth?: sdk.DepthData | undefined
  ticker?: Ticker | undefined
  ammPoolSnapshot?: sdk.AmmPoolSnapshot | undefined
  tradeChannel?: undefined | sdk.TradeChannel
  orderType?: undefined | sdk.OrderType
  feeBips?: number | string
  takerRate?: number | string
  quoteMinAmtInfo?: number | string
  buyMinAmtInfo?: undefined | sdk.OrderInfo
  sellMinAmtInfo?: undefined | sdk.OrderInfo
  lastStepAt?: 'sell' | 'buy' | undefined
  close?: string
  totalFee?: number | string
  maxFeeBips?: number
  feeTakerRate?: number
  tradeCost?: string
}

export type PageTradeLiteStatus = {
  pageTradeLite: PageTradeLite
  __DAYS__: 30
  __SUBMIT_LOCK_TIMER__: 1000
  __TOAST_AUTO_CLOSE_TIMER__: 3000
}
