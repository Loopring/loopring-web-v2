import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { CoinbaseSmartWalletPersist, CoinbaseSmartWalletPersistData } from './interface'

const initialState: CoinbaseSmartWalletPersist = {
  data: []
} 

const coinbaseSmartWalletPersistSlice: Slice<CoinbaseSmartWalletPersist> = createSlice<
  CoinbaseSmartWalletPersist,
  SliceCaseReducers<CoinbaseSmartWalletPersist>
>({
  name: 'coinbaseSmartWalletPersist',
  initialState: initialState,
  reducers: {
    persistStoreCoinbaseSmartWalletData(state, action: PayloadAction<CoinbaseSmartWalletPersistData>) {
      const filtered = state.data.filter((item) => !(item.chainId === action.payload.chainId && item.wallet === action.payload.wallet))
      state.data = [...filtered, action.payload]
    },
  },
})
export default coinbaseSmartWalletPersistSlice
export const {
  persistStoreCoinbaseSmartWalletData,
} = coinbaseSmartWalletPersistSlice.actions
