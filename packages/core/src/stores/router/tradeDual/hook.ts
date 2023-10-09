import { useDispatch, useSelector } from 'react-redux'
import { updateTradeDual, resetTradeDual, updateEditDual, resetEditDual } from './reducer'
import { EditDual, TradeDual, TradeDualStatus } from './interface'
import React from 'react'
import { DualViewInfo, DualViewOrder } from '@loopring-web/common-resources'

export function useTradeDual<R = DualViewInfo>(): TradeDualStatus<R> & {
  updateTradeDual: (tradeDual: Partial<TradeDual<R>>) => void
  resetTradeDual: () => void
  updateEditDual: (tradeDual: EditDual<any> & DualViewOrder) => void
  resetEditDual: () => void
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
    updateEditDual: React.useCallback(
      (tradeDual: EditDual<any> & DualViewOrder) => {
        dispatch(updateEditDual(tradeDual))
      },
      [dispatch],
    ),
    resetEditDual: React.useCallback(() => {
      dispatch(resetEditDual(undefined))
    }, [dispatch]),
  }
}
