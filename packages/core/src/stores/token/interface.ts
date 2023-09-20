import { CoinKey, CoinMap, StateBase } from '@loopring-web/common-resources'
import {
  LoopringMap,
  MarketInfo,
  TokenAddress,
  TokenInfo,
  TokenRelatedInfo,
} from '@loopring-web/loopring-sdk'

export type TokenMap<R extends { [key: string]: any }> = LoopringMap<
  TokenInfo & { tradePairs: Array<CoinKey<R>> }
>
export type GetTokenMapParams<_R extends { [key: string]: any }> = {
  tokenMap: LoopringMap<TokenInfo>
  coinMap: LoopringMap<{
    icon?: string
    name: string
    simpleName: string
    description?: string
    company: string
  }>
  totalCoinMap: LoopringMap<{
    icon?: string
    name: string
    simpleName: string
    description?: string
    company: string
  }>
  idIndex: LoopringMap<number>
  addressIndex: LoopringMap<TokenAddress>
  marketMap: LoopringMap<MarketInfo>
  pairs: LoopringMap<TokenRelatedInfo>
  marketArr: string[]
  tokenArr: string[]
  disableWithdrawTokenList: any[]
  tokenListRaw?: any
  disableWithdrawTokenListRaw?: any
  marketRaw: any
  // ammpoolsRaw?: any;
  // marketRaw?: any;
  //
}

export type AddressMap = {
  [key: string]: string
}

export type IdMap = {
  [key: number]: string
}

export type TokenMapStates<R extends { [key: string]: any }> = {
  coinMap: CoinMap<R>
  totalCoinMap?: CoinMap<R> | undefined
  marketArray: string[]
  marketCoins: string[]
  disableWithdrawList: string[]
  tokenMap: TokenMap<R>
  marketMap: LoopringMap<MarketInfo>
  addressIndex: AddressMap
  idIndex: IdMap
} & StateBase
