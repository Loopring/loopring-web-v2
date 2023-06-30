import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getTickers, getTickerStatus, updateTicker } from './reducer'
import { CustomError, ErrorMap, myLog } from '@loopring-web/common-resources'
import { LoopringAPI, makeTickerMap, store } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'
import { PayloadAction } from '@reduxjs/toolkit'

const getTickersApi = async <R extends { [key: string]: any }>(
  list: Array<keyof R>,
): Promise<{
  data: object | undefined
  __timer__: NodeJS.Timer | -1
}> => {
  let { __timer__ } = store.getState().tickerMap.__timer__
  let { marketArray } = store.getState().tokenMap

  if (LoopringAPI.exchangeAPI) {
    __timer__ = ((__timer__) => {
      if (__timer__ && __timer__ !== -1) {
        clearTimeout(__timer__)
      }
      return setTimeout(() => {
        store.dispatch(getTickers({ tickerKey: marketArray }))
      }, 1000 * 60 * 5)
    })(__timer__)
    const tickers = await LoopringAPI.exchangeAPI.getMixTicker({
      market: list.join(','),
    })
    const data = makeTickerMap({ tickerMap: tickers.tickMap })

    return { data, __timer__ }
  } else {
    if (__timer__ && __timer__ !== -1) {
      clearTimeout(__timer__)
    }
    return { data: {}, __timer__: -1 }
  }
}

function* getPostsSaga({ payload }: any) {
  try {
    // @ts-ignore
    const { tickerKey, tickerKeys } = payload
    if (tickerKey || (tickerKeys && tickerKeys.length)) {
      const { data, __timer__ } = yield call(getTickersApi, tickerKey ? [tickerKey] : tickerKeys)
      yield put(getTickerStatus({ tickerMap: data, __timer__ }))
      // store.dispatch(updateRealTimeAmmMap({}));
    } else {
      throw new CustomError(ErrorMap.NO_TOKEN_KEY_LIST)
    }
  } catch (err) {
    yield put(getTickerStatus({ error: err }))
  }
}

function* tickerMakeMap({ payload }: PayloadAction<sdk.LoopringMap<sdk.TickerData>>) {
  try {
    let { tickerMap } = store.getState().tickerMap
    const data = makeTickerMap({ tickerMap: payload })
    yield put(getTickerStatus({ tickerMap: { ...tickerMap, ...data } }))
  } catch (err) {
    myLog('err', err)
    yield put(getTickerStatus(err))
  }
}

function* tickersSaga() {
  yield all([takeLatest(getTickers, getPostsSaga)])
}

function* tickerSyncSaga() {
  yield all([takeLatest(updateTicker, tickerMakeMap)])
}

export const tickerForks = [fork(tickerSyncSaga), fork(tickersSaga)]
