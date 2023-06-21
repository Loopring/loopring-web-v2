import { useDispatch, useSelector } from 'react-redux'
import { AmmActivityMapStates } from './interface'
import { getAmmActivityMap, statusUnset } from './reducer'
import React from 'react'

export function useAmmActivityMap(): AmmActivityMapStates & {
  getAmmActivityMap: () => void
  statusUnset: () => void
} {
  const ammActivityMap: AmmActivityMapStates = useSelector((state: any) => state.amm.ammActivityMap)
  const dispatch = useDispatch()
  return {
    ...ammActivityMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getAmmActivityMap: React.useCallback(() => dispatch(getAmmActivityMap(undefined)), [dispatch]),
  }
}
