import { createSlice, PayloadAction, Slice, SliceCaseReducers } from '@reduxjs/toolkit'
import { FavoriteMarketStates } from '../favoriteMarket'

const favoriteVaultMarketSlice: Slice<FavoriteMarketStates> = createSlice<
  FavoriteMarketStates,
  SliceCaseReducers<FavoriteMarketStates>,
  'favoriteVaultMarket'
>({
  name: 'favoriteVaultMarket',
  initialState: [],
  reducers: {
    clearAll(state: FavoriteMarketStates, _action: PayloadAction<undefined>) {
      state.length = 0
    },
    removeMarket(state: FavoriteMarketStates, action: PayloadAction<string>) {
      const pair = action.payload
      if (pair && state.includes(pair)) {
        const index = state.findIndex((_pair) => _pair === pair)
        state.splice(index, 1)
      }
    },
    addMarket(state: FavoriteMarketStates, action: PayloadAction<string>) {
      const pair = action.payload
      if (pair && state.findIndex((_pair: string) => _pair === pair) === -1) {
        state.push(pair)
      }
    },
    addMarkets(state: FavoriteMarketStates, action: PayloadAction<string[]>) {
      const pairs = action.payload
      if (pairs.length) {
        pairs.forEach((pair) => {
          if (pair && state.findIndex((_pair: string) => _pair === pair) === -1) {
            state.push(pair)
          }
        })
      }
    },
  },
})
export { favoriteVaultMarketSlice }
export const { clearAll, removeMarket, addMarket, addMarkets } = favoriteVaultMarketSlice.actions
