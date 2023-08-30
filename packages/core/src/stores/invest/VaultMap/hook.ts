import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { RootState } from '../../index'
import { getVaultMap, statusUnset } from './reducer'
import { VaultMap, VaultMapStates } from './interface'

export const useVaultMap = (): VaultMapStates & {
  getVaultMap: () => void
  statusUnset: () => void
  updateVaultSyncMap: (props: { vaultMap: VaultMap }) => void
} => {
  const vaultMap: VaultMapStates = useSelector((state: RootState) => state.invest.vaultMap)
  const dispatch = useDispatch()
  return {
    ...vaultMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getVaultMap: React.useCallback(() => dispatch(getVaultMap(undefined)), [dispatch]),
    updateVaultSyncMap: React.useCallback(
      ({ vaultMap }: { vaultMap: VaultMap }) => dispatch(getVaultMap(vaultMap)),
      [dispatch],
    ),
  }
}
