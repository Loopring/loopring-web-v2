import { combineReducers } from "@reduxjs/toolkit";

import { defiMapFork } from "./DefiMap/saga";
import * as defiReducer from "./DefiMap/reducer";
import * as stakingSlice from "./StakingMap/reducer";

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
});
export const investForks = [
  ...defiMapFork,
  ...investTokenTypeForks,
  ...dualMapFork,
  ...stakingMapFork,
];

export * from "./DefiMap";
export * from "./DualMap";
export * from "./InvestTokenTypeMap";
export * from "./StakingMap";
