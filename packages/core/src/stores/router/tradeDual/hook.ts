import { useDispatch, useSelector } from 'react-redux'
import { updateTradeDual, resetTradeDual } from './reducer'
import { TradeDual, TradeDualStatus } from './interface'
import React from 'react'
import { DualViewInfo } from '@loopring-web/common-resources'

export function useTradeDual<R = DualViewInfo>(): TradeDualStatus<R> & {
  updateTradeDual: (tradeDual: Partial<TradeDual<R>>) => void
  resetTradeDual: () => void
} {
  const tradeDualStatus: TradeDualStatus<R> = useSelector((state: any) => state._router_tradeDual)
  const dispatch = useDispatch()
  return {
    ...tradeDualStatus,
    updateTradeDual: React.useCallback(
      (tradeDual: Partial<TradeDual<R>>) => {
        dispatch(updateTradeDual(tradeDual))
      },
      [dispatch],
    ),
    resetTradeDual: React.useCallback(() => {
      dispatch(resetTradeDual(undefined))
    }, [dispatch]),
  }
}
