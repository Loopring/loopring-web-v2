import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getVaultLayer2Status, socketUpdateBalance, updateVaultLayer2 } from './reducer'
import { CoinKey, PairKey, WalletCoin } from '@loopring-web/common-resources'
import { store, LoopringAPI } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'

type VaultLayer2Map<R extends { [key: string]: any }> = {
  [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>
}
const getVaultLayer2Balance = async <R extends { [key: string]: any }>() => {
  const {
    // tokenMap: { idIndex,coinMap },
    account: { accountId, apiKey },
    invest: {
      vaultMap: { idIndex: vaultIdIndex },
    },
    vaultLayer2: { vaultAccountInfo: _vaultAccountInfo },
  } = store.getState()
  // const { idIndex: vaultIdIndex } = store.getState().vaultMap

  let vaultLayer2, vaultAccountInfo
  if (apiKey && accountId && accountId >= 10000 && LoopringAPI.vaultAPI) {
    let promise: any[] = []

    // @ts-ignore
    try {
      promise.push(LoopringAPI.vaultAPI.getVaultInfoAndBalance({ accountId }, apiKey))

      if (_vaultAccountInfo && _vaultAccountInfo.hash && _vaultAccountInfo.isInActive) {
        promise.push(
          LoopringAPI.vaultAPI.getVaultGetOperationByHash(
            {
              accountId: accountId as any,
              hash: _vaultAccountInfo.hash,
            },
            apiKey,
          ),
        )
      }
      const [vaultAccountInfo, history] = await Promise.all(promise)
      if (
        (vaultAccountInfo as sdk.RESULT_INFO).code ||
        (vaultAccountInfo as sdk.RESULT_INFO).message
      ) {
        throw vaultAccountInfo
      }
      if (history?.operation?.status) {
        //TODO
      }
      // if(vaultAccountInfo.userAssets)
      if (vaultAccountInfo.userAssets) {
        vaultLayer2 = vaultAccountInfo.userAssets.reduce((prev, item) => {
          return { ...prev, [vaultIdIndex[item.tokenId]]: item }
        }, {} as VaultLayer2Map<R>)
      }
    } catch (error) {
      throw error
    }
  }
  return { vaultLayer2, vaultAccountInfo }
}
export function* getPostsSaga({
  payload,
}: {
  payload: { activeInfo?: { hash: string; isInActive: boolean } | undefined }
}) {
  try {
    let { vaultLayer2, vaultAccountInfo } = yield call(getVaultLayer2Balance)
    const activeInfo = undefined
    if (
      payload.activeInfo &&
      [sdk.VaultAccountStatus.FREE, sdk.VaultAccountStatus.UNDEFINED, ''].includes(
        vaultAccountInfo.accountStatus,
      )
    ) {
      vaultAccountInfo = {
        ...vaultAccountInfo,
        ...payload.activeInfo,
      }
    }
    yield put(getVaultLayer2Status({ vaultLayer2, vaultAccountInfo, activeInfo }))
  } catch (err) {
    yield put(getVaultLayer2Status({ error: err }))
  }
}

export function* vaultLayer2Saga() {
  // @ts-ignore
  yield all([takeLatest(updateVaultLayer2, getPostsSaga)])
}

export function* getSocketSaga({ payload }: any) {
  try {
    let { vaultLayer2 } = store.getState().vaultLayer2
    vaultLayer2 = { ...vaultLayer2, ...payload }
    yield put(getVaultLayer2Status({ vaultLayer2 }))
  } catch (err) {
    yield put(getVaultLayer2Status({ error: err }))
  }
}

export function* vaultLayer2SocketSaga() {
  yield all([takeLatest(socketUpdateBalance, getSocketSaga)])
}

export const vaultLayer2Fork = [fork(vaultLayer2Saga), fork(vaultLayer2SocketSaga)]
