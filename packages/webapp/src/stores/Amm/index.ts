import { combineReducers } from '@reduxjs/toolkit';

import { ammMapSlice } from './AmmMap';
import { ammActivityMapSlice } from './AmmActivityMap';
import ammActivityMapSaga from './AmmActivityMap/saga';
import { ammMapSaga } from './AmmMap/saga';
import { fork } from 'redux-saga/effects';

export const ammReducer = combineReducers({

    ammMap: ammMapSlice.reducer,
    ammActivityMap: ammActivityMapSlice.reducer
})
export const ammForks = [
    fork(ammActivityMapSaga),
    ...ammMapSaga,
    // fork(ammRecordSaga),
    // fork(ammTradesSaga)
]

// export * from './interface'
