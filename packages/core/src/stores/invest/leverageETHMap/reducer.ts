import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { LeverageETHMapStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<LeverageETHMapStates> = {
  marketArray: [],
  marketCoins: [],
  marketMap: {},
}
const leverageETHMapSlice: Slice = createSlice({
  name: 'leverageETHMap',
  initialState,
  reducers: {
    // getLeverageETHMap(state, _action: PayloadAction<undefined>) {
    //   state.status = SagaStatus.PENDING;
    // },
    // getLeverageETHMapStatus(state, action: PayloadAction<LeverageETHMapStates>) {
    //   // @ts-ignore
    //   if (action.error) {
    //     state.status = SagaStatus.ERROR;
    //     // @ts-ignore
    //     state.errorMessage = action.error;
    //   }
    //   const { __timer__, ...leverageETHMap } = action.payload;
    //   if (leverageETHMap) {
    //     state.marketArray = leverageETHMap.marketArray;
    //     state.marketCoins = leverageETHMap.marketCoins;
    //     state.marketMap = leverageETHMap.marketMap;
    //     // , marketCoins, marketMap
    //     // state.marketArray = { ...state, ...leverageETHMap };
    //   }
    //   if (__timer__) {
    //     state.__timer__ = __timer__;
    //   }
    //   state.status = SagaStatus.DONE;
    // },
    updateLeverageETHMap(state, _action: PayloadAction<{ leverageETHMap: LeverageETHMapStates }>) {
      // debugger
      if (_action.payload) {
        state.marketArray = _action.payload.leverageETHMap.marketArray
        state.marketCoins = _action.payload.leverageETHMap.marketCoins
        state.marketMap = _action.payload.leverageETHMap.marketMap
      }
    },
    // statusUnset: (state) => {
    //   state.status = SagaStatus.UNSET;
    // },
  },
})
const { getLeverageETHMap, updateLeverageETHMap, getLeverageETHMapStatus, statusUnset } =
  leverageETHMapSlice.actions
export {
  leverageETHMapSlice,
  getLeverageETHMap,
  getLeverageETHMapStatus,
  statusUnset,
  updateLeverageETHMap,
}
