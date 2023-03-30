import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { CexMapStates } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";

const initialState: Required<CexMapStates> = {
  marketArray: [],
  marketCoins: [],
  marketMap: {},
  tradeMap: {},
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
};
const cexMapSlice: Slice = createSlice({
  name: "cexMap",
  initialState,
  reducers: {
    getCexMap(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING;
    },
    getCexMapStatus(state, action: PayloadAction<CexMapStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR;
        // @ts-ignore
        state.errorMessage = action.error;
      }
      const { __timer__, ...cexMap } = action.payload;
      if (cexMap) {
        state.marketArray = cexMap.marketArray;
        state.marketCoins = cexMap.marketCoins;
        state.marketMap = cexMap.marketMap;
        state.tradeMap = cexMap.tradeMap;
        // , marketCoins, marketMap
        // state.marketArray = { ...state, ...CexMap };
      }
      if (__timer__) {
        state.__timer__ = __timer__;
      }
      state.status = SagaStatus.DONE;
    },
    updateCexSyncMap(state, _action: PayloadAction<CexMapStates>) {
      state.status = SagaStatus.PENDING;
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET;
    },
  },
});
const { getCexMap, updateCexSyncMap, getCexMapStatus, statusUnset } =
  cexMapSlice.actions;
export {
  cexMapSlice,
  getCexMap,
  getCexMapStatus,
  statusUnset,
  updateCexSyncMap,
};
