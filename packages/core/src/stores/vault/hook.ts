import { useDispatch, useSelector } from 'react-redux'
import {
  reset,
  // socketUpdateBalance,
  statusUnset,
  updateVaultLayer2,
} from './reducer'
import { VaultLayer2States } from './interface'
import React from 'react'

// import * as sdk from '@loopring-web/loopring-sdk'

export function useVaultLayer2(): VaultLayer2States & {
  updateVaultLayer2: () => void
  // socketUpdateBalance: (balance: { [key: string]: loopring_defs.UserBalanceInfo }) => void
  statusUnset: () => void
  resetLayer2: () => void
} {
  const vaultLayer2: VaultLayer2States = useSelector((state: any) => state.vaultLayer2)
  const dispatch = useDispatch()
  return {
    ...vaultLayer2,
    resetLayer2: React.useCallback(() => {
      dispatch(reset(undefined))
    }, [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateVaultLayer2: React.useCallback(() => dispatch(updateVaultLayer2(undefined)), [dispatch]),
    // socketUpdateBalance: React.useCallback(
    //   (balance: { [key: string]: sdk. }) =>
    //     dispatch(socketUpdateBalance(balance)),
    //   [dispatch],
    // ),
  }
}
