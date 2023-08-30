import { useDispatch, useSelector } from 'react-redux'
import { resetVaultSwap, updateVaultTrade } from './reducer'
import { TradeVault, TradeVaultStatus } from './interface'
import React from 'react'

export function useTradeVault(): TradeVaultStatus & {
  updateTradeVault: (tradeVault: Partial<TradeVault>) => void
  resetTradeVault: () => void
} {
  const tradeVaultStatus: TradeVaultStatus = useSelector((state: any) => state._router_tradeVault)
  const dispatch = useDispatch()
  return {
    ...tradeVaultStatus,
    updateTradeVault: React.useCallback(
      (tradeVault: Partial<TradeVault>) => {
        dispatch(updateVaultTrade(tradeVault))
      },
      [dispatch],
    ),
    resetTradeVault: React.useCallback(() => {
      dispatch(resetVaultSwap(undefined))
    }, [dispatch]),
  }
}
