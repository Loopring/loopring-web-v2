import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getContact, getContactStatus, getUserContact } from './reducer'

import { Lang, MapChainId, url_path, url_test_path } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const getContactApi = async <_R extends { [key: string]: any }>(): Promise<{
  contactMap: Contact
}> => {
  const lng = store.getState().settings.language
  const baseURL = store.getState().system.baseURL
  let contactMap = {
    activities: [],
    notifications: [],
    invest: [],
  }

  const path = `${/uat/gi.test(baseURL) ? url_test_path : url_path}`
  const contact = await fetch(`${path}/notification.json`).then((response) => {
    if (response.ok) {
      return response.json()
    } else {
      return { prev: null }
    }
  })
  return {
    contactMap: {
      ...contactMap,
      ...contact['en'],
      ...contact[Lang[lng]],
      invest: contact.invest,
      prev: { ...contact?.prev },
    },
  }
}

const getContactUserApi = async () => {
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
        myContactMap: {
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
    const { contactMap } = yield call(getContactApi)
    yield put(getContactStatus({ contactMap }))
  } catch (err) {
    yield put(getContactStatus({ error: err }))
  }
}

export function* getPostsUserSaga() {
  try {
    const { myContactMap } = yield call(getContactUserApi)
    yield put(getContactStatus({ myContactMap }))
  } catch (err) {
    yield put(getContactStatus({ error: err }))
  }
}

function* contactUserSaga() {
  yield all([takeLatest(getContact, getPostsSaga)])
}

function* contactSaga() {
  yield all([takeLatest(getUserContact, getPostsUserSaga)])
}

export const contactForks = [fork(contactSaga), fork(contactUserSaga)]
