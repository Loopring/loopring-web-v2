import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { RootState } from '../../index'
import { getBtradeMap, statusUnset } from './reducer'
import { BtradeMap, BtradeMapStates } from './interface'

export const useBtradeMap = (): BtradeMapStates & {
  getBtradeMap: () => void
  statusUnset: () => void
  updateBtradeSyncMap: (props: { btradeMap: BtradeMap }) => void
} => {
  const btradeMap: BtradeMapStates = useSelector((state: RootState) => state.invest.btradeMap)
  const dispatch = useDispatch()
  return {
    ...btradeMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getBtradeMap: React.useCallback(() => dispatch(getBtradeMap(undefined)), [dispatch]),
    updateBtradeSyncMap: React.useCallback(
      ({ btradeMap }: { btradeMap: BtradeMap }) => dispatch(getBtradeMap(btradeMap)),
      [dispatch],
    ),
  }
}
