import {
  CombinedState,
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import accountSlice from "./account/reducer";
import { persistReducer } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";
import hardSet from "redux-persist/lib/stateReconciler/hardSet";

import createSagaMiddleware from "redux-saga";
import { reduxBatch } from "@manaflair/redux-batch";
import {
  modalsSlice,
  setCoinJson,
  setLanguage,
  settingsSlice,
  SettingsState,
  toggleSlice,
} from "@loopring-web/component-lib";

import { getAnalytics } from "firebase/analytics";

import {
  ChainHashInfos,
  firebaseBridgeConfig,
  firebaseIOConfig,
  LAYER1_ACTION_HISTORY,
  myLog,
} from "@loopring-web/common-resources";

import {
  firebaseReducer,
  ReactReduxFirebaseProviderProps,
} from "react-redux-firebase";
import firebase from "firebase/compat/app";

import {
  localStoreReducerL1,
  modalDataSlice,
  socketSlice,
  updateVersion,
} from "./index";

import { systemSlice } from "./system/reducer";
import { tokenMapSlice } from "./token/reducer";
import { tokenPricesSlice } from "./tokenPrices/reducer";
import { walletLayer1Slice } from "./walletLayer1/reducer";
import { notifyMapSlice } from "./notify/reducer";
import { all } from "redux-saga/effects";
import { tokenSaga } from "./token/saga";
import { tokenPricesSaga } from "./tokenPrices/saga";
import { walletLayer1Fork } from "./walletLayer1/saga";
import { systemForks } from "./system/saga";
import { socketForks } from "./socket/saga";
import { accountFork } from "./account/saga";
import { notifyForks } from "./notify/saga";
import { layer1ActionHistoryForks } from "./localStore/layer1Store/saga";
import { Confirmation } from "./localStore/confirmation";
import { WalletInfo } from "./localStore/walletInfo";

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
    chainHashInfos: ChainHashInfos;
    confirmation: Confirmation;
    walletInfo: WalletInfo;
    layer1ActionHistory: LAYER1_ACTION_HISTORY;
  }>
>(persistLocalStoreConfig, localStoreReducerL1);

function* l1Saga() {
  yield all([
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
  ]);
}

const reducer = combineReducers({
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

export const storeForL1 = configureStore({
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

storeForL1.dispatch(updateVersion());

storeForL1.dispatch(setLanguage(storeForL1.getState().settings.language));
fetch(`./static/coin/loopring.json`)
  .then((results) => results.json())
  .then((imgConfig) => {
    storeForL1.dispatch(setCoinJson(imgConfig.frames));
  });

// @ts-ignore
sagaMiddleware.run(l1Saga, storeForL1.dispatch);

// The store has been created with these options:
// - The slice reducers were automatically passed to combineReducers()
// - redux-thunk and redux-logger were added as middleware
// - The Redux DevTools Extension is disabled for production
// - The middleware, batch, and devtools enhancers were composed together

// type AppL1Dispatch = typeof storeForL1.dispatch;
export const firebaseL1Props: ReactReduxFirebaseProviderProps = (() => {
  let firebase_app;
  switch (process.env.REACT_APP_NAME) {
    case "bridge":
    case "guardian":
      // getAnalytics(firebase);
      firebase_app = firebase.initializeApp(firebaseBridgeConfig);
      // myLog(firebase_app);
      getAnalytics(firebase_app);
      return {
        firebase,
        config: {
          userProfile: "users",

          // useFirestoreForProfile: true // Firestore for Profile instead of Realtime DB
        },
        dispatch: storeForL1.dispatch,
      };
    case "loopring.io":
    default:
      firebase_app = firebase.initializeApp(firebaseIOConfig);
      // myLog(firebase_app);
      getAnalytics(firebase_app);
      return {
        firebase,
        config: {
          userProfile: "users",
        },
        dispatch: storeForL1.dispatch,
      };
  }
})();
export const persistorL1 = persistStore(storeForL1);

// persistor.persist()
