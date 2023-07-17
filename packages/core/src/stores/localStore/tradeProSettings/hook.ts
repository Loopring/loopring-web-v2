import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TradeProSettings } from './interface'
import { updateHideOtherPairs } from './reducer'
import { RootState } from '../../index'

export const useTradeProSettings = () => {
  const tradeProSettings: TradeProSettings = useSelector(
    (state: RootState) => state.localStore.tradeProSettings,
  )
  const dispatch = useDispatch()

  const updateIsHideOtherPairs = React.useCallback(
    ({ isHide }: { isHide: boolean }) => {
      dispatch(updateHideOtherPairs({ isHide }))
    },
    [dispatch],
  )

  return {
    tradeProSettings,
    updateIsHideOtherPairs,
  }
}
