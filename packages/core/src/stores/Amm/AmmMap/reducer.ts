import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { AmmMapStates, GetAmmMapParams } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";
import {
  AmmPoolInfoV3,
  ChainId,
  LoopringMap,
} from "@loopring-web/loopring-sdk";
import { AmmPoolStat } from "@loopring-web/loopring-sdk/dist/defs";

const initialState: Required<AmmMapStates<any, any>> = {
  ammMap: {},
  ammArrayEnable: [],
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
};
// @ts-ignore
const ammMapSlice: Slice<AmmMapStates<any, any>> = createSlice({
  name: "ammMap",
  initialState,
  reducers: {
    initAmmMap(
      state,
      action: PayloadAction<{
        ammpools: LoopringMap<AmmPoolInfoV3>;
        // ammpoolsRaw?: any;
        chainId: ChainId;
      }>
    ) {
      const ammpools = action.payload.ammpools;
      const ammMap = Reflect.ownKeys(ammpools).reduce((prev, key) => {
        let status: any = ammpools[key.toString()].status ?? 0;
        status = ("00000" + status.toString(2)).split("");
        let exitDisable = status[status.length - 1] === "0";
        let joinDisable = status[status.length - 2] === "0";
        let swapDisable = status[status.length - 3] === "0";
        let showDisable = status[status.length - 4] === "0";
        let isRiskyMarket = status[status.length - 5] === "1";
        return {
          ...prev,
          [key]: {
            ...ammpools[key as string],
            exitDisable,
            joinDisable,
            swapDisable,
            showDisable,
            isRiskyMarket,
            __rawConfig__: ammpools[key as string],
            market: key.toString().replace("AMM-", ""),
          },
        };
      }, {});
      state.ammMap = ammMap;
    },
    getAmmMap(
      state,
      _action: PayloadAction<
        GetAmmMapParams & { ammpoolsRaw?: any; chainId?: ChainId }
      >
    ) {
      state.status = SagaStatus.PENDING;
    },
    getAmmMapStatus(state, action: PayloadAction<AmmMapStates<any, any>>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR;
        // @ts-ignore
        state.errorMessage = action.error;
      } else {
        const { ammMap, ammArrayEnable, __timer__ } = action.payload;
        if (ammMap) {
          // myLog(ammMap["AMM-LRC-USDT"].tokens, "ammMap");
          state.ammMap = ammMap;
        }
        if (ammArrayEnable) {
          state.ammArrayEnable = ammArrayEnable;
        }
        if (__timer__) {
          state.__timer__ = __timer__;
        }
        state.status = SagaStatus.DONE;
      }
    },
    updateRealTimeAmmMap(
      state,
      _action: PayloadAction<{ ammPoolStats?: LoopringMap<AmmPoolStat> }>
    ) {
      state.status = SagaStatus.PENDING;
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET;
    },
  },
});
export { ammMapSlice };
export const {
  getAmmMap,
  initAmmMap,
  getAmmMapStatus,
  statusUnset,
  updateRealTimeAmmMap,
} = ammMapSlice.actions;
