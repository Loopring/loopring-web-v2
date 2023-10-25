import { StateBase, TickerNew } from '@loopring-web/common-resources'

export type TickerMap<R = { [key: string]: any }> = {
  [key in keyof R]: TickerNew
}
export type VaultTickerStates<C = { [key: string]: any }> = {
  vaultTickerMap: TickerMap<C>
  __timer__?: number
} & StateBase
