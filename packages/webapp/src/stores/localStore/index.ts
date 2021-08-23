import { combineReducers } from '@reduxjs/toolkit';
import { confirmationSlice } from './confirmation';
import { favoriteMarketSlice } from './favoriteMarket';
import { onchainHashInfoSlice } from './onchainHashInfo';
import { walletInfoSlice } from './walletInfo';

export const localStoreReducer = combineReducers({
    favoriteMarket: favoriteMarketSlice.reducer,
    onchainHashInfo: onchainHashInfoSlice.reducer,
    confirmation: confirmationSlice.reducer,
    walletInfo: walletInfoSlice.reducer,
})
