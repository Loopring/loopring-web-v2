import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getVaultTickers, getVaultTickerStatus, updateVaultTicker } from './reducer'
import { myLog } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { PayloadAction } from '@reduxjs/toolkit'
import { store } from '../../index'
import { LoopringAPI } from '../../../api_wrapper'
import { makeTokenTickerMap, makeTokenTickerView } from '../../../hooks'
import { values } from 'lodash'

const getVaultTickersApi = async (): Promise<{
  data: object | undefined
  __timer__: NodeJS.Timer | -1
}> => {
  const {
    invest,
  } = store.getState()
  let {
    vaultTickerMap,
    vaultMap: { tokenMap: vaultTokenMap },
  } = invest
  let { __timer__ } = vaultTickerMap
  if (LoopringAPI.exchangeAPI) {
    __timer__ = ((__timer__) => {
      if (__timer__ && __timer__ !== -1) {
        clearTimeout(__timer__)
      }
      return setTimeout(() => {
        store.dispatch(getVaultTickers({}))
      }, 1000 * 60 * 5)
    })(__timer__)
    const vaultTickers = await LoopringAPI.exchangeAPI.getSupportTokens({
      cmcTokenIds: values(vaultTokenMap).map(token => token.cmcTokenId),
      currency: 'USD',
    })
    //@ts-ignore
    const data = makeTokenTickerMap({ rawData: vaultTickers.list, isVault: true })
    return { data, __timer__ }
  } else {
    if (__timer__ && __timer__ !== -1) {
      clearTimeout(__timer__)
    }
    return { data: {}, __timer__: -1 }
  }
}

function* getPostsSaga() {
  try {
    const { data, __timer__ } = yield call(getVaultTickersApi)
    yield put(getVaultTickerStatus({ vaultTickerMap: data, __timer__ }))
  } catch (err) {
    yield put(getVaultTickerStatus({ error: err }))
  }
}

function* vaultTickerMakeMap({ payload }: PayloadAction<sdk.DatacenterTokenInfoSimple>) {
  try {
    const { invest } = store.getState()
    let { vaultTickerMap } = invest
    const data = makeTokenTickerView({ item: payload, isVault: true })
    yield put(
      getVaultTickerStatus({
        vaultTickerMap: { ...vaultTickerMap, ...{ [payload?.symbol as any]: data } },
      }),
    )
  } catch (err) {
    myLog('err', err)
    yield put(getVaultTickerStatus(err))
  }
}

function* vaultTickersSaga() {
  yield all([takeLatest(getVaultTickers, getPostsSaga)])
}

function* vaultTickerSyncSaga() {
  // @ts-ignore
  yield all([takeLatest(updateVaultTicker, vaultTickerMakeMap)])
}

export const vaultTickerForks = [fork(vaultTickerSyncSaga), fork(vaultTickersSaga)]
