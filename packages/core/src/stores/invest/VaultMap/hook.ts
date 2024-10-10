import { useDispatch } from 'react-redux'
import React from 'react'
import { store } from '../../index'
import { getVaultMap, statusUnset } from './reducer'
import { VaultMap, VaultMapStates } from './interface'

export const useVaultMap = (): VaultMapStates & {
  getVaultMap: () => void
  statusUnset: () => void
  updateVaultSyncMap: (props: { vaultMap: VaultMap }) => void
} => {
  const vaultMap: VaultMapStates = store.getState().invest.vaultMap
  //useSelector((state: RootState) => state.invest.vaultMap)
  const dispatch = useDispatch()
  return {
    ...vaultMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getVaultMap: React.useCallback(() => {
      return dispatch(getVaultMap(undefined))
    }, [dispatch]),
    updateVaultSyncMap: React.useCallback(
      ({ vaultMap }: { vaultMap: VaultMap }) => dispatch(getVaultMap(vaultMap)),
      [dispatch],
    ),
  }
}
