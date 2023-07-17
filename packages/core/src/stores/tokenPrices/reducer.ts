import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { TokenPricesStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<TokenPricesStates<object>> = {
  tokenPrices: {},
  __rawConfig__: undefined,
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
}
const tokenPricesSlice: Slice = createSlice({
  name: 'tokenPrices',
  initialState,
  reducers: {
    resetTokenPrices(state) {
      if (state.__timer__ !== -1) {
        clearInterval(state.__timer__)
        state.__timer__ = -1
      }
      state.tokenPrices = {}
      state.status = SagaStatus.UNSET
    },
    getTokenPrices(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getTokenPricesStatus(state, action: PayloadAction<TokenPricesStates<any>>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      const { tokenPrices, __timer__, __rawConfig__ } = action.payload
      if (tokenPrices) {
        state.tokenPrices = tokenPrices
        state.__rawConfig__ = __rawConfig__
      }
      if (__timer__) {
        state.__timer__ = __timer__
      }
      state.status = SagaStatus.DONE
    },

    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { tokenPricesSlice }
export const { resetTokenPrices, getTokenPrices, getTokenPricesStatus, statusUnset } =
  tokenPricesSlice.actions
