import { useDispatch, useSelector } from 'react-redux'
import { resetBtradeSwap, updateBtradeTrade } from './reducer'
import { TradeBtrade, TradeBtradeStatus } from './interface'
import React from 'react'

export function useTradeBtrade(): TradeBtradeStatus & {
  updateTradeBtrade: (tradeBtrade: Partial<TradeBtrade>) => void
  resetTradeBtrade: () => void
} {
  const tradeBtradeStatus: TradeBtradeStatus = useSelector(
    (state: any) => state._router_tradeBtrade,
  )
  const dispatch = useDispatch()
  return {
    ...tradeBtradeStatus,
    updateTradeBtrade: React.useCallback(
      (tradeBtrade: Partial<TradeBtrade>) => {
        dispatch(updateBtradeTrade(tradeBtrade))
      },
      [dispatch],
    ),
    resetTradeBtrade: React.useCallback(() => {
      dispatch(resetBtradeSwap(undefined))
    }, [dispatch]),
  }
}
