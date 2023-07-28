import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { DefiMapStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<DefiMapStates> = {
  marketArray: [],
  marketCoins: [],
  marketMap: {},
  marketLeverageMap: {},
  marketLeverageCoins: [],
  marketLeverageArray: [],
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
}
const defiMapSlice: Slice = createSlice({
  name: 'defiMap',
  initialState,
  reducers: {
    getDefiMap(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getDefiMapStatus(state, action: PayloadAction<DefiMapStates>) {
      if ((action.payload as any).error) {
        state.status = SagaStatus.ERROR
        state.errorMessage = (action.payload as any).error
        return
      }
      state.errorMessage = null
      const { __timer__, ...defiMap } = action.payload
      if (defiMap) {
        state.marketArray = defiMap.marketArray
        state.marketCoins = defiMap.marketCoins
        state.marketMap = defiMap.marketMap
        state.marketLeverageMap = defiMap.marketLeverageMap
        state.marketLeverageCoins = defiMap.marketLeverageCoins
        state.marketLeverageArray = defiMap.marketLeverageArray
        // , marketCoins, marketMap
        // state.marketArray = { ...state, ...defiMap };
      }
      if (__timer__) {
        state.__timer__ = __timer__
      }
      state.status = SagaStatus.DONE
    },
    updateDefiSyncMap(state, _action: PayloadAction<DefiMapStates>) {
      state.status = SagaStatus.PENDING
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
const { getDefiMap, updateDefiSyncMap, getDefiMapStatus, statusUnset } = defiMapSlice.actions
export { defiMapSlice, getDefiMap, getDefiMapStatus, statusUnset, updateDefiSyncMap }
