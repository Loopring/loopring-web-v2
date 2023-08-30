import { CoinMap, StateBase, VaultMarketExtends } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { LoopringMap, TokenAddress } from '@loopring-web/loopring-sdk'

export type VaultUIMap = VaultMarketExtends
export type VaultMap = {
  marketArray: string[]
  marketCoins: string[]
  marketMap: sdk.LoopringMap<VaultUIMap>
  tradeMap: sdk.LoopringMap<{ tokenId: number; tradePairs: string[] }>
  coinMap: CoinMap<any>
  // pairs: sdk.LoopringMap<sdk.TokenRelatedInfo>
  idIndex: LoopringMap<number>
  addressIndex: sdk.LoopringMap<TokenAddress>
  tokensMap: sdk.LoopringMap<sdk.VaultToken>
}

export type VaultMapStates = VaultMap & {
  __timer__?: number
} & StateBase
