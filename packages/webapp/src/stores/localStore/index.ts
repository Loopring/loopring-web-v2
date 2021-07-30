import { combineReducers } from '@reduxjs/toolkit';
import { confirmationSlice } from './confirmation';
import { favoriteMarketSlice } from './favoriteMarket';
import { onchainHashInfoSlice } from './onchainHashInfo';

export const  localStoreReducer = combineReducers({
    // ammRecord: ammRecordSlice.reducer,
    // ammTrades: ammTradesSlice.reducer,
    favoriteMarket: favoriteMarketSlice.reducer,
    onchainHashInfo: onchainHashInfoSlice.reducer,
    confirmation: confirmationSlice.reducer,
})
