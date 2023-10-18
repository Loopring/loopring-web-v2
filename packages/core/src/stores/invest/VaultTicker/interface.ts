import { MarketTableRawDataItem, StateBase } from '@loopring-web/common-resources'

export type VaultTickerMap<R = { [key: string]: any }> = {
  [key in keyof R]: MarketTableRawDataItem
}
export type VaultTickerStates<C = { [key: string]: any }> = {
  vaultTickerMap: VaultTickerMap<C>
  __timer__?: number
} & StateBase
