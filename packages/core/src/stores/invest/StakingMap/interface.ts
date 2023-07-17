import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

export type StakingMap = {
  marketArray: string[]
  marketCoins: string[]
  marketMap: sdk.LoopringMap<sdk.STACKING_PRODUCT>
}

export type StakingMapStates = StakingMap & {
  __timer__?: number
} & StateBase
