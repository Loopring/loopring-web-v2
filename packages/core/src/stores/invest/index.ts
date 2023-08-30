import { combineReducers } from '@reduxjs/toolkit'

import { defiMapFork } from './DefiMap/saga'
import { btradeMapFork } from './BtradeMap/saga'

import * as defiReducer from './DefiMap/reducer'
import * as stakingSlice from './StakingMap/reducer'
import * as btradeSlice from './BtradeMap/reducer'

import * as investTokenTypeMapReducer from './InvestTokenTypeMap/reducer'
import * as popupSlice from './popup/reducer'
import { investTokenTypeForks } from './InvestTokenTypeMap/saga'
import { dualReducer } from './DualMap'
import { dualMapFork } from './DualMap/saga'
import { stakingMapFork } from './StakingMap/saga'
import { vaultMapFork } from './VaultMap/saga'

export const investReducer = combineReducers({
  defiMap: defiReducer.defiMapSlice.reducer,
  dualMap: dualReducer.dualMapSlice.reducer,
  stakingMap: stakingSlice.stakingMapSlice.reducer,
  investTokenTypeMap: investTokenTypeMapReducer.investTokenTypeMapSlice.reducer,
  btradeMap: btradeSlice.btradeMapSlice.reducer,
  popup: popupSlice.popupSlice.reducer,
})
export const investForks = [
  ...defiMapFork,
  ...investTokenTypeForks,
  ...dualMapFork,
  ...stakingMapFork,
  ...btradeMapFork,
  ...vaultMapFork,
]

export * from './DefiMap'
export * from './DualMap'
export * from './InvestTokenTypeMap'
export * from './StakingMap'
export * from './BtradeMap'
export * from './popup'
