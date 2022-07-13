import { combineReducers } from "@reduxjs/toolkit";

import { defiMapFork } from "./DefiMap/saga";
import * as defiReducer from "./DefiMap/reducer";
import * as investTokenTypeMapReducer from "./InvestTokenTypeMap/reducer";
import { investTokenTypeForks } from "./InvestTokenTypeMap/saga";

export const investReducer = combineReducers({
  defiMap: defiReducer.defiMapSlice.reducer,
  investTokenTypeMap: investTokenTypeMapReducer.investTokenTypeMapSlice.reducer,
});
export const investForks = [...defiMapFork, ...investTokenTypeForks];

export * from "./DefiMap";
export * from "./InvestTokenTypeMap";
