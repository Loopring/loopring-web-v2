import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export type LeverageETHMap = {
  marketArray: string[]
  marketCoins: string[]
  marketMap: sdk.LoopringMap<sdk.DefiMarketInfo>
}

export type LeverageETHMapStates = LeverageETHMap
