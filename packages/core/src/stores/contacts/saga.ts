import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { updateContacts, getContactsStatus } from './reducer'

import { LoopringAPI, store } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'
import { NetworkMap } from '@loopring-web/common-resources'

const getContractsApi = async ({ limit = 100 }: { limit?: number }) => {
  const { isContractAddress, isCFAddress, accountId, apiKey } = store.getState().account
  const { defaultNetwork } = store.getState().settings
  let contacts: any[] = []
  if (apiKey && LoopringAPI.contactAPI && accountId) {
    const response = await LoopringAPI.contactAPI?.getContacts(
      {
        isHebao: !!(isContractAddress || isCFAddress),
        accountId,
        limit,
        offset: 0,
        // @ts-ignore
        network: NetworkMap[defaultNetwork].walletType,
      },
      apiKey,
    )
    if (response && ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)) {
      throw new Error((response as sdk.RESULT_INFO).message)
    }
    if (store.getState().account.accountId !== accountId) {
      return { contacts: [] }
    }
    contacts = response.contacts
    if (response.total > limit) {
      let more: Promise<any>[] = []
      for (let i = 1; i <= response.total / limit; i++) {
        more.push(
          LoopringAPI.contactAPI
            .getContacts(
              {
                isHebao: !!(isContractAddress || isCFAddress),
                accountId,
                limit,
                offset: i * limit,
              },
              apiKey,
            )
            .then((res) => {
              if (
                response &&
                ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
              ) {
                throw new Error((response as sdk.RESULT_INFO).message)
              }
              return res.contacts
            }),
        )
      }
      const res = await Promise.all(more)
      contacts = contacts.concat(res.flat())
    }
  }
  return { contacts }
}

export function* getPostsSaga() {
  try {
    const { contacts } = yield call(getContractsApi, {})
    yield put(getContactsStatus({ contacts }))
  } catch (err) {
    yield put(getContactsStatus({ error: err }))
  }
}

function* contractsSaga() {
  yield all([takeLatest(updateContacts, getPostsSaga)])
}

export const contractsForks = [fork(contractsSaga)]
