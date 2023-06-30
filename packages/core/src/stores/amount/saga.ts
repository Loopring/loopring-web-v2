import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getAmount, getAmountStatus, resetAmount } from './reducer'

import { store } from '../index'
import { LoopringAPI } from '../../api_wrapper'
import * as sdk from '@loopring-web/loopring-sdk'
import { myLog } from '@loopring-web/common-resources'

const getAmountApi = async <_R extends { [key: string]: any }>(
  market: string,
): Promise<{
  newAmountMap: object | undefined
  __timer__: NodeJS.Timer | -1
}> => {
  const { accountId, apiKey } = store.getState().account
  let { __timerMap__ } = store.getState().amountMap
  let __timer__ = __timerMap__ && __timerMap__[market] ? __timerMap__[market] : -1

  if (LoopringAPI.userAPI && accountId && apiKey) {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__)
    }
    __timer__ = setInterval(async () => {
      store.dispatch(getAmount(market))
    }, 1000 * 15 * 60) //   //

    const req: sdk.GetMinimumTokenAmtRequest = {
      accountId: accountId,
      market: market,
    }
    myLog('loop get getMinimumTokenAmt')

    const { amountMap: _pairMap } = await LoopringAPI.userAPI.getMinimumTokenAmt(req, apiKey)
    const reqAmm: sdk.GetMinimumTokenAmtRequest = {
      accountId: accountId,
      market: 'AMM-' + market,
    }
    const { amountMap: _pairMapAmm } = await LoopringAPI.userAPI.getMinimumTokenAmt(reqAmm, apiKey)
    return {
      newAmountMap: { [market]: _pairMap, ['AMM-' + market]: _pairMapAmm },
      __timer__,
    }
  } else {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__)
    }
    return Promise.resolve({ newAmountMap: {}, __timer__: -1 })
  }
}

export function* getPostsSaga({ payload: { market } }: any) {
  try {
    const { amountMap, __timerMap__ } = store.getState().amountMap
    if (market) {
      const { newAmountMap, __timer__ } = yield call(getAmountApi, market)
      yield put(
        getAmountStatus({
          amountMap: { ...amountMap, ...newAmountMap },
          __timerMap__: { ...__timerMap__, [market]: __timer__ },
        }),
      )
    } else {
      yield put(getAmountStatus({ amountMap, __timerMap__ }))
    }
  } catch (err) {
    yield put(getAmountStatus({ error: err }))
  }
}

export function* getResetsSaga() {
  try {
    let { __timerMap__ } = store.getState().amountMap
    if (__timerMap__) {
      Reflect.ownKeys(__timerMap__).map((market) => {
        let __timer__ = __timerMap__ && __timerMap__[market as string]
        if (__timer__ && __timer__ !== -1) {
          clearInterval(__timer__)
        }
      })
    }

    yield put(getAmountStatus({ amountMap: undefined, __timerMap__: undefined }))
  } catch (err) {
    yield put(getAmountStatus({ error: err }))
  }
}

function* amountSaga() {
  yield all([takeLatest(getAmount, getPostsSaga)])
}

function* restAmountSaga() {
  yield all([takeLatest(resetAmount, getResetsSaga)])
}

export const amountForks = [
  fork(amountSaga),
  fork(restAmountSaga),
  // fork(amountsSaga),
]
