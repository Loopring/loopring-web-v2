import { StateBase, TickerNew } from '@loopring-web/common-resources'

export type VaultTickerMap<R = { [key: string]: any }> = {
  [key in keyof R]: TickerNew
}
export type VaultTickerStates<C = { [key: string]: any }> = {
  vaultTickerMap: VaultTickerMap<C>
  __timer__?: number
} & StateBase
