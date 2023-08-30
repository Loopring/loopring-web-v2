import { useDispatch, useSelector } from 'react-redux'
import { reset, socketUpdateBalance, statusUnset, updateWalletLayer2 } from './reducer'
import { WalletLayer2States } from './interface'
import React from 'react'
import * as loopring_defs from '@loopring-web/loopring-sdk'

export function useWalletLayer2(): WalletLayer2States & {
  updateWalletLayer2: () => void
  socketUpdateBalance: (balance: { [key: string]: loopring_defs.UserBalanceInfo }) => void
  statusUnset: () => void
  resetLayer2: () => void
} {
  const walletLayer2: WalletLayer2States = useSelector((state: any) => state.walletLayer2)
  const dispatch = useDispatch()

  return {
    ...walletLayer2,
    resetLayer2: React.useCallback(() => {
      dispatch(reset(undefined))
    }, [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateWalletLayer2: React.useCallback(
      () => dispatch(updateWalletLayer2(undefined)),
      [dispatch],
    ),
    socketUpdateBalance: React.useCallback(
      (balance: { [key: string]: loopring_defs.UserBalanceInfo }) =>
        dispatch(socketUpdateBalance(balance)),
      [dispatch],
    ),
  }
}
