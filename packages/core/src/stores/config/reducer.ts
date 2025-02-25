import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { Config, FastWithdrawConfig } from './interface'

const initialState: Config = {
  fastWithdrawConfig: undefined
}
export const configSlice: Slice<Config> = createSlice({
  name: 'system',
  initialState,
  reducers: {
    updateFastWithdrawConfig(state, action: PayloadAction<FastWithdrawConfig>) {
      state.fastWithdrawConfig = action.payload
    },
  },
})
export default configSlice
export const { updateFastWithdrawConfig } = configSlice.actions
