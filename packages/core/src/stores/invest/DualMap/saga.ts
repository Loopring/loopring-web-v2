import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getDualMap, getDualMapStatus, updateDualSyncMap } from './reducer'
import { store } from '../../index'
import { LoopringAPI } from '../../../api_wrapper'
import { PayloadAction } from '@reduxjs/toolkit'
import { DUAL_CONFIG, MapChainId } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const getDualMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined
  }
  const { baseURL } = store.getState().system
  const { defaultNetwork } = store.getState().settings
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const url =
    sdk.LOOPRING_URLs.GET_DEFI_MARKETS + (/https:\/\/dev\./.test(baseURL) ? `?defiType=DUAL` : '')
  const {
    markets: marketMap,
    tokenArr: marketCoins,
    marketArr,
    pairs,
  } = await LoopringAPI.defiAPI?.getDefiMarkets(
    {
      defiType: DUAL_CONFIG.products[network].join(','),
    },
    url,
  )
  const marketArray = marketArr?.sort((b, a) => a.localeCompare(b))
  const tradeMap = Reflect.ownKeys(pairs ?? {}).reduce((prev, key) => {
    const tokenList = pairs[key as string]?.tokenList?.sort()
    const quoteList = pairs[key as string]?.tokenList?.filter((item) => {
      return marketMap[`DUAL-${key as string}-${item}`] !== undefined
    })
    prev[key] = {
      ...pairs[key as string],
      tokenList,
      quoteList,
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

export function* getDualSyncSaga({
  payload,
}: PayloadAction<{
  dualMap: {
    markets: sdk.LoopringMap<sdk.DefiMarketInfo>
    pairs: sdk.LoopringMap<sdk.TokenRelatedInfo>
    tokenArr: string[]
    tokenArrStr: string
    marketArr: string[]
    marketArrStr: string
  }
}>) {
  try {
    if (payload.dualMap) {
      const { markets: marketMap, tokenArr: marketCoins, marketArr, pairs } = payload.dualMap
      const marketArray = marketArr?.sort((b, a) => a.localeCompare(b))
      const tradeMap = Reflect.ownKeys(pairs ?? {}).reduce((prev, key) => {
        const tokenList = pairs[key as string]?.tokenList?.sort()
        const quoteList = pairs[key as string]?.tokenList?.filter((item) => {
          return marketMap[`DUAL-${key as string}-${item}`] !== undefined
        })
        prev[key] = {
          ...pairs[key as string],
          tokenList,
          quoteList,
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
      yield put(
        getDualMapStatus({
          marketArray,
          marketCoins,
          marketMap,
          tradeMap,
          __timer__,
        }),
      )
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
