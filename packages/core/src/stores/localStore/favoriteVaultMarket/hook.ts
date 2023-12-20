import { useDispatch, useSelector } from 'react-redux'
import { addMarket, addMarkets, clearAll, removeMarket } from './reducer'
import React from 'react'
import { FavoriteMarketStates } from '../favoriteMarket'

export const useFavoriteVaultMarket = (): {
  favoriteMarket: FavoriteMarketStates
  clearAll: () => void
  removeMarket: (pair: string) => void
  addMarket: (pair: string) => void
  addMarkets: (pair: string[]) => void
} => {
  const favoriteMarket: FavoriteMarketStates = useSelector(
    (state: any) => state.localStore.favoriteVaultMarket,
  )
  const dispatch = useDispatch()
  return {
    favoriteMarket: favoriteMarket,
    clearAll: React.useCallback(() => dispatch(clearAll(undefined)), [dispatch]),
    removeMarket: React.useCallback((pair) => dispatch(removeMarket(pair)), [dispatch]),
    addMarket: React.useCallback((pair) => dispatch(addMarket(pair)), [dispatch]),
    addMarkets: React.useCallback((pairs) => dispatch(addMarkets(pairs)), [dispatch]),
  }
}
