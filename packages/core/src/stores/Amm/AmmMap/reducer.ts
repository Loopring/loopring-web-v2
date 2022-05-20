import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { AmmMapStates, GetAmmMapParams } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";
import { AmmPoolInfoV3, LoopringMap } from "@loopring-web/loopring-sdk";

const initialState: Required<AmmMapStates<object, object>> = {
  ammMap: undefined,
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
};
const ammMapSlice: Slice = createSlice({
  name: "ammMap",
  initialState,
  reducers: {
    initAmmMap(
      state,
      action: PayloadAction<{ ammpools: LoopringMap<AmmPoolInfoV3> }>
    ) {
      const ammpools = action.payload.ammpools;
      const ammMap: { [key: string]: string } = Reflect.ownKeys(
        ammpools
      ).reduce((prev, key) => {
        return {
          ...prev,
          [key]: {
            ...ammpools[key as string],
            __rawConfig__: ammpools[key as string],
          },
        };
      }, {});
      state.ammMap = ammMap;
    },
    getAmmMap(state, _action: PayloadAction<GetAmmMapParams>) {
      state.status = SagaStatus.PENDING;
    },
    getAmmMapStatus(state, action: PayloadAction<AmmMapStates<any, any>>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR;
        // @ts-ignore
        state.errorMessage = action.error;
      }
      const { ammMap, __timer__ } = action.payload;
      if (ammMap) {
        state.ammMap = ammMap;
      }
      if (__timer__) {
        state.__timer__ = __timer__;
      }
      state.status = SagaStatus.DONE;
    },
    updateRealTimeAmmMap(state, _action: PayloadAction<undefined>) {
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
