import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { RootState } from '../../index'
import { getStakingMap, statusUnset } from './reducer'
import { StakingMap, StakingMapStates } from './interface'

export const useStakingMap = (): StakingMapStates & {
  getStakingMap: () => void
  statusUnset: () => void
  updateStakingSyncMap: (props: { stakingMap: StakingMap }) => void
} => {
  const stakingMap: StakingMapStates = useSelector((state: RootState) => state.invest.stakingMap)
  const dispatch = useDispatch()
  return {
    ...stakingMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getStakingMap: React.useCallback(() => dispatch(getStakingMap(undefined)), [dispatch]),
    updateStakingSyncMap: React.useCallback(
      ({ stakingMap }: { stakingMap: StakingMap }) => dispatch(getStakingMap(stakingMap)),
      [dispatch],
    ),
  }
}
