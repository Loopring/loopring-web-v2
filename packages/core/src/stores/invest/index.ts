import { combineReducers } from "@reduxjs/toolkit";

import { defiMapFork } from "./DefiMap/saga";
import * as defiReducer from "./DefiMap/reducer";
import * as investTokenTypeMapReducer from "./InvestTokenTypeMap/reducer";
import { investTokenTypeForks } from "./InvestTokenTypeMap/saga";
import { dualReducer } from "./DualMap";
import { dualMapFork } from "./DualMap/saga";

export const investReducer = combineReducers({
  defiMap: defiReducer.defiMapSlice.reducer,
  dualMap: dualReducer.dualMapSlice.reducer,
  investTokenTypeMap: investTokenTypeMapReducer.investTokenTypeMapSlice.reducer,
});
export const investForks = [
  ...defiMapFork,
  ...investTokenTypeForks,
  ...dualMapFork,
];

export * from "./DefiMap";
export * from "./DualMap";
export * from "./InvestTokenTypeMap";
