import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { BtradeMapStates } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";

const initialState: Required<BtradeMapStates> = {
  marketArray: [],
  marketCoins: [],
  marketMap: {},
  tradeMap: {},
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
};
const btradeMapSlice: Slice = createSlice({
  name: "btradeMap",
  initialState,
  reducers: {
    getBtradeMap(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING;
    },
    getBtradeMapStatus(state, action: PayloadAction<BtradeMapStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR;
        // @ts-ignore
        state.errorMessage = action.error;
      }
      const { __timer__, ...btradeMap } = action.payload;
      if (btradeMap) {
        state.marketArray = btradeMap.marketArray;
        state.marketCoins = btradeMap.marketCoins;
        state.marketMap = btradeMap.marketMap;
        state.tradeMap = btradeMap.tradeMap;
        // , marketCoins, marketMap
        // state.marketArray = { ...state, ...BtradeMap };
      }
      if (__timer__) {
        state.__timer__ = __timer__;
      }
      state.status = SagaStatus.DONE;
    },
    updateBtradeSyncMap(state, _action: PayloadAction<BtradeMapStates>) {
      state.status = SagaStatus.PENDING;
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET;
    },
  },
});
const { getBtradeMap, updateBtradeSyncMap, getBtradeMapStatus, statusUnset } =
  btradeMapSlice.actions;
export {
  btradeMapSlice,
  getBtradeMap,
  getBtradeMapStatus,
  statusUnset,
  updateBtradeSyncMap,
};
