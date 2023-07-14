import { StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

//key is market or AMM-${market}
export type Amount = {
  [key: string]: sdk.LoopringMap<sdk.TokenAmount>
}
export type TimerMap = { [key: string]: NodeJS.Timeout | -1 }
/**
 * @amountMap is only update weh
 */
export type AmountStates = {
  amountMap?: Amount | undefined
  __timerMap__?: TimerMap
} & StateBase
