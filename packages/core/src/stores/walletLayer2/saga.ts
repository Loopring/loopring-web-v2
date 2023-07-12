import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getWalletLayer2Status, socketUpdateBalance, updateWalletLayer2 } from './reducer'
import { CoinKey, PairKey, WalletCoin } from '@loopring-web/common-resources'
import { store, LoopringAPI } from '../../index'

type WalletLayer2Map<R extends { [key: string]: any }> = {
  [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>
}

const getWalletLayer2Balance = async <R extends { [key: string]: any }>() => {
  const { accountId, apiKey, readyState, _accountIdNotActive, accAddress } =
    store.getState().account
  const { idIndex } = store.getState().tokenMap
  let walletLayer2

  if (apiKey && accountId && accountId >= 10000 && LoopringAPI.userAPI) {
    // @ts-ignore
    try {
      const { userBalances } = await LoopringAPI.userAPI.getUserBalances(
        { accountId, tokens: '' },
        apiKey,
      )
      if (userBalances) {
        walletLayer2 = Reflect.ownKeys(userBalances).reduce((prev, item) => {
          // @ts-ignore
          return { ...prev, [idIndex[item]]: userBalances[Number(item)] }
        }, {} as WalletLayer2Map<R>)
      }
    } catch (error) {
      throw error
    }
  } else if (
    !apiKey &&
    ['DEPOSITING', 'NOT_ACTIVE', 'LOCKED', 'NO_ACCOUNT'].includes(readyState) &&
    accAddress &&
    LoopringAPI.exchangeAPI &&
    LoopringAPI.globalAPI
  ) {
    let _accountId =
      _accountIdNotActive && _accountIdNotActive !== -1 ? _accountIdNotActive : accountId
    if (['NO_ACCOUNT'].includes(readyState) || _accountIdNotActive == -1) {
      const { accInfo } = await LoopringAPI.exchangeAPI.getAccount({
        owner: accAddress,
      })
      _accountId = accInfo.accountId
    }
    if (_accountId && _accountId !== -1) {
      const { userBalances } =
        (await LoopringAPI.globalAPI.getUserBalanceForFee({
          accountId: _accountId,
          tokens: '',
          // tokens,
        })) ?? {}
      if (userBalances) {
        // @ts-ignore
        walletLayer2 = Reflect.ownKeys(userBalances).reduce((prev, item) => {
          return { ...prev, [idIndex[item]]: userBalances[Number(item)] }
        }, {} as WalletLayer2Map<R>)
      }
    }
  }
  return { walletLayer2 }
}

export function* getPostsSaga() {
  try {
    const { walletLayer2 } = yield call(getWalletLayer2Balance)
    yield put(getWalletLayer2Status({ walletLayer2 }))
  } catch (err) {
    yield put(getWalletLayer2Status({ error: err }))
  }
}

export function* walletLayer2Saga() {
  yield all([takeLatest(updateWalletLayer2, getPostsSaga)])
}

export function* getSocketSaga({ payload }: any) {
  try {
    let { walletLayer2 } = store.getState().walletLayer2
    walletLayer2 = { ...walletLayer2, ...payload }
    yield put(getWalletLayer2Status({ walletLayer2 }))
  } catch (err) {
    yield put(getWalletLayer2Status({ error: err }))
  }
}

export function* walletLayer2SocketSaga() {
  yield all([takeLatest(socketUpdateBalance, getSocketSaga)])
}

export const walletLayer2Fork = [fork(walletLayer2Saga), fork(walletLayer2SocketSaga)]
