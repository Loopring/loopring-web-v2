import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getTokenMap, getTokenMapStatus } from './reducer'
import { GetTokenMapParams } from './interface'
import { PayloadAction } from '@reduxjs/toolkit'
import { store } from '../index'
import { LocalStorageConfigKey } from '@loopring-web/common-resources'

const getTokenMapApi = async <R extends { [key: string]: any }>({
  tokensMap,
  coinMap,
  totalCoinMap,
  idIndex,
  addressIndex,
  pairs,
  marketArr,
  tokenArr,
  disableWithdrawTokenList,
  tokenListRaw,
  disableWithdrawTokenListRaw,
  marketRaw,
}: GetTokenMapParams<R>) => {
  const { chainId } = store.getState().system
  const tokenChainMap = window.localStorage.getItem('tokenMap')
  const disableWithdrawTokenListChain = window.localStorage.getItem('disableWithdrawTokenList')
  const marketChain = window.localStorage.getItem('markets')
  // let coinMap: CoinMap<any, CoinInfo<any>> = {};
  // let totalCoinMap: CoinMap<any, CoinInfo<any>> = {};
  let tokenMap: any = tokensMap
  // let addressIndex: AddressMap = {};
  // let idIndex: IdMap = {};
  let disableWithdrawList: string[] = disableWithdrawTokenList
    ? disableWithdrawTokenList.map((item) => {
        return item.symbol
      })
    : []

  Reflect.ownKeys(tokensMap).forEach((key) => {
    if (pairs[key as string] && pairs[key as string].tokenList) {
      // @ts-ignore
      tokensMap[key].tradePairs = pairs[key as string].tokenList
    }
  })
  if (disableWithdrawTokenListRaw) {
    localStorage.setItem(
      'disableWithdrawTokenList',
      JSON.stringify({
        ...(disableWithdrawTokenListChain ? JSON.parse(disableWithdrawTokenListChain) : {}),
        [chainId]: disableWithdrawTokenListRaw,
      }),
    )
  }
  if (tokenListRaw) {
    localStorage.setItem(
      'tokenMap',
      JSON.stringify({
        ...(tokenChainMap ? JSON.parse(tokenChainMap) : {}),
        [chainId]: tokenListRaw,
      }),
    )
  }
  if (marketRaw) {
    localStorage.setItem(
      'markets',
      JSON.stringify({
        ...(marketChain ? JSON.parse(marketChain) : {}),
        [chainId]: marketRaw,
      }),
    )
  }

  return {
    data: {
      coinMap,
      totalCoinMap,
      addressIndex,
      idIndex,
      tokenMap,
      disableWithdrawList,
      marketArray: marketArr,
      marketCoins: tokenArr,
    },
  }
}

export function* getPostsSaga<R extends { [key: string]: any }>({
  payload,
}: PayloadAction<GetTokenMapParams<R>>) {
  try {
    const {
      tokensMap,
      coinMap,
      totalCoinMap,
      idIndex,
      addressIndex,
      marketMap,
      pairs,
      marketArr,
      tokenArr,
      disableWithdrawTokenList,
      tokenListRaw,
      marketRaw,
      disableWithdrawTokenListRaw,
    } = payload

    // @ts-ignore
    const { data } = yield call(getTokenMapApi, {
      tokensMap,
      coinMap,
      totalCoinMap,
      idIndex,
      addressIndex,
      pairs,
      marketArr,
      tokenArr,
      disableWithdrawTokenList,
      tokenListRaw,
      marketRaw,
      disableWithdrawTokenListRaw,
    })

    yield put(getTokenMapStatus({ ...data, marketMap }))
  } catch (err) {
    yield put(getTokenMapStatus({ error: err }))
  }
}

export function* tokenInitSaga() {
  yield all([takeLatest(getTokenMap, getPostsSaga)])
}

export const tokenSaga = [
  fork(tokenInitSaga),
  // fork(tokenPairsSaga),
]
