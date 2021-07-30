import { combineReducers } from '@reduxjs/toolkit';
import { favoriteMarketSlice } from './favoriteMarket';
import { onchainHashInfoSlice } from './onchainHashInfo';

export const  localStoreReducer = combineReducers({
    // ammRecord: ammRecordSlice.reducer,
    // ammTrades: ammTradesSlice.reducer,
    favoriteMarket: favoriteMarketSlice.reducer,
    onchainHashInfo: onchainHashInfoSlice.reducer,
})
