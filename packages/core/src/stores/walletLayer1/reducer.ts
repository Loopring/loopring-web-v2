import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { WalletLayer1Map, WalletLayer1States } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: WalletLayer1States = {
  walletLayer1: undefined,
  status: SagaStatus.DONE,
  errorMessage: null,
}
const walletLayer1Slice: Slice = createSlice({
  name: 'walletLayer1',
  initialState,
  reducers: {
    updateWalletLayer1(state, _action: PayloadAction<string | undefined>) {
      state.status = SagaStatus.PENDING
    },
    reset(state, _action: PayloadAction<string | undefined>) {
      state.walletLayer1 = undefined
      state.status = SagaStatus.DONE
    },
    getWalletLayer1Status(state, action: PayloadAction<{ walletLayer1: WalletLayer1Map<object> }>) {
      // @ts-ignore
      if (action.payload.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.payload.error
        return
      }
      state.errorMessage = undefined
      state.walletLayer1 = { ...action.payload.walletLayer1 }
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { walletLayer1Slice }
export const { updateWalletLayer1, getWalletLayer1Status, statusUnset, reset } =
  walletLayer1Slice.actions
