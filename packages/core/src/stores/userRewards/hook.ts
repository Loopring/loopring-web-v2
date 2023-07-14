import { useDispatch, useSelector } from 'react-redux'
import { getUserRewards, resetUserRewards, statusUnset } from './reducer'
import { UserRewardsStates } from './interface'
import React from 'react'

export function useUserRewards(): UserRewardsStates<UserRewardsStates<any>> & {
  getUserRewards: () => void
  statusUnset: () => void
  resetUserRewards: () => void
} {
  const userRewardsMap: UserRewardsStates<UserRewardsStates<any>> = useSelector(
    (state: any) => state.userRewardsMap,
  )
  const dispatch = useDispatch()
  return {
    ...userRewardsMap,
    resetUserRewards: React.useCallback(() => dispatch(resetUserRewards(undefined)), [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getUserRewards: React.useCallback(() => dispatch(getUserRewards(undefined)), [dispatch]),
  }
}
