import { StateBase, Ticker } from '@loopring-web/common-resources'

export type TickerMap<R extends { [key: string]: any }> = {
  [key in keyof R]: Ticker
}
export type TickerStates<C = { [key: string]: any }> = {
  tickerMap: TickerMap<C>
  __timer__?: number
} & StateBase
