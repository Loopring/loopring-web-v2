import { useDispatch, useSelector } from 'react-redux'
import { persistStoreCoinbaseSmartWalletData } from './reducer'
import React from 'react'
import { RootState } from '../../index'
import { CoinbaseSmartWalletPersist, CoinbaseSmartWalletPersistData } from './interface'

export function useCoinbaseSmartWalletPersist() {
  const state: CoinbaseSmartWalletPersist = useSelector(
    (state: RootState) => state.coinbaseSmartWalletPersist,
  )
  // const [shouldShow,setShouldShow] = React.useState(account._userOnModel)
  const dispatch = useDispatch()

  return {
    ...state,
    persistStoreCoinbaseSmartWalletData: React.useCallback(
      (data: CoinbaseSmartWalletPersistData) => {
        dispatch(persistStoreCoinbaseSmartWalletData(data))
      },
      [dispatch],
    ),
  }
}
