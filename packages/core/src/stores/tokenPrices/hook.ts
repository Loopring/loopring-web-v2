import { useDispatch, useSelector } from 'react-redux'
import React from 'react'
import { TokenPricesStates } from './interface'
import { getTokenPrices, statusUnset } from './reducer'

export const useTokenPrices = <R extends { [key: string]: any }>(): TokenPricesStates<R> & {
  getTokenPrices: () => void
  statusUnset: () => void
} => {
  const tokenPrices: TokenPricesStates<R> = useSelector((state: any) => state.tokenPrices)
  const dispatch = useDispatch()
  return {
    ...tokenPrices,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getTokenPrices: React.useCallback(() => dispatch(getTokenPrices(undefined)), [dispatch]),
  }
}
