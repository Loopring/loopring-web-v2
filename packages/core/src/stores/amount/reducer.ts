import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { AmountStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const initialState: AmountStates = {
  amountMap: undefined,
  __timerMap__: undefined,
  status: SagaStatus.PENDING,
  errorMessage: null,
}
export type AmountMap = sdk.LoopringMap<sdk.TokenAmount>

const amountMapSlice: Slice<AmountStates> = createSlice({
  name: 'amountMap',
  initialState,
  reducers: {
    getAmount(state, _action: PayloadAction<{ market: string }>) {
      state.status = SagaStatus.PENDING
    },
    resetAmount(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getAmountStatus(state, action: PayloadAction<AmountStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      state.amountMap = action.payload.amountMap //{...state.amountMap, ...action.payload.amountMap};
      state.__timerMap__ = action.payload.__timerMap__ //{...state.__timerMap__, ...action.payload.__timerMap__};
      state.status = SagaStatus.DONE
    },

    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { amountMapSlice }
export const { getAmount, resetAmount, getAmountStatus, statusUnset } = amountMapSlice.actions
