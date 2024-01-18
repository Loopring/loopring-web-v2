import { all, call, fork, put, takeEvery } from 'redux-saga/effects'
import { getExclusiveRedpacket, getExclusiveRedpacketStatus } from './reducer'

import { store, LoopringAPI } from '../../index'
import { LuckyTokenItemForReceive } from '@loopring-web/loopring-sdk'
import { TargetRedPacketStates } from './interface'
var getExclusiveRedPacketAPIInterval: any
const getExclusiveRedPacketAPI = async (): Promise<{
  data: object | undefined
  __timer__: NodeJS.Timer | -1
}> => {
  let { __timer__ } = store.getState().targetRedpacket.__timer__
  if (LoopringAPI.luckTokenAPI) {
    if (getExclusiveRedPacketAPIInterval) {
      clearInterval(getExclusiveRedPacketAPIInterval)
    }
    getExclusiveRedPacketAPIInterval = setInterval(() => {
      console.log('getExclusiveRedpacket4')
      store.dispatch(getExclusiveRedpacket({}))
    }, 1000 * 60 * 5)

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
