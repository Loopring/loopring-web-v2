import { useDispatch, useSelector } from 'react-redux'
import { FavoriteMarketStates } from './interface'
import { addMarket, addMarkets, clearAll, removeMarket } from './reducer'
import React from 'react'

export const useFavoriteMarket = (): {
  favoriteMarket: FavoriteMarketStates
  clearAll: () => void
  removeMarket: (pair: string) => void
  addMarket: (pair: string) => void
  addMarkets: (pair: string[]) => void
} => {
  const favoriteMarket: FavoriteMarketStates = useSelector(
    (state: any) => state.localStore.favoriteMarket,
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
