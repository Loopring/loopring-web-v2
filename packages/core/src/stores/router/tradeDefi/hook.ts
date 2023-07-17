import { useDispatch, useSelector } from 'react-redux'
import { updateTradeDefi, resetTradeDefi } from './reducer'
import { TradeDefiStatus } from './interface'
import React from 'react'
import { TradeDefi } from '@loopring-web/common-resources'

export function useTradeDefi<C extends { [key: string]: any }>(): TradeDefiStatus<C> & {
  updateTradeDefi: (tradeDefi: Partial<TradeDefi<C>>) => void
  resetTradeDefi: () => void
} {
  const tradeDefiStatus: TradeDefiStatus<C> = useSelector((state: any) => state._router_tradeDefi)
  const dispatch = useDispatch()
  return {
    ...tradeDefiStatus,
    updateTradeDefi: React.useCallback(
      (tradeDefi: Partial<TradeDefi<C>>) => {
        dispatch(updateTradeDefi(tradeDefi))
      },
      [dispatch],
    ),
    resetTradeDefi: React.useCallback(() => {
      dispatch(resetTradeDefi(undefined))
    }, [dispatch]),
  }
}
