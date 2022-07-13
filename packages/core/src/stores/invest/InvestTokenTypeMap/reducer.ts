import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { InvestTokenTypeMap, InvestTokenTypeMapStates } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";

const initialState: Required<InvestTokenTypeMapStates> = {
  investTokenTypeMap: {},
  status: SagaStatus.PENDING,
  errorMessage: null,
};
const investTokenTypeMapSlice: Slice = createSlice({
  name: "investTokenTypeMap",
  initialState,
  reducers: {
    getInvestTokenTypeMap(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING;
    },
    getInvestTokenTypeMapStatus(
      state,
      _action: PayloadAction<{ investTokenTypeMap: InvestTokenTypeMap }>
    ) {
      state.investTokenTypeMap = _action.payload.investTokenTypeMap;
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET;
    },
  },
});
const { getInvestTokenTypeMapStatus, getInvestTokenTypeMap, statusUnset } =
  investTokenTypeMapSlice.actions;
export {
  statusUnset,
  investTokenTypeMapSlice,
  getInvestTokenTypeMapStatus,
  getInvestTokenTypeMap,
};
