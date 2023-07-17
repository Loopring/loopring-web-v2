import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { DualMapStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<DualMapStates> = {
  marketArray: [],
  marketCoins: [],
  tradeMap: {},
  marketMap: {},
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
}
const dualMapSlice: Slice = createSlice({
  name: 'dualMap',
  initialState,
  reducers: {
    getDualMap(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getDualMapStatus(state, action: PayloadAction<DualMapStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      const { __timer__, ...dualMap } = action.payload

      if (dualMap) {
        state.marketArray = dualMap.marketArray
        state.marketCoins = dualMap.marketCoins
        state.marketMap = dualMap.marketMap
        state.tradeMap = dualMap.tradeMap
        // , marketCoins, marketMap
        // state.marketArray = { ...state, ...dualMap };
      }
      if (__timer__) {
        state.__timer__ = __timer__
      }
      state.status = SagaStatus.DONE
    },
    updateDualSyncMap(state, _action: PayloadAction<DualMapStates>) {
      state.status = SagaStatus.PENDING
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
const { getDualMap, updateDualSyncMap, getDualMapStatus, statusUnset } = dualMapSlice.actions
export { dualMapSlice, getDualMap, getDualMapStatus, statusUnset, updateDualSyncMap }
