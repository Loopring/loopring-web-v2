import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getBtradeMap, getBtradeMapStatus, updateBtradeSyncMap } from './reducer'
import { BtradeMap, store } from '../../index'
import { LoopringAPI } from '../../../api_wrapper'
import { PayloadAction } from '@reduxjs/toolkit'
import * as sdk from '@loopring-web/loopring-sdk'
import { BTRDE_PRE, myLog, UIERROR_CODE } from '@loopring-web/common-resources'

const getBtradeMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined
  }
  const { chainId } = store.getState().system
  const btradeMapStorage = window.localStorage.getItem('btradeMarkets')
  let { __timer__ } = store.getState().invest.btradeMap
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
      store.dispatch(getBtradeMap(undefined))
    }, 900000) //15*60*1000 //900000
  })()
  let response,
    marketCoins,
    pairs: sdk.LoopringMap<sdk.TokenRelatedInfo>,
    marketArray,
    marketMap,
    tradeMap
  try {
    try {
      response = await LoopringAPI.defiAPI?.getBtradeMarkets()
    } catch (error) {
      throw { code: UIERROR_CODE.TIME_OUT, error: error }
    }
    if (!response || (response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
      throw (response as sdk.RESULT_INFO).message
    }
    let localStorageData: any[] = []

    const reformat: any[] = (response.raw_data as sdk.BTRADE_MARKET[]).reduce((prev, ele) => {
      if (/-/gi.test(ele.market) && ele.enabled) {
        localStorageData.push({
          ...ele,
          btradeMarket: ele.market,
          market: ele.market.replace(BTRDE_PRE, ''),
          feeBips: undefined,
          enabled: 'isFormLocal', //localStorageSetAs false
          minAmount: {
            base: undefined,
            quote: undefined,
          },
          btradeAmount: {
            base: undefined,
            quote: undefined,
          },
          l2Amount: {
            base: undefined,
            quote: undefined,
          },
        })
        return [
          ...prev,
          {
            ...ele,
            btradeMarket: ele.market,
            market: ele.market.replace(BTRDE_PRE, ''),
          } as sdk.BTRADE_MARKET,
        ]
      } else {
        return prev
      }
    }, [] as sdk.BTRADE_MARKET[])
    localStorage.setItem(
      'btradeMarkets',
      JSON.stringify({
        ...(btradeMapStorage ? JSON.parse(btradeMapStorage) : {}),
        [chainId]: localStorageData,
      }),
    )

    const res = sdk.makeMarkets({ markets: reformat })
    marketMap = res.markets
    pairs = res.pairs
    marketArray = res.marketArr
    marketCoins = res.tokenArr

    tradeMap = Reflect.ownKeys(pairs ?? {}).reduce((prev, key) => {
      const tradePairs = pairs[key as string]?.tokenList?.sort()
      prev[key] = {
        ...pairs[key as string],
        tradePairs,
      }
      return prev
    }, {})

    return {
      btradeMap: {
        marketArray,
        marketCoins,
        marketMap,
        tradeMap,
      },
      __timer__,
    }
  } catch (e) {
    throw { e, __timer__ }
  }

  // const resultTokenMap = sdk.makeMarket(_tokenMap);
}

export function* getPostsSaga() {
  try {
    const { btradeMap, __timer__ } = yield call(getBtradeMapApi)
    yield put(getBtradeMapStatus({ ...btradeMap, __timer__ }))
  } catch (err) {
    myLog('getBtradeMapStatus', err)
    yield put(getBtradeMapStatus({ error: (err as any)?.e, __timer__: (err as any)?.__timer__ }))
  }
}

export function* getBtradeSyncSaga({ payload }: PayloadAction<{ btradeMap: BtradeMap }>) {
  try {
    if (payload.btradeMap) {
      yield put(getBtradeMapStatus({ ...payload.btradeMap }))
    }
  } catch (err) {
    yield put(getBtradeMapStatus({ error: err }))
  }
}

export function* BtradeMapInitSaga() {
  yield all([takeLatest(getBtradeMap, getPostsSaga)])
}

export function* BtradeMapSyncSaga() {
  // @ts-ignore
  yield all([takeLatest(updateBtradeSyncMap, getBtradeSyncSaga)])
}

export const btradeMapFork = [fork(BtradeMapInitSaga), fork(BtradeMapSyncSaga)]
