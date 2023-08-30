import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { RootState } from '../../index'
import { getVaultMap, statusUnset } from './reducer'
import { VaultMap, VaultMapStates } from './interface'

export const useVaultMap = (): VaultMapStates & {
  getVaultMap: () => void
  statusUnset: () => void
  updateVaultSyncMap: (props: { btradeMap: VaultMap }) => void
} => {
  const btradeMap: VaultMapStates = useSelector((state: RootState) => state.invest.btradeMap)
  const dispatch = useDispatch()
  return {
    ...btradeMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getVaultMap: React.useCallback(() => dispatch(getVaultMap(undefined)), [dispatch]),
    updateVaultSyncMap: React.useCallback(
      ({ btradeMap }: { btradeMap: VaultMap }) => dispatch(getVaultMap(btradeMap)),
      [dispatch],
    ),
  }
}
