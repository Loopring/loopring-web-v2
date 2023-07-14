import { MyAmmLP, StateBase } from '@loopring-web/common-resources'
import { AmmUserRewardMap } from '@loopring-web/loopring-sdk'

export type UserRewards = AmmUserRewardMap
export type MyAmmLPMap<R extends { [key: string]: any }> = {
  [key in keyof R]: MyAmmLP<R>
}
export type UserRewardsStates<R extends { [key: string]: any }> = {
  userRewardsMap?: UserRewards | undefined
  myAmmLPMap: MyAmmLPMap<R> | undefined
  rewardU: string
  feeU: string
  __timer__: NodeJS.Timeout | -1
} & StateBase
