import { useDispatch, useSelector } from 'react-redux'
import { getAmount, resetAmount, statusUnset } from './reducer'
import { AmountStates } from './interface'
import React from 'react'

export function useAmount(): AmountStates & {
  getAmount: ({ market }: { market: string }) => void
  statusUnset: () => void
  resetAmount: () => void
} {
  const amountMap: AmountStates = useSelector((state: any) => state.amountMap)
  const dispatch = useDispatch()
  return {
    ...amountMap,
    resetAmount: React.useCallback(() => dispatch(resetAmount(undefined)), [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getAmount: React.useCallback(({ market }) => dispatch(getAmount({ market })), [dispatch]),
  }
}
