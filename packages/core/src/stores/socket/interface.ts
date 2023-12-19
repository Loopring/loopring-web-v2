/* eslint-disable  @typescript-eslint/ban-types */
/* tslint:disable  @typescript-eslint/ban-types */
import * as sdk from '@loopring-web/loopring-sdk'

export type TickerSocket = string
export type SocketUserMap = {
  // @ts-ignore
  [sdk.WsTopicType.account]?: boolean
  // @ts-ignore
  [sdk.WsTopicType.notification]?: {
    address: string
    network: sdk.NetworkWallet
  }
  // @ts-ignore
  [sdk.WsTopicType.l2Common]?: {
    address: string
    network: sdk.NetworkWallet
  }
}
//sdk.WsTopicType.
export type SocketMap = {
  // @ts-ignore
  [sdk.WsTopicType.ticker]?: TickerSocket[]
  // @ts-ignore
  [sdk.WsTopicType.order]?: any[]
  // @ts-ignore
  [sdk.WsTopicType.trade]?: any[]
  // @ts-ignore
  [sdk.WsTopicType.mixtrade]?: any[]
  // @ts-ignore
  [sdk.WsTopicType.candlestick]?: any[]
  // @ts-ignore
  [sdk.WsTopicType.ammpool]?: any[]
  // @ts-ignore
  [sdk.WsTopicType.orderbook]?: {
    markets: any[]
    level?: number
    count?: number
    snapshot?: boolean
  }
  // @ts-ignore
  [sdk.WsTopicType.mixorder]?: {
    showOverlap?: boolean
    markets: any[]
    level?: number
    count?: number
    snapshot?: boolean
  }
  // @ts-ignore
  [sdk.WsTopicType.btradedepth]?: {
    showOverlap?: boolean
    markets: any[]
    level?: number
    count?: number
    snapshot?: boolean
  }
}
