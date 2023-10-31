import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getVaultLayer2Status, socketUpdateBalance, updateVaultLayer2 } from './reducer'
import { CoinKey, PairKey, WalletCoin } from '@loopring-web/common-resources'
import { store, LoopringAPI } from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'

type VaultLayer2Map<R extends { [key: string]: any }> = {
  [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>
}
const getVaultLayer2Balance = async <R extends { [key: string]: any }>(activeInfo?: {
  hash: string
  isInActive: boolean
}) => {
  let {
    // tokenMap: { idIndex,coinMap },
    account: { accountId, apiKey },
    invest: {
      vaultMap: { idIndex: vaultIdIndex },
    },
    vaultLayer2: { __timer__ },
  } = store.getState()
  // const { idIndex: vaultIdIndex } = store.getState().vaultMap
  let _activeInfo: any = undefined,
    vaultLayer2,
    vaultAccountInfo,
    history
  if (apiKey && accountId && accountId >= 10000 && LoopringAPI.vaultAPI) {
    let promise: any[] = []

    // @ts-ignore
    try {
      promise.push(LoopringAPI.vaultAPI.getVaultInfoAndBalance({ accountId }, apiKey))

      if (activeInfo && activeInfo.hash && activeInfo.isInActive) {
        promise.push(
          LoopringAPI.vaultAPI.getVaultGetOperationByHash(
            {
              accountId: accountId as any,
              hash: activeInfo.hash,
            },
            apiKey,
          ),
        )
      }
      ;[vaultAccountInfo, history] = await Promise.all(promise)
      if (
        (vaultAccountInfo as sdk.RESULT_INFO).code ||
        (vaultAccountInfo as sdk.RESULT_INFO).message
      ) {
        throw vaultAccountInfo
      }
      if (
        history &&
        history?.raw_data?.operation?.status &&
        [
          sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
          sdk.VaultOperationStatus.VAULT_STATUS_FAILED,
        ].includes(history?.operation?.status?.toUpperCase() ?? '')
      ) {
        _activeInfo = undefined
        if (__timer__ && __timer__ !== -1) {
          clearTimeout(__timer__)
          __timer__ = -1
        }
      } else if (
        activeInfo &&
        [sdk.VaultAccountStatus.FREE, sdk.VaultAccountStatus.UNDEFINED, ''].includes(
          vaultAccountInfo.accountStatus,
        )
      ) {
        _activeInfo = activeInfo
        __timer__ = ((__timer__) => {
          if (__timer__ && __timer__ !== -1) {
            clearTimeout(__timer__)
          }
          return setTimeout(() => {
            store.dispatch(updateVaultLayer2({ activeInfo }))
          }, 1000 * 3)
        })(__timer__)
      }

      // if(vaultAccountInfo.userAssets)
      if (vaultAccountInfo.userAssets) {
        vaultLayer2 = vaultAccountInfo.userAssets.reduce((prev, item) => {
          prev[vaultIdIndex[item.tokenId]] = item
          return prev
        }, {} as VaultLayer2Map<R>)
      }
    } catch (error) {
      throw error
    }
  }

  return { vaultLayer2, vaultAccountInfo, activeInfo: _activeInfo, __timer__ }
}
export function* getPostsSaga({
  payload,
}: {
  payload: { activeInfo?: { hash: string; isInActive: boolean } | undefined }
}) {
  try {
    let { vaultLayer2, vaultAccountInfo, activeInfo, __timer__ } = yield call(
      getVaultLayer2Balance,
      payload.activeInfo,
    )

    yield put(getVaultLayer2Status({ vaultLayer2, vaultAccountInfo, activeInfo, __timer__ }))
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
