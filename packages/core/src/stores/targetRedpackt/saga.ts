import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { getExclusiveRedpacket, getExclusiveRedpacketStatus } from './reducer'

import { store, LoopringAPI } from '../../index'
import { LuckyTokenItemForReceive } from '@loopring-web/loopring-sdk'
import { TargetRedPacketStates } from './interface'

const getExclusiveRedPacketAPI = async (): Promise<{
  data: object | undefined
  __timer__: NodeJS.Timer | -1
}> => {
  let { __timer__ } = store.getState().targetRedpacket.__timer__
  if (LoopringAPI.luckTokenAPI) {
    __timer__ = ((__timer__) => {
      if (__timer__ && __timer__ !== -1) {
        clearTimeout(__timer__)
      }
      return setTimeout(() => {
        store.dispatch(getExclusiveRedpacketStatus({}))
      }, 1000 * 60 * 30)
    })(__timer__)
    const account = store.getState().account
    const response = await LoopringAPI.luckTokenAPI?.getLuckTokenUserLuckyTokenTargets(
      {
        statuses: [0],
        offset: 0,
        limit: 100,
        isAll: 1,
      },
      account.apiKey,
    )
    const list = (response.raw_data as any).list as LuckyTokenItemForReceive[]

    return {
      data: list,
      __timer__,
    }
  } else {
    if (__timer__ && __timer__ !== -1) {
      clearTimeout(__timer__)
    }
    throw 'err'
    // return { data: undefined,, __timer__: -1 }
  }
}
function* getPostsSaga() {
  try {
    const { data, __timer__ } = yield call(getExclusiveRedPacketAPI)
    yield put(getExclusiveRedpacketStatus({ redPackets: data, __timer__ } as TargetRedPacketStates))
  } catch (err) {
    yield put(getExclusiveRedpacketStatus({ error: err }))
  }
}

function* exclusiveRedPacketInitSaga() {
  yield all([takeEvery(getExclusiveRedpacket, getPostsSaga)])
}

export const exclusiveRedPacketSaga = [fork(exclusiveRedPacketInitSaga)]
