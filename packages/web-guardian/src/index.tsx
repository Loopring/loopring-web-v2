import { Provider } from "react-redux";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  l1Reducer,
  sagaL1List,
  TimeoutCheckProvider,
  updateVersion,
} from "@loopring-web/core";
import {
  firebaseBridgeConfig,
  firebaseIOConfig,
  getTheme,
  i18n,
} from "@loopring-web/common-resources";
import { ThemeProvider as MuThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/lab";
import MomentUtils from "@mui/lab/AdapterMoment";

import { ThemeProvider } from "@emotion/react";
import * as sdk from "@loopring-web/loopring-sdk";
import { I18nextProvider } from "react-i18next";
import { PersistGate } from "redux-persist/integration/react";
import {
  provider,
  ProviderComposer,
  setCoinJson,
  setLanguage,
  useSettings,
} from "@loopring-web/component-lib";
import React, { Provider as TProvider } from "react";
import {
  ReactReduxFirebaseProvider,
  ReactReduxFirebaseProviderProps,
} from "react-redux-firebase";
import createSagaMiddleware from "redux-saga";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { reduxBatch } from "@manaflair/redux-batch";
import persistStore from "redux-persist/es/persistStore";
import firebase from "firebase/compat";
import { getAnalytics } from "firebase/analytics";
import { all } from "redux-saga/effects";

if (process.env.REACT_APP_VER) {
  console.log("VER:", process.env.REACT_APP_VER);
}

const sagaMiddleware = createSagaMiddleware();
export const storeForL1 = configureStore({
  reducer: l1Reducer,
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

export function* l1Saga() {
  yield all([...sagaL1List]);
}

// @ts-ignore
sagaMiddleware.run(l1Saga, storeForL1.dispatch);
export const firebaseL1Props: ReactReduxFirebaseProviderProps = (() => {
  let firebase_app;
  switch (process.env.REACT_APP_NAME) {
    case "bridge":
    case "guardian":
    default:
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
  }
})();
export const persistorL1 = persistStore(storeForL1);

const ProviderApp = React.memo(({ children }: { children: JSX.Element }) => {
  const providers: Array<[TProvider<any>, any]> = [
    provider(Provider as any, { store: storeForL1 }),
    provider(LocalizationProvider as any, { dateAdapter: MomentUtils }),
    provider(I18nextProvider as any, { i18n: i18n }),
  ] as any;
  return <ProviderComposer providers={providers}>{children}</ProviderComposer>;
});
const ProviderThen = React.memo(({ children }: { children: JSX.Element }) => {
  const { themeMode, setIsMobile } = useSettings();
  const isMobile = sdk.IsMobile.any() ? true : false;
  setIsMobile(isMobile);
  const providers: Array<[TProvider<any>, any]> = [
    provider(MuThemeProvider as any, { theme: getTheme(themeMode, isMobile) }),
    provider(ThemeProvider as any, { theme: getTheme(themeMode, isMobile) }),
    provider(PersistGate as any, { persistor: persistorL1, loading: null }),
    provider(TimeoutCheckProvider as any),
  ] as any;
  return <ProviderComposer providers={providers}>{children}</ProviderComposer>;
});

ReactDOM.render(
  <ProviderApp>
    <ReactReduxFirebaseProvider {...firebaseL1Props}>
      <ProviderThen>
        <App />
      </ProviderThen>
    </ReactReduxFirebaseProvider>
  </ProviderApp>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

if (process.env.NODE_ENV !== "production") {
  reportWebVitals(console.log);
}
