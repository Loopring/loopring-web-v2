import {
  CombinedState,
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit'

import { useDispatch } from 'react-redux'
import { persistReducer } from 'redux-persist'
import storageSession from 'redux-persist/lib/storage/session'
import storage from 'redux-persist/lib/storage'
import persistStore from 'redux-persist/es/persistStore'
import mySaga from './rootSaga'
import { updateVersion } from './global/actions'
import createSagaMiddleware from 'redux-saga'
import { reduxBatch } from '@manaflair/redux-batch'
import accountSlice from './account/reducer'
import {
  modalsSlice,
  setCoinJson,
  setLanguage,
  settingsSlice,
  SettingsState,
  toggleSlice,
} from '@loopring-web/component-lib'
import { ammReducer } from './Amm'
import { tokenMapSlice } from './token/reducer'
import { tickerMapSlice } from './ticker/reducer'
import { systemSlice } from './system/reducer'
import { walletLayer1Slice } from './walletLayer1/reducer'
import { walletLayer2Slice } from './walletLayer2/reducer'
import { vaultLayer2Slice } from './vaultLayer2/reducer'
import { socketSlice } from './socket'
import { userRewardsMapSlice } from './userRewards/reducer'
import { amountMapSlice } from './amount/reducer'
import { tokenPricesSlice } from './tokenPrices/reducer'
import { TradeProSettings } from './localStore/tradeProSettings'
import { notifyMapSlice } from './notify/reducer'
import { walletLayer2NFTSlice } from './walletLayer2NFT/reducer'
import { redPacketConfigsSlice } from './redPacket/reducer'
import { localStoreReducer } from './localStore'
import { getAnalytics } from 'firebase/analytics'
import {
  ChainHashInfos,
  firebaseBridgeConfig,
  firebaseIOConfig,
  LAYER1_ACTION_HISTORY,
  myLog,
  NFTHashInfos,
  OffRampHashInfos,
  RedPacketHashInfos,
} from '@loopring-web/common-resources'
import { FavoriteMarketStates } from './localStore/favoriteMarket'
import { Confirmation } from './localStore/confirmation'
import { WalletInfo } from './localStore/walletInfo'

import {
  modalDataSlice,
  pageTradeLiteSlice,
  redeemStakeSlice,
  tradeStakeSlice,
  tradeVaultSlice,
  tradeDefiSlice,
  tradeDualSlice,
  pageTradeProSlice,
  pageAmmPoolSlice,
} from './router'
import { firebaseReducer, ReactReduxFirebaseProviderProps } from 'react-redux-firebase'
import firebase from 'firebase/compat/app'
import { investReducer } from './invest'
import { walletL2CollectionSlice } from './walletL2Collection/reducer'
import { walletL2NFTCollectionSlice } from './walletL2NFTCollection/reducer'
import { tradeBtradeSlice } from './router/tradeBtrade'
import { contactsSlice } from './contacts/reducer'
import { targetRedpacketSlice } from './targetRedpackt/reducer'

const sagaMiddleware = createSagaMiddleware()

const DEFAULT_TIMEOUT = 1000 * 60 * 15

myLog('---store DEFAULT_TIMEOUT:', DEFAULT_TIMEOUT)

//
const persistAccConfig = {
  key: 'account',
  storage: storageSession,
  timeout: DEFAULT_TIMEOUT,
}

const persistSettingConfig = {
  key: 'settings',
  storage: storage,
}

const persistLocalStoreConfig = {
  key: 'localStore',
  storage: storage,
}
const persistedAccountReducer = persistReducer(persistAccConfig, accountSlice.reducer)
const perisitTokenPricesSessionStoreConfig = persistReducer(
  { key: 'tokenPrices', storage: storageSession, timeout: DEFAULT_TIMEOUT },
  tokenPricesSlice.reducer,
)
const perisitWalletLayer2SessionStoreConfig = persistReducer(
  { key: 'walletLayer2', storage: storageSession, timeout: DEFAULT_TIMEOUT },
  walletLayer2Slice.reducer,
)
const perisitVaultLayer2SessionStoreConfig = persistReducer(
  { key: 'vaultLayer2', storage: storageSession, timeout: DEFAULT_TIMEOUT },
  vaultLayer2Slice.reducer,
)
const perisitWalletLayer1SessionStoreConfig = persistReducer(
  { key: 'walletLayer1', storage: storageSession, timeout: DEFAULT_TIMEOUT },
  walletLayer1Slice.reducer,
)
const perisitTickerMapSessionStoreConfig = persistReducer(
  { key: 'tickerMap', storage: storageSession, timeout: DEFAULT_TIMEOUT },
  tickerMapSlice.reducer,
)

const persistedSettingReducer = persistReducer<SettingsState>(
  persistSettingConfig,
  settingsSlice.reducer,
)

const persistedLocalStoreReducer = persistReducer<
  CombinedState<{
    favoriteMarket: FavoriteMarketStates
    chainHashInfos: ChainHashInfos
    confirmation: Confirmation
    walletInfo: WalletInfo
    tradeProSettings: TradeProSettings
    layer1ActionHistory: LAYER1_ACTION_HISTORY
    nftHashInfos: NFTHashInfos
    redPacketHistory: RedPacketHashInfos
    offRampHistory: OffRampHashInfos
    favoriteVaultMarket: FavoriteMarketStates
  }>
>(persistLocalStoreConfig, localStoreReducer)

export const initReduce = {
  account: persistedAccountReducer,
  socket: socketSlice.reducer,
  settings: persistedSettingReducer,
  system: systemSlice.reducer,
  modals: modalsSlice.reducer,
  userRewardsMap: userRewardsMapSlice.reducer,
  amm: ammReducer,
  invest: investReducer,
  tokenMap: tokenMapSlice.reducer,
  redPacketConfigs: redPacketConfigsSlice.reducer,
  toggle: toggleSlice.reducer,
  tokenPrices: perisitTokenPricesSessionStoreConfig,
  walletLayer2: perisitWalletLayer2SessionStoreConfig,
  walletLayer1: perisitWalletLayer1SessionStoreConfig,
  vaultLayer2: perisitVaultLayer2SessionStoreConfig,
  tickerMap: perisitTickerMapSessionStoreConfig,
  walletLayer2NFT: walletLayer2NFTSlice.reducer,
  walletL2Collection: walletL2CollectionSlice.reducer,
  walletL2NFTCollection: walletL2NFTCollectionSlice.reducer,
  localStore: persistedLocalStoreReducer,
  amountMap: amountMapSlice.reducer,
  notifyMap: notifyMapSlice.reducer,
  firebase: firebaseReducer,
  contacts: contactsSlice.reducer,
  targetRedpacket: targetRedpacketSlice.reducer,
  _router_tradeDefi: tradeDefiSlice.reducer,
  _router_tradeDual: tradeDualSlice.reducer,
  _router_tradeStake: tradeStakeSlice.reducer,
  _router_tradeBtrade: tradeBtradeSlice.reducer,
  _router_redeemStake: redeemStakeSlice.reducer,
  _router_pageTradeLite: pageTradeLiteSlice.reducer,
  _router_pageTradePro: pageTradeProSlice.reducer,
  _router_pageAmmPool: pageAmmPoolSlice.reducer,
  _router_modalData: modalDataSlice.reducer,
  _router_tradeVault: tradeVaultSlice.reducer,
}

export const store = configureStore({
  reducer: combineReducers(initReduce),
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }),
    sagaMiddleware,
  ],
  //middleware: [...getDefaultMiddleware({ thunk: true }), ],
  devTools: process.env.NODE_ENV !== 'production',
  enhancers: [reduxBatch],
})

