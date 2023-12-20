import { MyAmmLP, StateBase } from '@loopring-web/common-resources'
import { EarningsRow } from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'

export type UserRewards = sdk.AmmUserRewardMap
export type MyAmmLPMap<R extends { [key: string]: any }> = {
  [key in keyof R]: MyAmmLP<R>
}
export type UserRewardsStates<R extends { [key: string]: any }, E = EarningsRow> = {
  userRewardsMap?: UserRewards | undefined
  defiAverageMap:
    | {
        [key in keyof R]: {
          list: Array<{
            sellToken: sdk.TokenVolumeV3
            buyToken: sdk.TokenVolumeV3
            price: string
          }>
          average: string
          priceTotal: string
        }
      }
    | undefined
  myAmmLPMap: MyAmmLPMap<R> | undefined
  totalClaims: { [key in keyof R]: E }
  rewardU: string
  feeU: string
  __timer__: NodeJS.Timeout | -1
} & StateBase
