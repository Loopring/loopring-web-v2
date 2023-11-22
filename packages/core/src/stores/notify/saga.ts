import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getNotify, getNotifyStatus, getUserNotify } from './reducer'

import { Lang, MapChainId, Notify, url_path, url_test_path } from '@loopring-web/common-resources'
import { store } from '../index'
import { LoopringAPI } from '../../api_wrapper'
import * as sdk from '@loopring-web/loopring-sdk'

const getNotifyApi = async <_R extends { [key: string]: any }>(): Promise<{
  notifyMap: Notify
}> => {
  const lng = store.getState().settings.language
  const baseURL = store.getState().system.baseURL
  let notifyMap = {
    activities: [],
    notifications: [],
    invest: [],
  }

  const path = `${/uat/gi.test(baseURL) ? url_test_path : url_path}`
  const notify = await fetch(`${path}/notification.json`).then((response) => {
    if (response.ok) {
      return response.json()
    } else {
      return { prev: null }
    }
  })
  return {
    notifyMap: {
      ...notifyMap,
      ...notify['en'],
      ...notify[Lang[lng]],
      invest: notify.invest,
      prev: { ...notify?.prev },
    },
  }
}

const getNotifyUserApi = async () => {
  const { accountId, apiKey } = store.getState().account
  const { defaultNetwork } = store.getState().settings
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const networkWallet: sdk.NetworkWallet = [
    sdk.NetworkWallet.ETHEREUM,
    sdk.NetworkWallet.GOERLI,
  ].includes(network as sdk.NetworkWallet)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]
  if (accountId && accountId !== -1 && apiKey && LoopringAPI.userAPI) {
    const response = await LoopringAPI.userAPI?.getNotificationAll(
      {
        accountId: accountId,
        offset: 0,
        limit: 5,
        network: networkWallet,
        notRead: true,
      },
      apiKey,
    )
    if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
    } else {
      //@ts-ignore
      const { totalNum, notRead, notifications } = response
      return {
        myNotifyMap: {
          items: notifications,
          total: totalNum,
          unReads: notRead,
        },
      }
    }
  }
}

export function* getPostsSaga() {
  try {
    const { notifyMap } = yield call(getNotifyApi)
    yield put(getNotifyStatus({ notifyMap }))
  } catch (err) {
    yield put(getNotifyStatus({ error: err }))
  }
}

export function* getPostsUserSaga() {
  try {
    const { myNotifyMap } = yield call(getNotifyUserApi)
    yield put(getNotifyStatus({ myNotifyMap }))
  } catch (err) {
    yield put(getNotifyStatus({ error: err }))
  }
}

function* notifyUserSaga() {
  yield all([takeLatest(getNotify, getPostsSaga)])
}

function* notifySaga() {
  yield all([takeLatest(getUserNotify, getPostsUserSaga)])
}

export const notifyForks = [fork(notifySaga), fork(notifyUserSaga)]
