import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'

import { useDispatch } from 'react-redux'
import { load, save } from 'redux-localstorage-simple'

import createSagaMiddleware from 'redux-saga'
import * as imgConfig from '@loopring-web/common-resources/assets/images/coin/loopring.json'
import { reduxBatch } from '@manaflair/redux-batch'
import { updateVersion } from './global/actions'
import accountSlice from './account/reducer'
import { modalsSlice, setCoinJson, setLanguage, settingsSlice } from '@loopring-web/component-lib';
import { ammReducer } from './Amm';
import { tokenMapSlice } from './token';
import mySaga from './rootSaga';
import { tickerMapSlice } from './ticker';
import { systemSlice } from './system';
import { walletLayer1Slice } from './walletLayer1';
import { walletLayer2Slice } from './walletLayer2';
import { socketSlice } from './socket';
import { userRewardsMapSlice } from './userRewards';
import { localStoreReducer } from './localStore';
import { persistReducer, persistStore } from "redux-persist";
import storageSession from 'redux-persist/lib/storage/session'
const sagaMiddleware = createSagaMiddleware()

const reducer = combineReducers({
    account: accountSlice.reducer,
    socket: socketSlice.reducer,
    settings: settingsSlice.reducer,
    system: systemSlice.reducer,
    modals: modalsSlice.reducer,
    userRewardsMap: userRewardsMapSlice.reducer,
    amm: ammReducer,
    tokenMap: tokenMapSlice.reducer,
    walletLayer2: walletLayer2Slice.reducer,
    walletLayer1: walletLayer1Slice.reducer,
    tickerMap: tickerMapSlice.reducer,
    localStore: localStoreReducer,
})
const DEFAULT_TIMEOUT = 1000*60*60;

const persistConfig = {
    key: 'root',
    storage: storageSession,
    timeout:DEFAULT_TIMEOUT,
    whitelist: ['account'] // only navigation will be persisted
};
const PERSISTED_KEYS: string[] = ['settings', 'localStore']

const persistedReducer = persistReducer(persistConfig, reducer)

const store = configureStore({
    reducer,
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
    middleware: [...getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
    }), save({states: PERSISTED_KEYS}), sagaMiddleware],
    // middleware: [...getDefaultMiddleware({ thunk: true }), ],
    devTools: process.env.NODE_ENV !== 'production',
    enhancers: [reduxBatch],
    preloadedState: load({states: PERSISTED_KEYS}) as any
})
store.dispatch(updateVersion())
store.dispatch(setLanguage(store.getState().settings.language))
store.dispatch(setCoinJson(imgConfig.frames))
// @ts-ignore
sagaMiddleware.run(mySaga, store.dispatch);

// The store has been created with these options:
// - The slice reducers were automatically passed to combineReducers()
// - redux-thunk and redux-logger were added as middleware
// - The Redux DevTools Extension is disabled for production
// - The middleware, batch, and devtools enhancers were composed together

export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()

export type RootState = ReturnType<typeof reducer>
export const persistor = persistStore(store)

export default store
