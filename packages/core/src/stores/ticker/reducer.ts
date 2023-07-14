import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { TickerStates } from './interface'
import { CoinKey, SagaStatus } from '@loopring-web/common-resources'
import { LoopringMap, TickerData } from '@loopring-web/loopring-sdk'

const initialState: Required<TickerStates> = {
  tickerMap: {},
  __timer__: -1,
  status: 'PENDING',
  errorMessage: null,
}
const tickerMapSlice: Slice = createSlice({
  name: 'tickerMap',
  initialState,
  reducers: {
    resetTicker(state) {
      if (state.__timer__ !== -1) {
        clearInterval(state.__timer__)
        state.__timer__ = -1
      }
      state.tickerMap = {}
      state.status = SagaStatus.UNSET
    },
    updateTicker(state, _action: PayloadAction<LoopringMap<TickerData>>) {
      state.status = SagaStatus.PENDING
    },
    getTickers(state, _action: PayloadAction<Array<CoinKey<any>>>) {
      state.status = SagaStatus.PENDING
    },
    getTickerStatus(state, action: PayloadAction<TickerStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      const { tickerMap, __timer__ } = action.payload
      if (tickerMap) {
        state.tickerMap = tickerMap
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
export { tickerMapSlice }
export const { updateTicker, resetTicker, getTickers, getTickerStatus, statusUnset } =
  tickerMapSlice.actions
