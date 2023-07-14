import { useDispatch, useSelector } from 'react-redux'
import { updateTradeStake, resetTradeStake, updateRedeemStake, resetRedeemStake } from './reducer'
import { RedeemStakeStatus, TradeStakeStatus } from './interface'
import React from 'react'
import { RedeemStake, TradeStake } from '@loopring-web/common-resources'

export function useTradeStake<C extends { [key: string]: any }>(): TradeStakeStatus<C> & {
  updateTradeStake: (tradeStake: Partial<TradeStake<C>>) => void
  resetTradeStake: () => void
} {
  const tradeStakeStatus: TradeStakeStatus<C> = useSelector(
    (state: any) => state._router_tradeStake,
  )
  const dispatch = useDispatch()
  return {
    ...tradeStakeStatus,
    updateTradeStake: React.useCallback(
      (tradeStake: Partial<TradeStake<C>>) => {
        dispatch(updateTradeStake(tradeStake))
      },
      [dispatch],
    ),
    resetTradeStake: React.useCallback(() => {
      dispatch(resetTradeStake(undefined))
    }, [dispatch]),
  }
}

export function useRedeemStake<C extends { [key: string]: any }>(): RedeemStakeStatus<C> & {
  updateRedeemStake: (RedeemStake: Partial<RedeemStake<C>>) => void
  resetRedeemStake: () => void
} {
  const redeemStakeStatus: RedeemStakeStatus<C> = useSelector(
    (state: any) => state._router_redeemStake,
  )
  const dispatch = useDispatch()
  return {
    ...redeemStakeStatus,
    updateRedeemStake: React.useCallback(
      (redeemStake: Partial<RedeemStake<C>>) => {
        dispatch(updateRedeemStake(redeemStake))
      },
      [dispatch],
    ),
    resetRedeemStake: React.useCallback(() => {
      dispatch(resetRedeemStake(undefined))
    }, [dispatch]),
  }
}
