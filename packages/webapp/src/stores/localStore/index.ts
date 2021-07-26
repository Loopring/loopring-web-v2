import { combineReducers } from '@reduxjs/toolkit';
import { favoriteMarketSlice } from './favoriteMarket';


export const  localStoreReducer = combineReducers({
    // ammRecord: ammRecordSlice.reducer,
    // ammTrades: ammTradesSlice.reducer,
    favoriteMarket: favoriteMarketSlice.reducer,
})
