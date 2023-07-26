import { MyAmmLP, StateBase } from '@loopring-web/common-resources'
import { AmmUserRewardMap } from '@loopring-web/loopring-sdk'
import { EarningsRow } from '@loopring-web/component-lib'

export type UserRewards = AmmUserRewardMap
export type MyAmmLPMap<R extends { [key: string]: any }> = {
  [key in keyof R]: MyAmmLP<R>
}
export type UserRewardsStates<R extends { [key: string]: any }, E = EarningsRow> = {
  userRewardsMap?: UserRewards | undefined
  myAmmLPMap: MyAmmLPMap<R> | undefined
  totalClaims: { [key in keyof R]: E }
  rewardU: string
  feeU: string
  __timer__: NodeJS.Timeout | -1
} & StateBase
