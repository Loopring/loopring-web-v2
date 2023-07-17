import { useDispatch, useSelector } from 'react-redux'
import { getTokenMap, statusUnset } from './reducer'
import { GetTokenMapParams, TokenMapStates } from './interface'
import React from 'react'
import { PayloadAction } from '@reduxjs/toolkit'

export function useTokenMap<R extends { [key: string]: any }>(): TokenMapStates<R> & {
  getTokenMap: (props: PayloadAction<GetTokenMapParams<any>>) => void
  statusUnset: () => void
} {
  const tokenMap: TokenMapStates<R> = useSelector((state: any) => state.tokenMap)
  const dispatch = useDispatch()

  return {
    ...tokenMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getTokenMap: React.useCallback(
      (props: PayloadAction<GetTokenMapParams<R>>) => dispatch(getTokenMap(props)),
      [dispatch],
    ),
  }
}
