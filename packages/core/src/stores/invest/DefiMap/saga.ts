import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getDefiMap, getDefiMapStatus, updateDefiSyncMap } from './reducer'
import { DefiMap, store } from '../../index'
import { LoopringAPI } from '../../../api_wrapper'
import { PayloadAction } from '@reduxjs/toolkit'

const getDefiMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined
  }
  const chainId = store.getState().system.chainId
  const [normal, leverage] = chainId === 1 ? ['LIDO,ROCKETPOOL', 'CIAN'] : ['ROCKETPOOL', 'LIDO']
  const [
    { markets: marketMap, tokenArr: marketCoins, marketArr: marketArray },
    { markets: marketLeverageMap, tokenArr: marketLeverageCoins, marketArr: marketLeverageArray },
  ] = await Promise.all([
    LoopringAPI.defiAPI?.getDefiMarkets({
      defiType: normal,
    }),
    LoopringAPI.defiAPI?.getDefiMarkets({
      defiType: leverage,
    }),
  ])
  let { __timer__ } = store.getState().invest.defiMap
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__)
    }
    return setInterval(async () => {
      if (!LoopringAPI.defiAPI) {
        return undefined
      }

      // let { markets, pairs, tokenArr, tokenArrStr, marketArr, marketArrStr } =
      //   await LoopringAPI.defiAPI.getDefiMarkets();
      store.dispatch(getDefiMap(undefined))
    }, 900000) //15*60*1000 //900000
  })()

  return {
    defiMap: {
      marketArray,
      marketCoins,
      marketMap,
      marketLeverageMap,
      marketLeverageCoins,
      marketLeverageArray,
    },
    __timer__,
  }
}

export function* getPostsSaga() {
  try {
    const { defiMap, __timer__ } = yield call(getDefiMapApi)
    yield put(getDefiMapStatus({ ...defiMap, __timer__ }))
  } catch (err) {
    yield put(getDefiMapStatus({ error: err }))
  }
}

export function* getDefiSyncSaga({ payload }: PayloadAction<{ defiMap: DefiMap }>) {
  try {
    if (payload.defiMap) {
      yield put(getDefiMapStatus({ ...payload.defiMap }))
    }
  } catch (err) {
    yield put(getDefiMapStatus({ error: err }))
  }
}

export function* defiMapInitSaga() {
  yield all([takeLatest(getDefiMap, getPostsSaga)])
}

export function* defiMapSyncSaga() {
  // @ts-ignore
  yield all([takeLatest(updateDefiSyncMap, getDefiSyncSaga)])
}

export const defiMapFork = [fork(defiMapInitSaga), fork(defiMapSyncSaga)]
