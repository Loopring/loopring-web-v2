import { combineReducers } from "@reduxjs/toolkit";

import { defiMapSaga } from "./DefiMap/saga";
import * as defiReducer from "./DefiMap/reducer";

export const investReducer = combineReducers({
  defiMap: defiReducer.defiMapSlice.reducer,
});
export const investForks = [
  ...defiMapSaga,
  // fork(investRecordSaga),
  // fork(investTradesSaga)
];

export * from "./DefiMap";
