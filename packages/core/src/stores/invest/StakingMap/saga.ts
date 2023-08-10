import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getStakingMap, getStakingMapStatus, updateDefiSyncMap } from './reducer'
import { store } from '../../index'
import { LoopringAPI } from '../../../api_wrapper'
import { PayloadAction } from '@reduxjs/toolkit'
import * as sdk from '@loopring-web/loopring-sdk'
import { StakingMap } from './interface'

const getStakingMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined
  }

  const responseProduct = await LoopringAPI.defiAPI.getStakeProducts()

  let result: any = undefined
  if ((responseProduct as sdk.RESULT_INFO).code || (responseProduct as sdk.RESULT_INFO).message) {
    result = {
      marketArray: [],
      marketCoins: [],
      marketMap: {},
    }
  } else {
    result = (responseProduct as any)?.products?.markets?.reduce(
      (prev: any, item: sdk.STACKING_PRODUCT) => {
        prev.marketArray.push([item.symbol.toUpperCase()])
        prev.marketCoins.push([item.symbol.toUpperCase()])
        prev.marketMap = {
          ...prev.marketMap,
          [item.symbol.toUpperCase()]: item,
        }
        // (ele:) =>
        // ele.symbol?.toLowerCase() === coinSellSymbol?.toLowerCase()
        return prev
      },
      { marketArray: [], marketCoins: [], marketMap: {} } as any,
    )
  }

  let { __timer__ } = store.getState().invest.stakingMap
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__)
    }
    return setInterval(async () => {
      if (!LoopringAPI.defiAPI) {
        return undefined
      }
      store.dispatch(getStakingMap(undefined))
    }, 900000) //15*60*1000 //900000
  })()

  return {
    stakingMap: {
      ...result,
    },
    __timer__,
  }
}

export function* getPostsSaga() {
  try {
    const { stakingMap, __timer__ } = yield call(getStakingMapApi)
    yield put(getStakingMapStatus({ ...stakingMap, __timer__ }))
  } catch (err) {
    yield put(getStakingMapStatus({ error: err }))
  }
}

export function* getDefiSyncSaga({ payload }: PayloadAction<{ stakingMap: StakingMap }>) {
  try {
    if (payload.stakingMap) {
      yield put(getStakingMapStatus({ ...payload.stakingMap }))
    }
  } catch (err) {
    yield put(getStakingMapStatus({ error: err }))
  }
}

export function* stakingMapInitSaga() {
  yield all([takeLatest(getStakingMap, getPostsSaga)])
}

export function* stakingMapSyncSaga() {
  // @ts-ignore
  yield all([takeLatest(updateDefiSyncMap, getDefiSyncSaga)])
}

export const stakingMapFork = [fork(stakingMapInitSaga), fork(stakingMapSyncSaga)]
