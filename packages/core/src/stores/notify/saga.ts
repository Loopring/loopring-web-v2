import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getNotify, getNotifyStatus, getUserNotify } from './reducer'

import { Lang, Notify, url_path, url_test_path } from '@loopring-web/common-resources'
import { store } from '../index'

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
  return {
    myNotifyMap: {
      items: [],
      totals: 1,
      unReads: 1,
    },
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
