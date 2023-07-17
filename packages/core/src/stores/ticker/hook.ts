import { useDispatch, useSelector } from 'react-redux'
import { getTickers, statusUnset, updateTicker } from './reducer'
import { TickerStates } from './interface'
import { CoinKey } from '@loopring-web/common-resources'
import React from 'react'
import { LoopringMap, TickerData } from '@loopring-web/loopring-sdk'

export function useTicker(): TickerStates & {
  updateTickers: (tickerKeys: Array<CoinKey<any>>) => void
  updateTickerSync: (tickerMap: LoopringMap<TickerData>) => void
  statusUnset: () => void
} {
  const tickerMap: TickerStates = useSelector((state: any) => state.tickerMap)
  const dispatch = useDispatch()
  return {
    ...tickerMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateTickers: React.useCallback(
      (tickerKeys: Array<CoinKey<any>>) => dispatch(getTickers({ tickerKeys })),
      [dispatch],
    ),
    updateTickerSync: React.useCallback(
      (tickMap: LoopringMap<TickerData>) => dispatch(updateTicker(tickMap)),
      [dispatch],
    ),
  }
}
