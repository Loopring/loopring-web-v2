import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export type VaultUIMap = { enabled: boolean | 'isFormLocal' } & Omit<sdk.BTRADE_MARKET, 'enabled'>
export type VaultMap = {
  marketArray: string[]
  marketCoins: string[]
  marketMap: sdk.LoopringMap<VaultUIMap>
  tradeMap: sdk.LoopringMap<{ tokenId: number; tradePairs: string[] }>
}

export type VaultMapStates = VaultMap & {
  __timer__?: number
} & StateBase
