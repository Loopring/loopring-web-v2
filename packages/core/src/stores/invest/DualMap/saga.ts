import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getDualMap, getDualMapStatus, updateDualSyncMap } from './reducer'
import { DualMap, store } from '../../index'
import { LoopringAPI } from '../../../api_wrapper'
import { PayloadAction } from '@reduxjs/toolkit'

const getDualMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined
  }
  const {
    markets: marketMap,
    tokenArr: marketCoins,
    marketArr,
    pairs,
  } = await LoopringAPI.defiAPI?.getDefiMarkets({ defiType: 'PIONEX' })
  const marketArray = marketArr?.sort((b, a) => a.localeCompare(b))
  const tradeMap = Reflect.ownKeys(pairs ?? {}).reduce((prev, key) => {
    const tokenList = pairs[key as string]?.tokenList?.sort()
    prev[key] = {
      ...pairs[key as string],
      tokenList,
    }
    return prev
  }, {})
  let { __timer__ } = store.getState().invest.dualMap
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__)
    }
    return setInterval(async () => {
      if (!LoopringAPI.defiAPI) {
        return undefined
      }
      store.dispatch(getDualMap(undefined))
    }, 900000) //15*60*1000 //900000
  })()

  return {
    dualMap: {
      marketArray,
      marketCoins,
      marketMap,
      tradeMap,
    },
    __timer__,
  }
}

export function* getPostsSaga() {
  try {
    const { dualMap, __timer__ } = yield call(getDualMapApi)
    yield put(getDualMapStatus({ ...dualMap, __timer__ }))
  } catch (err) {
    yield put(getDualMapStatus({ error: err }))
  }
}

export function* getDualSyncSaga({ payload }: PayloadAction<{ dualMap: DualMap }>) {
  try {
    if (payload.dualMap) {
      yield put(getDualMapStatus({ ...payload.dualMap }))
    }
  } catch (err) {
    yield put(getDualMapStatus({ error: err }))
  }
}

export function* dualMapInitSaga() {
  yield all([takeLatest(getDualMap, getPostsSaga)])
}

export function* dualMapSyncSaga() {
  // @ts-ignore
  yield all([takeLatest(updateDualSyncMap, getDualSyncSaga)])
}

export const dualMapFork = [fork(dualMapInitSaga), fork(dualMapSyncSaga)]
