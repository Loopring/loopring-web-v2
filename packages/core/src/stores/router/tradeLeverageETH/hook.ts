import { useDispatch, useSelector } from 'react-redux'
import { updateTradeLeverageETH, resetTradeLeverageETH } from './reducer'
import { TradeLeverageETHStatus } from './interface'
import React from 'react'
import { IBData, TradeDefi } from '@loopring-web/common-resources'
import { RootState } from '../../../stores'

export function useTradeLeverageETH(): TradeLeverageETHStatus<IBData<any>> & {
  updateTradeLeverageETH: (tradeLeverageETH: Partial<TradeDefi<IBData<any>>>) => void
  resetTradeLeverageETH: () => void
} {
  const tradeLeverageETHStatus = useSelector((state: RootState) => state._router_tradeLeverageETH)
  const dispatch = useDispatch()
  return {
    ...tradeLeverageETHStatus,
    updateTradeLeverageETH: React.useCallback(
      (tradeLeverageETH: Partial<TradeDefi<IBData<any>>>) => {
        dispatch(updateTradeLeverageETH(tradeLeverageETH))
      },
      [dispatch],
    ),
    resetTradeLeverageETH: React.useCallback(() => {
      dispatch(resetTradeLeverageETH(undefined))
    }, [dispatch]),
  }
}
