import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { InvestTokenTypeMap, InvestTokenTypeMapStates } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";

const initialState: Required<InvestTokenTypeMapStates> = {
  investTokenTypeMap: {},
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
  },
});
const { getInvestTokenTypeMapStatus, getInvestTokenTypeMap } =
  investTokenTypeMapSlice.actions;
export {
  investTokenTypeMapSlice,
  getInvestTokenTypeMapStatus,
  getInvestTokenTypeMap,
};
