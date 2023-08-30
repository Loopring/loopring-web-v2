import { useDispatch, useSelector } from 'react-redux'
import {
  resetVaultExit,
  resetVaultJoin,
  resetVaultSwap,
  updateVaultExit,
  updateVaultTrade,
} from './reducer'
import { TradeVault, TradeVaultStatus } from './interface'
import React from 'react'
import { VaultExitData, VaultJoinData } from '@loopring-web/common-resources'

export function useTradeVault(): TradeVaultStatus & {
  updateTradeVault: (tradeVault: Partial<TradeVault>) => void
  updateVaultJoin: (vaultJoinData: Partial<VaultJoinData>) => void
  updateVaultExit: (vaultExitData: Partial<VaultExitData>) => void
  resetVaultJoin: () => void
  resetVaultExit: () => void
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
    updateVaultJoin: React.useCallback(
      (tradeVault: Partial<VaultJoinData>) => {
        dispatch(updateVaultTrade(tradeVault))
      },
      [dispatch],
    ),
    updateVaultExit: React.useCallback(
      (tradeVault: Partial<VaultExitData>) => {
        dispatch(updateVaultExit(tradeVault))
      },
      [dispatch],
    ),
    resetVaultJoin: React.useCallback(() => {
      dispatch(resetVaultJoin(undefined))
    }, [dispatch]),
    resetVaultExit: React.useCallback(() => {
      dispatch(resetVaultExit(undefined))
    }, [dispatch]),
  }
}