export const firebaseProps: ReactReduxFirebaseProviderProps = (() => {
  let firebase_app
  switch (process.env.REACT_APP_NAME) {
    case 'guardian':
    case 'bridge':
      // getAnalytics(firebase);
      firebase_app = firebase.initializeApp(firebaseBridgeConfig)
      // myLog(firebase_app);
      getAnalytics(firebase_app)
      return {
        firebase,
        config: {
          userProfile: 'users',

          // useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
        },
        dispatch: store.dispatch,
      }
    case 'loopring.io':
    default:
      firebase_app = firebase.initializeApp(firebaseIOConfig)
      // myLog(firebase_app);
      getAnalytics(firebase_app)
      return {
        firebase,
        config: {
          userProfile: 'users',
        },
        dispatch: store.dispatch,
      }
  }
})()

store.dispatch(updateVersion())

store.dispatch(setLanguage(store.getState().settings.language))
fetch(`./static/coin/loopring.json`)
  .then((results) => results.json())
  .then((imgConfig) => {
    store.dispatch(setCoinJson(imgConfig.frames))
  })
// async function imageConfig() {
//     const imgConfig = (await .json();
//
//

// imageConfig()

// @ts-ignore
sagaMiddleware.run(mySaga, store.dispatch)

// The store has been created with these options:
// - The slice reducers were automatically passed to combineReducers()
// - redux-thunk and redux-logger were added as middleware
// - The Redux DevTools Extension is disabled for production
// - The middleware, batch, and devtools enhancers were composed together

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
//@ts-ignore
export type RootState = ReturnType<typeof initReduce>
export const persistor = persistStore(store)

// persistor.persist()

export * from './account'
export * from './Amm'
export * from './amount'
export * from './global/actions'
export * from './localStore'
export * from './notify'
export * from './router'
export * from './socket'
export * from './system'
export * from './ticker'
export * from './token'
export * from './tokenPrices'
export * from './userRewards'
export * from './walletLayer1'
export * from './walletLayer2'
export * from './walletLayer2NFT'
export * from './walletL2Collection'
export * from './walletL2NFTCollection'
export * from './vaultLayer2'
export * from './invest'
export * from './contacts'
export * from './targetRedpackt'
