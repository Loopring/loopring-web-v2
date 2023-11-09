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
  const { accAddress, apiKey } = store.getState().account
  const { defaultNetwork } = store.getState().settings
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const networkWallet: sdk.NetworkWallet = [
    sdk.NetworkWallet.ETHEREUM,
    sdk.NetworkWallet.GOERLI,
  ].includes(network as sdk.NetworkWallet)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]
  if (accAddress && apiKey && LoopringAPI.userAPI) {
    const response = await LoopringAPI.userAPI?.getNotificationAll({
      walletAddress: accAddress,
      offset: 0,
      limit: 5,
      network: networkWallet,
      notRead: true,
    })
    if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
    } else {
      //TODO
      const { totalNum, notifications } = {
        totalNum: 5,
        notifications: [
          {
            id: 59,
            walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            network: 'ETHEREUM',
            messageType: 4,
            message: 'You have received 1 USDC in your Loopring L2 wallet.',
            read: false,
            createAt: 1682075417910,
            redirectionContext: '',
          },
          {
            id: 60,
            walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            network: 'ETHEREUM',
            messageType: 6,
            message: 'Your deposit to Loopring L2 succeeded.',
            read: false,
            createAt: 1682078478712,
            redirectionContext: '',
          },
          {
            id: 61,
            walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            network: 'ETHEREUM',
            messageType: 4,
            message: 'You have received 25.2886 USDT in your Loopring L2 wallet.',
            read: false,
            createAt: 1682080502006,
            redirectionContext: '',
          },
          {
            id: 62,
            walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            network: 'ETHEREUM',
            messageType: 4,
            message: 'You have received 0.483106 USDT in your Loopring L2 wallet.',
            read: false,
            createAt: 1682081803957,
            redirectionContext: '',
          },
          {
            id: 63,
            walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            network: 'ETHEREUM',
            messageType: 2,
            message: 'You have received 94.739021912 LRC in your Ethereum L1 wallet.',
            read: false,
            createAt: 1682081861589,
            redirectionContext: '',
          },
        ],
      }
      return {
        //TODO
        myNotifyMap: {
          items: notifications,
          total: totalNum,
          unReads: 3,
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
