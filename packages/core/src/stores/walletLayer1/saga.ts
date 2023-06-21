import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getWalletLayer1Status, updateWalletLayer1 } from './reducer'
import { CoinKey, PairKey, WalletCoin } from '@loopring-web/common-resources'
import { store, LoopringAPI } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'

type WalletLayer1Map<R extends { [key: string]: any }> = {
  [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>
}

const getWalletLayer1Balance = async <R extends { [key: string]: any }>() => {
  const { accAddress } = store.getState().account
  const { tokenMap, addressIndex } = store.getState().tokenMap

  if (tokenMap && LoopringAPI.exchangeAPI && accAddress) {
    const [{ tokenBalances: tokenBalancesObj }, { ethBalance }] = await Promise.all([
      // @ts-ignore
      LoopringAPI.exchangeAPI.getAllTokenBalances({
        owner: accAddress,
      }),
      LoopringAPI.exchangeAPI.getEthBalances({
        owner: accAddress,
      }),
      ,
    ])
    const tokenBalances = new Map()
    // @ts-ignore
    tokenBalancesObj.forEach((item, index) => {
      // @ts-ignore
      tokenBalances.set(item.address.toLowerCase(), item.value)
    })
    // const tokenBalances = new Map(Object.entries(tokenBalancesObj));
    tokenBalances.set(tokenMap['ETH']?.address as unknown as sdk.TokenAddress, ethBalance)
    let walletLayer1
    if (tokenBalances.size) {
      walletLayer1 = Array.from(tokenBalances.keys()).reduce((prev, item) => {
        return {
          ...prev,
          [addressIndex[item]]: {
            belong: addressIndex[item],
            count: sdk.fromWEI(tokenMap, addressIndex[item], tokenBalances.get(item)),
          },
        }
      }, {} as WalletLayer1Map<R>)
    }
    return { walletLayer1 }
  } else {
    return { walletLayer1: {} }
  }
}

export function* getPostsSaga() {
  try {
    //
    const { walletLayer1 } = yield call(getWalletLayer1Balance)
    yield put(getWalletLayer1Status({ walletLayer1 }))
  } catch (err) {
    yield put(getWalletLayer1Status({ error: err }))
  }
}

export function* walletLayer1Saga() {
  yield all([takeLatest(updateWalletLayer1, getPostsSaga)])
}

export const walletLayer1Fork = [
  fork(walletLayer1Saga),
  // fork(tokenPairsSaga),
]
