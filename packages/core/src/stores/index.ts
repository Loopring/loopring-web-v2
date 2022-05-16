import {
  CombinedState,
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";

import { useDispatch } from "react-redux";

import { persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";
import mySaga from "./rootSaga";
import { updateVersion } from "./global/actions";
import createSagaMiddleware from "redux-saga";
import { reduxBatch } from "@manaflair/redux-batch";
import accountSlice from "./account/reducer";
import {
  modalsSlice,
  setCoinJson,
  setLanguage,
  settingsSlice,
  SettingsState,
  toggleSlice,
} from "@loopring-web/component-lib";
import { ammReducer } from "./Amm";
import { tokenMapSlice } from "./token/reducer";
import { tickerMapSlice } from "./ticker/reducer";
import { systemSlice } from "./system/reducer";
import { walletLayer1Slice } from "./walletLayer1/reducer";
import { walletLayer2Slice } from "./walletLayer2/reducer";
import { socketSlice } from "./socket";
import { userRewardsMapSlice } from "./userRewards/reducer";
import { amountMapSlice } from "./amount/reducer";
import { tokenPricesSlice } from "./tokenPrices/reducer";
import { TradeProSettings } from "./localStore/tradeProSettings";
import { notifyMapSlice } from "./notify/reducer";
import { walletLayer2NFTSlice } from "./walletLayer2NFT/reducer";
import { localStoreReducer } from "./localStore";
import {
  ChainHashInfos,
  LAYER1_ACTION_HISTORY,
  myLog,
} from "@loopring-web/common-resources";
import { FavoriteMarketStates } from "./localStore/favoriteMarket";
import { Confirmation } from "./localStore/confirmation";
import { WalletInfo } from "./localStore/walletInfo";

import {
  modalDataSlice,
  pageAmmPoolSlice,
  pageTradeLiteSlice,
  pageTradeProSlice,
} from "./router";

const sagaMiddleware = createSagaMiddleware();

const DEFAULT_TIMEOUT = 1000 * 60 * 15;

myLog("---store DEFAULT_TIMEOUT:", DEFAULT_TIMEOUT);

//
const persistAccConfig = {
  key: "account",
  storage: storageSession,
  timeout: DEFAULT_TIMEOUT,
};

const persistSettingConfig = {
  key: "settings",
  storage: storage,
  stateReconciler: hardSet,
};

const persistLocalStoreConfig = {
  key: "localStore",
  storage: storage,
  stateReconciler: hardSet,
};
const persistedAccountReducer = persistReducer(
  persistAccConfig,
  accountSlice.reducer
);

const persistedSettingReducer = persistReducer<SettingsState>(
  persistSettingConfig,
  settingsSlice.reducer
);

const persistedLocalStoreReducer = persistReducer<
  CombinedState<{
    favoriteMarket: FavoriteMarketStates;
    chainHashInfos: ChainHashInfos;
    confirmation: Confirmation;
    walletInfo: WalletInfo;
    tradeProSettings: TradeProSettings;
    layer1ActionHistory: LAYER1_ACTION_HISTORY;
  }>
>(persistLocalStoreConfig, localStoreReducer);

const reducer = combineReducers({
  account: persistedAccountReducer,
  socket: socketSlice.reducer,
  settings: persistedSettingReducer,
  system: systemSlice.reducer,
  modals: modalsSlice.reducer,
  userRewardsMap: userRewardsMapSlice.reducer,
  amm: ammReducer,
  tokenMap: tokenMapSlice.reducer,
  tokenPrices: tokenPricesSlice.reducer,
  toggle: toggleSlice.reducer,
  walletLayer2: walletLayer2Slice.reducer,
  walletLayer2NFT: walletLayer2NFTSlice.reducer,
  walletLayer1: walletLayer1Slice.reducer,
  tickerMap: tickerMapSlice.reducer,
  localStore: persistedLocalStoreReducer,
  amountMap: amountMapSlice.reducer,
  notifyMap: notifyMapSlice.reducer,
  // feeMap:feeMapSlice.reducer,
  // layer1ActionHistory: layer1ActionHistorySlice.reducer,
  // router redux
  _router_pageTradeLite: pageTradeLiteSlice.reducer,
  _router_pageTradePro: pageTradeProSlice.reducer,
  _router_pageAmmPool: pageAmmPoolSlice.reducer,
  _router_modalData: modalDataSlice.reducer,
});

//const persistedReducer = persistReducer(persistConfig ,reducer)

export const store = configureStore({
  reducer,
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  middleware: [
    ...getDefaultMiddleware({
      thunk: false,
      serializableCheck: false,
    }),
    sagaMiddleware,
  ],
  //middleware: [...getDefaultMiddleware({ thunk: true }), ],
  devTools: process.env.NODE_ENV !== "production",
  enhancers: [reduxBatch],
});
store.dispatch(updateVersion());

store.dispatch(setLanguage(store.getState().settings.language));
fetch(`./static/coin/loopring.json`)
  .then((results) => results.json())
  .then((imgConfig) => {
    store.dispatch(setCoinJson(imgConfig.frames));
  });
// async function imageConfig() {
//     const imgConfig = (await .json();
//
//

// imageConfig()

// @ts-ignore
sagaMiddleware.run(mySaga, store.dispatch);

// The store has been created with these options:
// - The slice reducers were automatically passed to combineReducers()
// - redux-thunk and redux-logger were added as middleware
// - The Redux DevTools Extension is disabled for production
// - The middleware, batch, and devtools enhancers were composed together

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export type RootState = ReturnType<typeof reducer>;
export const persistor = persistStore(store);

// persistor.persist()

export * from "./account";
export * from "./Amm";
export * from "./amount";
export * from "./global/actions";
export * from "./localStore";
export * from "./notify";
export * from "./router";
export * from "./socket";
export * from "./system";
export * from "./ticker";
export * from "./token";
export * from "./tokenPrices";
export * from "./userRewards";
export * from "./walletLayer1";
export * from "./walletLayer2";
export * from "./walletLayer2NFT";
