import { CombinedState, combineReducers } from "@reduxjs/toolkit";
import accountSlice from "./account/reducer";
import { persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import storage from "redux-persist/lib/storage";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";

import {
  modalsSlice,
  settingsSlice,
  SettingsState,
  toggleSlice,
} from "@loopring-web/component-lib";

import {
  ChainHashInfos,
  LAYER1_ACTION_HISTORY,
  myLog,
} from "@loopring-web/common-resources";

import { firebaseReducer } from "react-redux-firebase";

import { modalDataSlice, socketSlice } from "./index";

import { systemSlice } from "./system/reducer";
import { tokenMapSlice } from "./token/reducer";
import { tokenPricesSlice } from "./tokenPrices/reducer";
import { walletLayer1Slice } from "./walletLayer1/reducer";
import { notifyMapSlice } from "./notify/reducer";
import { tokenSaga } from "./token/saga";
import { tokenPricesSaga } from "./tokenPrices/saga";
import { walletLayer1Fork } from "./walletLayer1/saga";
import { systemForks } from "./system/saga";
import { socketForks } from "./socket/saga";
import { accountFork } from "./account/saga";
import { notifyForks } from "./notify/saga";
import { layer1ActionHistoryForks } from "./localStore/layer1Store/saga";
import { Confirmation, confirmationSlice } from "./localStore/confirmation";
import { WalletInfo, walletInfoSlice } from "./localStore/walletInfo";
import { Reducer } from "redux";
import { OnChainHashInfoSlice } from "./localStore/onchainHashInfo";
import { layer1ActionHistorySlice } from "./localStore/layer1Store";

export const localStoreReducerL1: Reducer<CombinedState<any>> = combineReducers(
  {
    chainHashInfos: OnChainHashInfoSlice.reducer,
    confirmation: confirmationSlice.reducer,
    walletInfo: walletInfoSlice.reducer,
    layer1ActionHistory: layer1ActionHistorySlice.reducer,
  }
);

const DEFAULT_TIMEOUT = 1000 * 60 * 15;

myLog("---store DEFAULT_TIMEOUT:", DEFAULT_TIMEOUT);

//
const persistAccConfig = {
  key: "l1account",
  storage: storageSession,
  timeout: DEFAULT_TIMEOUT,
};

const persistSettingConfig = {
  key: "l1settings",
  storage: storage,
  stateReconciler: hardSet,
};

const persistLocalStoreConfig = {
  key: "l1LocalStore",
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
    chainHashInfos: ChainHashInfos;
    confirmation: Confirmation;
    walletInfo: WalletInfo;
    layer1ActionHistory: LAYER1_ACTION_HISTORY;
  }>
>(persistLocalStoreConfig, localStoreReducerL1);

export const l1Reducer = combineReducers({
  account: persistedAccountReducer,
  socket: socketSlice.reducer,
  settings: persistedSettingReducer,
  system: systemSlice.reducer,
  modals: modalsSlice.reducer,
  tokenMap: tokenMapSlice.reducer,
  tokenPrices: tokenPricesSlice.reducer,
  toggle: toggleSlice.reducer,
  walletLayer1: walletLayer1Slice.reducer,
  localStore: persistedLocalStoreReducer,
  notifyMap: notifyMapSlice.reducer,
  firebase: firebaseReducer,
  _router_modalData: modalDataSlice.reducer,
});
export const sagaL1List = [
  // fork(helloSaga),
  // fork(watchTransition),
  ...accountFork,
  ...socketForks,
  // no setting
  ...systemForks,
  ...tokenSaga,
  ...tokenPricesSaga,
  // no toggle
  ...walletLayer1Fork,
  // no localStore
  ...notifyForks,
  // no firebase
  ...layer1ActionHistoryForks,
];

// The store has been created with these options:
// - The slice reducers were automatically passed to combineReducers()
// - redux-thunk and redux-logger were added as middleware
// - The Redux DevTools Extension is disabled for production
// - The middleware, batch, and devtools enhancers were composed together

// type AppL1Dispatch = typeof storeForL1.dispatch;

// persistor.persist()
