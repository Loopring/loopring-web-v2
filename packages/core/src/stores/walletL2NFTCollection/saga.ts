import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getWalletL2NFTCollectionStatus, updateWalletL2NFTCollection } from './reducer'
import { store, LoopringAPI } from '../../index'
import { CustomError, ErrorMap, myLog, CollectionLimit } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const getWalletL2NFTCollectionBalance = async <_R extends { [key: string]: any }>({
  page,
}: {
  page: number
}) => {
  const offset = (page - 1) * CollectionLimit
  const { accountId, apiKey } = store.getState().account
  if (apiKey && accountId && LoopringAPI.userAPI) {
    const response = await LoopringAPI.userAPI
      .getUserNFTCollection(
        {
          accountId: accountId.toString(),
          limit: CollectionLimit,
          offset,
        },
        apiKey,
      )
      .catch((_error) => {
        throw new CustomError(ErrorMap.TIME_OUT)
      })
    let collections: sdk.CollectionMeta[] = [],
      totalNum = 0
    if (response && ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)) {
      throw new CustomError(ErrorMap.ERROR_UNKNOWN)
    }
    collections = (response as any).collections
    totalNum = (response as any).totalNum
    return {
      walletL2NFTCollection: collections ?? [],
      total: totalNum,
      page,
    }
  }
  return {}
}

export function* getPostsSaga({ payload: { page = 1 } }: any) {
  try {
    // @ts-ignore
    const walletL2NFTCollection: any = yield call(getWalletL2NFTCollectionBalance, {
      page,
    })
    yield put(getWalletL2NFTCollectionStatus({ ...walletL2NFTCollection }))
  } catch (err) {
    yield put(getWalletL2NFTCollectionStatus({ error: err }))
  }
}

export function* walletL2NFTCollectionSaga() {
  yield all([takeLatest(updateWalletL2NFTCollection, getPostsSaga)])
}

export const walletL2NFTCollectionFork = [fork(walletL2NFTCollectionSaga)]
