import { combineReducers } from '@reduxjs/toolkit'
import { confirmationSlice } from './confirmation'
import { favoriteMarketSlice } from './favoriteMarket'
import { OnChainHashInfoSlice } from './onchainHashInfo'
import { walletInfoSlice } from './walletInfo'
import { tradeProSettingsSlice } from './tradeProSettings'
import { layer1ActionHistorySlice } from './layer1Store'
import { NFTHashInfoSlice } from './nftRefresh'
import { redPacketHistorySlice } from './redPacket'
import { offRampHistorySlice } from './offRamp'
import { favoriteVaultMarketSlice } from './favoriteVaultMarket'

export const localStoreReducer = combineReducers({
  favoriteMarket: favoriteMarketSlice.reducer,
  chainHashInfos: OnChainHashInfoSlice.reducer,
  confirmation: confirmationSlice.reducer,
  walletInfo: walletInfoSlice.reducer,
  tradeProSettings: tradeProSettingsSlice.reducer,
  layer1ActionHistory: layer1ActionHistorySlice.reducer,
  nftHashInfos: NFTHashInfoSlice.reducer,
  redPacketHistory: redPacketHistorySlice.reducer,
  offRampHistory: offRampHistorySlice.reducer,
  favoriteVaultMarket: favoriteVaultMarketSlice.reducer,
})

export * as confirmation from './confirmation'
export * as favoriteMarket from './favoriteMarket'
export * as favoriteVaultMarket from './favoriteVaultMarket'

export * as layer1Store from './layer1Store'
export * as onchainHashInfo from './onchainHashInfo'
export * as nftRefresh from './nftRefresh'
export * as tradeProSettings from './tradeProSettings'
export * as walletInfo from './walletInfo'
export * as redPacketHistory from './redPacket'
export * as offRampHistory from './offRamp'
