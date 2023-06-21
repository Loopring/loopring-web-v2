import { combineReducers } from '@reduxjs/toolkit'

import { ammMapSlice } from './AmmMap/reducer'
import { ammActivityMapSlice } from './AmmActivityMap/reducer'
import ammActivityMapSaga from './AmmActivityMap/saga'
import { ammMapSaga } from './AmmMap/saga'
import { fork } from 'redux-saga/effects'

export const ammReducer = combineReducers({
  ammMap: ammMapSlice.reducer,
  ammActivityMap: ammActivityMapSlice.reducer,
})
export const ammForks = [
  fork(ammActivityMapSaga),
  ...ammMapSaga,
  // fork(ammRecordSaga),
  // fork(ammTradesSaga)
]

export * from './AmmMap/interface'
export * from './AmmActivityMap/interface'
export * from './AmmMap/hook'
export * from './AmmActivityMap/hook'
export * as ammMapReducer from './AmmMap/reducer'
export * as ammActivityMapReducer from './AmmActivityMap/reducer'
