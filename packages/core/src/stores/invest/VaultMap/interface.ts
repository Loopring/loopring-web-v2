import { CoinKey, CoinMap, StateBase, VaultMarketExtends } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { LoopringMap, TokenAddress } from '@loopring-web/loopring-sdk'

export type VaultUIMap = VaultMarketExtends
export type VaultMap<
  R = {
    [key: string]: any
  },
> = {
  erc20Array: string[]
  marketArray: string[]
  marketCoins: string[]
  tokenPrices: sdk.LoopringMap<string>
  marketMap: sdk.LoopringMap<VaultUIMap & { wsMarket: string }>
  tradeMap: sdk.LoopringMap<{ tokenId: number; tradePairs: string[] }>
  coinMap: CoinMap<any>
  // pairs: sdk.LoopringMap<sdk.TokenRelatedInfo>
  joinTokenMap: sdk.LoopringMap<sdk.VaultToken>
  idIndex: LoopringMap<number>
  addressIndex: sdk.LoopringMap<TokenAddress>
  tokenMap: sdk.LoopringMap<
    sdk.VaultToken & {
      tradePairs: Array<CoinKey<R>>
    }
  >
  erc20Map: sdk.LoopringMap<sdk.VaultToken>
}

export type VaultMapStates = VaultMap & {
  __timer__?: number
} & StateBase
