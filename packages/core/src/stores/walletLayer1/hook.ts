import { useDispatch, useSelector } from 'react-redux'
import { reset, statusUnset, updateWalletLayer1 } from './reducer'
import { WalletLayer1States } from './interface'
import React from 'react'

export function useWalletLayer1(): WalletLayer1States & {
  updateWalletLayer1: () => void
  statusUnset: () => void
  resetLayer1: () => void
} {
  const walletLayer1: WalletLayer1States = useSelector((state: any) => state.walletLayer1)
  const dispatch = useDispatch()

  return {
    ...walletLayer1,
    resetLayer1: React.useCallback(() => {
      dispatch(reset(undefined))
    }, [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateWalletLayer1: React.useCallback(
      () => dispatch(updateWalletLayer1(undefined)),
      [dispatch],
    ),
  }
}
