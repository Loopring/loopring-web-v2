import { combineReducers } from '@reduxjs/toolkit';
// import { ammRecordSlice } from './AmmConfig';
import { ammTradesSlice } from './AmmTrades';
import { ammMapSlice } from './AmmMap';
import { ammActivityMapSlice } from './AmmActivityMap';
import ammActivityMapSaga from './AmmActivityMap/saga';
import { ammMapSaga } from './AmmMap/saga';
import ammTradesSaga from './AmmTrades/saga';
import {  fork } from 'redux-saga/effects';

export const  ammReducer = combineReducers({
    // ammRecord: ammRecordSlice.reducer,
    ammTrades: ammTradesSlice.reducer,
    ammMap: ammMapSlice.reducer,
    ammActivityMap:ammActivityMapSlice.reducer
})
export const ammForks =  [
    fork(ammActivityMapSaga),
    ...ammMapSaga,
    // fork(ammRecordSaga),
    fork(ammTradesSaga)
]

// export * from './interface'
