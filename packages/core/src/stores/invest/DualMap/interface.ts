import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export type DualMap = {
  marketArray: string[]
  marketCoins: string[]
  marketMap: sdk.LoopringMap<sdk.DefiMarketInfo>
  tradeMap: sdk.LoopringMap<{ tokenId: number; tokenList: string[]; quoteList }>
}

export type DualMapStates = DualMap & {
  __timer__?: number
} & StateBase
