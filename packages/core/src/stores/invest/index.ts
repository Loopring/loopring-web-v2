import { combineReducers } from "@reduxjs/toolkit";

import { defiMapFork } from "./DefiMap/saga";
import { cexMapFork } from "./CexMap/saga";

import * as defiReducer from "./DefiMap/reducer";
import * as stakingSlice from "./StakingMap/reducer";
import * as cexSlice from "./CexMap/reducer";

import * as investTokenTypeMapReducer from "./InvestTokenTypeMap/reducer";
import { investTokenTypeForks } from "./InvestTokenTypeMap/saga";
import { dualReducer } from "./DualMap";
import { dualMapFork } from "./DualMap/saga";
import { stakingMapFork } from "./StakingMap/saga";

export const investReducer = combineReducers({
  defiMap: defiReducer.defiMapSlice.reducer,
  dualMap: dualReducer.dualMapSlice.reducer,
  stakingMap: stakingSlice.stakingMapSlice.reducer,
  investTokenTypeMap: investTokenTypeMapReducer.investTokenTypeMapSlice.reducer,
  cexMap: cexSlice.cexMapSlice.reducer,
});
export const investForks = [
  ...defiMapFork,
  ...investTokenTypeForks,
  ...dualMapFork,
  ...stakingMapFork,
  ...cexMapFork,
];

export * from "./DefiMap";
export * from "./DualMap";
export * from "./InvestTokenTypeMap";
export * from "./StakingMap";
export * from "./CexMap";
