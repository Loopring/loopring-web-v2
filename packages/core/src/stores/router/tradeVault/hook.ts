import { useDispatch, useSelector } from 'react-redux'
import {
  resetVaultBorrow,
  resetVaultExit,
  resetVaultJoin,
  resetVaultRepay,
  resetVaultSwap,
  updateVaultBorrow,
  updateVaultExit,
  updateVaultJoin,
  updateVaultRepay,
  updateVaultTrade,
} from './reducer'
import { TradeVault, TradeVaultStatus } from './interface'
import React from 'react'
import {
  IBData,
  VaultBorrowData,
  VaultExitData,
  VaultJoinData,
  VaultRepayData,
} from '@loopring-web/common-resources'

export function useTradeVault(): TradeVaultStatus & {
  updateTradeVault: (tradeVault: Partial<TradeVault>) => void
  updateVaultJoin: (vaultJoinData: Partial<VaultJoinData>) => void
  updateVaultExit: (vaultExitData: Partial<VaultExitData>) => void
  updateVaultBorrow: (vaultBorrowData: Partial<VaultBorrowData<IBData<any>>>) => void
  updateVaultRepay: (vaultRepayData: Partial<VaultRepayData<IBData<any>>>) => void
  resetVaultJoin: () => void
  resetVaultExit: () => void
  resetTradeVault: () => void
  resetVaultBorrow: () => void
  resetVaultRepay: () => void
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
        dispatch(updateVaultJoin(tradeVault))
      },
      [dispatch],
    ),
    updateVaultExit: React.useCallback(
      (tradeVault: Partial<VaultExitData>) => {
        dispatch(updateVaultExit(tradeVault))
      },
      [dispatch],
    ),
    updateVaultBorrow: React.useCallback(
      (tradeVault: Partial<VaultBorrowData<IBData<any>>>) => {
        dispatch(updateVaultBorrow(tradeVault))
      },
      [dispatch],
    ),
    updateVaultRepay: React.useCallback(
      (tradeVault: Partial<VaultRepayData<IBData<any>>>) => {
        dispatch(updateVaultRepay(tradeVault))
      },
      [dispatch],
    ),
    resetVaultJoin: React.useCallback(() => {
      dispatch(resetVaultJoin(undefined))
    }, [dispatch]),
    resetVaultExit: React.useCallback(() => {
      dispatch(resetVaultExit(undefined))
    }, [dispatch]),
    resetVaultBorrow: React.useCallback(() => {
      dispatch(resetVaultBorrow(undefined))
    }, [dispatch]),
    resetVaultRepay: React.useCallback(() => {
      dispatch(resetVaultRepay(undefined))
    }, [dispatch]),
  }
}
