import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import {
  cleanAccountStatus,
  nextAccountStatus,
  nextAccountSyncStatus,
  statusUnset,
  updateAccountStatus,
} from './reducer'
import { PayloadAction } from '@reduxjs/toolkit'
import { Account, AccountStatus, MapChainId, myLog } from '@loopring-web/common-resources'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import { AccountInfo, NetworkWallet, WalletType } from '@loopring-web/loopring-sdk'
import { store } from '../index'
import { LoopringAPI } from '../../api_wrapper'
import { toggleCheck } from '../../services'

const LoopFrozenFlag = true
const getAccount = async (): Promise<{
  account: AccountInfo
  walletType: WalletType
  __timer__: NodeJS.Timer | -1
}> => {
  let { accAddress, __timer__, frozen } = store.getState().account
  let { defaultNetwork } = store.getState().settings
  if (frozen === LoopFrozenFlag) {
    __timer__ = ((__timer__) => {
      if (__timer__ && __timer__ !== -1) {
        clearTimeout(__timer__ as any)
      }
      return setTimeout(() => {
        store.dispatch(updateAccountStatus({ frozen: account.frozen }))
      }, 1000 * 60)
    })(__timer__)
  }
  const [{ accInfo: account }, { walletType }] = await Promise.all([
    LoopringAPI?.exchangeAPI?.getAccount({
      owner: accAddress,
    }) ?? Promise.resolve({ accInfo: {} } as any),
    LoopringAPI?.walletAPI?.getWalletType({
      wallet: accAddress, //realAddr != "" ? realAddr : address,
      network: MapChainId[defaultNetwork] as NetworkWallet
    }) ?? Promise.resolve({ walletType: {} } as any),
  ])

  if (__timer__ && __timer__ !== -1) {
    clearTimeout(__timer__ as any)
  }
  return {
    account: {
      ...account,
      isContractAddress: walletType?.loopringWalletContractVersion ? true : false,
      isCFAddress: walletType?.isInCounterFactualStatus ? true : false
    },
    walletType: {
      ...walletType,
      isContract1XAddress: walletType?.loopringWalletContractVersion?.startsWith('V1_') ?? false,
    },
    __timer__: __timer__ ?? -1,
  }
}

export function* accountUpdateSaga({ payload }: PayloadAction<Partial<Account>>) {
  try {
    let data = { account: {}, walletType: {}, __timer__: -1 }
    data = yield call(getAccount)
    yield put(
      nextAccountStatus({
        ...payload,
        ...data.account,
        ...data.walletType,
        __timer__: data.__timer__,
      }),
    )
    toggleCheck()
  } catch (err) {
    yield put(nextAccountStatus({ error: err }))
  }
}

export function* cleanAccountSaga({
  payload,
}: PayloadAction<{ shouldUpdateProvider?: boolean | undefined }>) {
  try {
    let account: Partial<Account> = {
      accAddress: '',
      readyState: AccountStatus.UN_CONNECT,
      accountId: -1,
      apiKey: '',
      eddsaKey: '',
      publicKey: {},
      level: '',
      nonce: -1,
      keyNonce: -1,
      keySeed: '',
      _accountIdNotActive: -1,
      isInCounterFactualStatus: undefined,
      isContract: undefined,
      isContract1XAddress: undefined,
    }

    if (payload && payload.shouldUpdateProvider) {
      yield call(async () => await connectProvides.clear())
      account = {
        ...account,
        connectName: ConnectProviders.Unknown,
      }
    }
    yield put(
      nextAccountStatus({
        ...account,
      }),
    )
  } catch (err) {
    yield put(nextAccountStatus({ error: err }))
  }
}

export function* accountUpdateSyncSaga(action: PayloadAction<Account>) {
  try {
    myLog('accountUpdateSyncSaga', action.payload, action)
    yield put(
      nextAccountStatus({
        ...action?.payload,
      }),
    )
    yield put(statusUnset({}))
  } catch (err) {
    yield put(nextAccountStatus({ error: err }))
  }
}

function* accountSage() {
  // @ts-ignore
  yield all([takeLatest(updateAccountStatus, accountUpdateSaga)])
}
function* accountSyncSage() {
  // @ts-ignore
  yield all([takeLatest(nextAccountSyncStatus, accountUpdateSyncSaga)])
}

function* accountRestSage() {
  // @ts-ignore
  yield all([takeLatest(cleanAccountStatus, cleanAccountSaga)])
}

export const accountFork = [fork(accountSage), fork(accountRestSage), fork(accountSyncSage)]
