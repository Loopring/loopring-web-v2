import { useDispatch, useSelector } from 'react-redux'
import { getVaultTickers, statusUnset, updateVaultTicker } from './reducer'
import { VaultTickerStates } from './interface'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'

export function useVaultTicker(): VaultTickerStates & {
  updateVaultTickers: () => void
  updateVaultTickerSync: (item: sdk.DatacenterTokenQuote) => void
  statusUnset: () => void
} {
  const vaultTickerMap: VaultTickerStates = useSelector((state: any) => state.vaultTickerMap)
  const dispatch = useDispatch()
  return {
    ...vaultTickerMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateVaultTickers: React.useCallback(() => dispatch(getVaultTickers({})), [dispatch]),
    updateVaultTickerSync: React.useCallback(
      (item: sdk.DatacenterTokenQuote) => dispatch(updateVaultTicker(item)),
      [dispatch],
    ),
  }
}
