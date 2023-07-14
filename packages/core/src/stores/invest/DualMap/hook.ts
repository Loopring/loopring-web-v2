import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { RootState } from '../../index'
import { getDualMap, statusUnset } from './reducer'
import { DualMap, DualMapStates } from './interface'

export const useDualMap = (): DualMapStates & {
  getDualMap: () => void
  statusUnset: () => void
  updateDualSyncMap: (props: { dualMap: DualMap }) => void
} => {
  const dualMap: DualMapStates = useSelector((state: RootState) => state.invest.dualMap)
  const dispatch = useDispatch()
  return {
    ...dualMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getDualMap: React.useCallback(() => dispatch(getDualMap(undefined)), [dispatch]),
    updateDualSyncMap: React.useCallback(
      ({ dualMap }: { dualMap: DualMap }) => dispatch(getDualMap(dualMap)),
      [dispatch],
    ),
  }
}
