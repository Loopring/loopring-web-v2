import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'

import { useDispatch } from 'react-redux'
import { persistReducer } from 'redux-persist'
import storageSession from 'redux-persist/lib/storage/session'
import storage from 'redux-persist/lib/storage'
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
import persistStore from 'redux-persist/es/persistStore';
import { myLog } from 'utils/log_tools'

const sagaMiddleware = createSagaMiddleware()

const DEFAULT_TIMEOUT = 1000 * 60 * 15

myLog('---store DEFAULT_TIMEOUT:', DEFAULT_TIMEOUT)

//
const persistAccConfig = {
    key: 'account',
    storage: storageSession,
    timeout: DEFAULT_TIMEOUT,
};

const persistSettingConfig = {
    key: 'settings',
    storage: storage,
};

const persistLocalStoreConfig = {
    key: 'localStore',
    storage: storage,
};
const persistedAccountReducer = persistReducer(persistAccConfig, accountSlice.reducer)
const persistedSettingReducer = persistReducer(persistSettingConfig, settingsSlice.reducer)
const persistedLocalStoreReducer = persistReducer(persistLocalStoreConfig, localStoreReducer)

const reducer = combineReducers({
    account: persistedAccountReducer,
    socket: socketSlice.reducer,
    settings: persistedSettingReducer,
    system: systemSlice.reducer,
    modals: modalsSlice.reducer,
    userRewardsMap: userRewardsMapSlice.reducer,
    amm: ammReducer,
    tokenMap: tokenMapSlice.reducer,
    walletLayer2: walletLayer2Slice.reducer,
    walletLayer1: walletLayer1Slice.reducer,
    tickerMap: tickerMapSlice.reducer,
    localStore: persistedLocalStoreReducer,
})

//const persistedReducer = persistReducer(persistConfig ,reducer)


const store = configureStore({
    reducer,
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
    middleware: [...getDefaultMiddleware({
        thunk: false,
        serializableCheck: false,
    }), sagaMiddleware],
    //middleware: [...getDefaultMiddleware({ thunk: true }), ],
    devTools: process.env.NODE_ENV !== 'production',
    enhancers: [reduxBatch],
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

// persistor.persist()

export default store
