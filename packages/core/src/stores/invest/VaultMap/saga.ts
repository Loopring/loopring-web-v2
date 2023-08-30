import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getVaultMap, getVaultMapStatus, updateVaultSyncMap } from './reducer'
import { VaultMap, store } from '../../index'
import { LoopringAPI } from '../../../api_wrapper'
import { PayloadAction } from '@reduxjs/toolkit'
import * as sdk from '@loopring-web/loopring-sdk'
import { BTRDE_PRE, myLog, UIERROR_CODE } from '@loopring-web/common-resources'

const getVaultMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined
  }
  const { chainId } = store.getState().system
  const vaultMapStorage = window.localStorage.getItem('vaultMarkets')
  let { __timer__ } = store.getState().invest.vaultMap
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
      store.dispatch(getVaultMap(undefined))
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
      response = await LoopringAPI.defiAPI?.getVaultMarkets()
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
          vaultMarket: ele.market,
          market: ele.market.replace(BTRDE_PRE, ''),
          feeBips: undefined,
          enabled: 'isFormLocal', //localStorageSetAs false
          minAmount: {
            base: undefined,
            quote: undefined,
          },
          vaultAmount: {
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
            vaultMarket: ele.market,
            market: ele.market.replace(BTRDE_PRE, ''),
          } as sdk.BTRADE_MARKET,
        ]
      } else {
        return prev
      }
    }, [] as sdk.BTRADE_MARKET[])
    localStorage.setItem(
      'vaultMarkets',
      JSON.stringify({
        ...(vaultMapStorage ? JSON.parse(vaultMapStorage) : {}),
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
      vaultMap: {
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
    const { vaultMap, __timer__ } = yield call(getVaultMapApi)
    yield put(getVaultMapStatus({ ...vaultMap, __timer__ }))
  } catch (err) {
    myLog('getVaultMapStatus', err)
    yield put(getVaultMapStatus({ error: (err as any)?.e, __timer__: (err as any)?.__timer__ }))
  }
}

export function* getVaultSyncSaga({ payload }: PayloadAction<{ vaultMap: VaultMap }>) {
  try {
    if (payload.vaultMap) {
      yield put(getVaultMapStatus({ ...payload.vaultMap }))
    }
  } catch (err) {
    yield put(getVaultMapStatus({ error: err }))
  }
}

export function* VaultMapInitSaga() {
  yield all([takeLatest(getVaultMap, getPostsSaga)])
}

export function* VaultMapSyncSaga() {
  // @ts-ignore
  yield all([takeLatest(updateVaultSyncMap, getVaultSyncSaga)])
}

export const vaultMapFork = [fork(VaultMapInitSaga), fork(VaultMapSyncSaga)]
