import { AmmDetail, StateBase } from '@loopring-web/common-resources'
import { AmmPoolInfoV3, LoopringMap } from '@loopring-web/loopring-sdk'

export type GetAmmMapParams = { ammpools: LoopringMap<AmmPoolInfoV3> }

export type AmmDetailStore<T> = AmmDetail<T>
export type AmmMap<R extends { [key: string]: any }, I extends { [key: string]: any }> = {
  [key in keyof R]: AmmDetailStore<I>
}
export type AmmMapStates<R extends { [key: string]: any }, I extends { [key: string]: any }> = {
  ammMap: AmmMap<R, I>
  ammArrayEnable: AmmDetailStore<I>[]
  __timer__?: number
} & StateBase
