import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { TradeProSettings } from './interface'

const initialState: TradeProSettings = {
  hideOtherTradingPairs: false,
}

const tradeProSettingsSlice: Slice<TradeProSettings> = createSlice<
  TradeProSettings,
  SliceCaseReducers<TradeProSettings>,
  'tradeProSettings'
>({
  name: 'tradeProSettings',
  initialState,
  reducers: {
    updateHideOtherPairs(state: TradeProSettings, action: PayloadAction<{ isHide: boolean }>) {
      const tradeProSettings = action.payload
      state.hideOtherTradingPairs = tradeProSettings.isHide
    },
  },
})

export { tradeProSettingsSlice }
export const { updateHideOtherPairs } = tradeProSettingsSlice.actions
