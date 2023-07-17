'use strict'
// import { compose } from 'react'
import { applyMiddleware, compose, createStore } from 'redux'
import { combineReducers } from '@reduxjs/toolkit'
import createStorybookListener from 'storybook-addon-redux-listener'
import { modalsSlice, settingsSlice } from '../src'

const middlewares = [
  // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  //...getDefaultMiddleware({ thunk: true })      Button.stories.tsx
]
const reducers = combineReducers({
  settings: settingsSlice.reducer,
  modals: modalsSlice.reducer,
  // account: accountSlice.reducer,
  // modal: modalSlice.reducer,
  // system: systemSlice.reducer,
  // trading: tradingSlice.reducer,
  // transactions: transactionlice.reducer,
})
if (process.env.NODE_ENV === 'storybook') {
  const reduxListener = createStorybookListener()
  middlewares.push(reduxListener)
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const enhancer = composeEnhancers(
  applyMiddleware(...middlewares),
  // other stores enhancers if any
)

const createStoreWithMiddleware = (reducers) => {
  return createStore(reducers, enhancer)
}

const configureStore = () => createStoreWithMiddleware(reducers)

export default configureStore
