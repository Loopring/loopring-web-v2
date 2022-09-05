import { combineReducers } from "@reduxjs/toolkit";
import { confirmationSlice } from "./confirmation";
import { favoriteMarketSlice } from "./favoriteMarket";
import { OnChainHashInfoSlice } from "./onchainHashInfo";
import { walletInfoSlice } from "./walletInfo";
import { tradeProSettingsSlice } from "./tradeProSettings";
import { layer1ActionHistorySlice } from "./layer1Store";

export const localStoreReducer = combineReducers({
  favoriteMarket: favoriteMarketSlice.reducer,
  chainHashInfos: OnChainHashInfoSlice.reducer,
  confirmation: confirmationSlice.reducer,
  walletInfo: walletInfoSlice.reducer,
  tradeProSettings: tradeProSettingsSlice.reducer,
  layer1ActionHistory: layer1ActionHistorySlice.reducer,
});

export * as confirmation from "./confirmation";
export * as favoriteMarket from "./favoriteMarket";
export * as layer1Store from "./layer1Store";
export * as onchainHashInfo from "./onchainHashInfo";
export * as tradeProSettings from "./tradeProSettings";
export * as walletInfo from "./walletInfo";
