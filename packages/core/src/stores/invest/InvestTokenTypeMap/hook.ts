import { InvestTokenTypeMapStates } from './interface'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../index'
import React from 'react'
import { getInvestTokenTypeMap, statusUnset } from './reducer'

export const useInvestTokenTypeMap = (): InvestTokenTypeMapStates & {
  getInvestTokenTypeMap: () => void
  statusUnset: () => void
} => {
  const investTokenTypeMap: InvestTokenTypeMapStates = useSelector(
    (state: RootState) => state.invest.investTokenTypeMap,
  )
  const dispatch = useDispatch()
  return {
    ...investTokenTypeMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getInvestTokenTypeMap: React.useCallback(
      () => dispatch(getInvestTokenTypeMap(undefined)),
      [dispatch],
    ),
  }
}
