import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getVaultMap, getVaultMapStatus, updateVaultSyncMap } from './reducer'
import { store } from '../../index'
import { LoopringAPI } from '../../../api_wrapper'
import { PayloadAction } from '@reduxjs/toolkit'
import * as sdk from '@loopring-web/loopring-sdk'
import { LocalStorageConfigKey, myLog } from '@loopring-web/common-resources'
import { makeVault } from '../../../hooks'
import { VaultMap } from './interface'

const getVaultMapApi = async () => {
  if (!LoopringAPI.vaultAPI) {
    return undefined
  }
  const { chainId } = store.getState().system
  const vaultMapStorage = window.localStorage.getItem(LocalStorageConfigKey.vaultMarkets)
  const vaultTokenMapStorage = window.localStorage.getItem(LocalStorageConfigKey.vaultTokenMap)
  let { __timer__ } = store.getState().invest.vaultMap
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearTimeout(__timer__)
    }
    return setTimeout(async () => {
      if (!LoopringAPI.defiAPI) {
        return undefined
      }
      // let { markets, pairs, tokenArr, tokenArrStr, marketArr, marketArrStr } =
      //   await LoopringAPI.defiAPI.getDefiMarkets();
      store.dispatch(getVaultMap(undefined))
    }, 30 * 1000) //15*60*1000 //900000
  })()

  try {
    const [tokenMapRaw, marketRaw] = await Promise.all([
      LoopringAPI.vaultAPI.getVaultTokens('1').then((response) => {
        if (
          !response ||
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          throw (response as sdk.RESULT_INFO).message
        } else {
          let tokenListRaw = response.tokens
          if (tokenListRaw) {
            localStorage.setItem(
              LocalStorageConfigKey.vaultTokenMap,
              JSON.stringify({
                ...(vaultTokenMapStorage ? JSON.parse(vaultTokenMapStorage) : {}),
                [chainId]: tokenListRaw,
              }),
            )
          }
          return tokenListRaw.map(token => ({
            ...token,
            type: 'Vault'
          }))
          
        }
      }),
      LoopringAPI.vaultAPI.getVaultMarkets().then((response) => {
        if (
          !response ||
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          throw (response as sdk.RESULT_INFO).message
        } else {
          let marketsRaw: any[] = response.markets
          localStorage.setItem(
            LocalStorageConfigKey.vaultMarkets,
            JSON.stringify({
              ...(vaultMapStorage ? JSON.parse(vaultMapStorage) : {}),
              [chainId]: marketsRaw,
            }),
          )
          // @ts-ignore
          return response.markets as sdk.VaultMarket[]
        }
      }),
    ])

    const result = makeVault(tokenMapRaw as sdk.VaultToken[], marketRaw)
    const tokenPrices = await LoopringAPI.vaultAPI
      .getVaultPrice({ tokenIds: Reflect.ownKeys(result.idIndex) })
      .then((response: any) => {
        if (
          !response ||
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          throw (response as sdk.RESULT_INFO).message
        } else {
          return response?.list?.reduce((prev, item) => {
            return { ...prev, [item.symbol]: item.price }
          }, {})
        }
      })
    return {
      ...result,
      tokenPrices,
      raw_data: {
        tokenMapRaw,
        marketRaw,
      },
    }
  } catch (error) {
    throw error
  }
}

export function* getPostsSaga() {
  try {
    const { __timer__, ...vaultMap } = yield call(getVaultMapApi)
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
