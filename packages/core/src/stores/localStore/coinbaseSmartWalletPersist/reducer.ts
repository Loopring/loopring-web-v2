import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { CoinbaseSmartWalletPersist, CoinbaseSmartWalletPersistData } from './interface'

const initialState: CoinbaseSmartWalletPersist = {
  data: undefined
} 

const coinbaseSmartWalletPersistSlice: Slice<CoinbaseSmartWalletPersist> = createSlice<
  CoinbaseSmartWalletPersist,
  SliceCaseReducers<CoinbaseSmartWalletPersist>
>({
  name: 'coinbaseSmartWalletPersist',
  initialState: initialState,
  reducers: {
    persistStoreCoinbaseSmartWalletData(state, action: PayloadAction<CoinbaseSmartWalletPersistData>) {
      debugger
      state.data = action.payload
    },
  },
})
export default coinbaseSmartWalletPersistSlice
export const {
  persistStoreCoinbaseSmartWalletData,
} = coinbaseSmartWalletPersistSlice.actions
