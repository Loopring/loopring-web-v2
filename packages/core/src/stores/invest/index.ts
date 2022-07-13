import { combineReducers } from "@reduxjs/toolkit";

import { defiMapFork } from "./DefiMap/saga";
import * as defiReducer from "./DefiMap/reducer";
import * as investTokenTypeMapReducer from "./InvestTokenTypeMap/reducer";
import { investTokenTypeForks } from "./InvestTokenTypeMap/saga";

export const investReducer = combineReducers({
  defiMap: defiReducer.defiMapSlice.reducer,
  investTokenTypeMap: investTokenTypeMapReducer.investTokenTypeMapSlice.reducer,
});
export const investForks = [
  ...defiMapFork,
  ...investTokenTypeForks,
  // fork(investRecordSaga),
  // fork(investTradesSaga)
];

export * from "./DefiMap";
