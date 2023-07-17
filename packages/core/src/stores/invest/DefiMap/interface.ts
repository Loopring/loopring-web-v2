import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export type DefiMap = {
  marketArray: string[]
  marketCoins: string[]
  marketMap: sdk.LoopringMap<sdk.DefiMarketInfo>
}

export type DefiMapStates = DefiMap & {
  __timer__?: number
} & StateBase
