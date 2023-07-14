import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { circleUpdateLayer1ActionHistory, layer1ActionHistoryStatus } from './reducer'
import { PayloadAction } from '@reduxjs/toolkit'
import { store } from '../../index'
import { ChainId } from '@loopring-web/loopring-sdk'

const updateLayer1ActionHistory = async <_R extends { [key: string]: any }>({
  chainId,
}: {
  chainId: ChainId
}) => {
  let { __timer__, ...layer1ActionHistory } = store.getState().localStore.layer1ActionHistory
  const now = Date.now()
  let _layer1ActionHistory = {}
  if (layer1ActionHistory[chainId]) {
    Reflect.ownKeys(layer1ActionHistory[chainId]).map((item) => {
      if (layer1ActionHistory[chainId][item as string]) {
        // _layer1ActionHistory = _.cloneDeep(layer1ActionHistory[chainId][item]);
        _layer1ActionHistory[item] = Reflect.ownKeys(
          layer1ActionHistory[chainId][item as string],
        ).reduce((prev, unit) => {
          if (
            unit &&
            now - 1800000 < layer1ActionHistory[chainId][item as string][unit] //1800000
          ) {
            prev[unit] = layer1ActionHistory[chainId][item as string][unit]
            return prev
          }
          return prev
        }, {})
      }
    })
  }
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__)
    }
    return setInterval(() => {
      const chainId = store.getState().system.chainId
      store.dispatch(circleUpdateLayer1ActionHistory({ chainId }))
    }, 300000) //5*60*1000 //300000
  })()
  return { layer1ActionHistory: _layer1ActionHistory, __timer__, chainId }
}

export function* getPostsSaga({ payload }: PayloadAction<{ chainId: ChainId }>) {
  try {
    const { __timer__, chainId, layer1ActionHistory } = yield call(updateLayer1ActionHistory, {
      chainId: payload.chainId,
    })
    yield put(layer1ActionHistoryStatus({ layer1ActionHistory, __timer__, chainId }))
  } catch (err) {
    yield put(layer1ActionHistoryStatus({ error: err }))
  }
}

function* Layer1Saga() {
  yield all([takeLatest(circleUpdateLayer1ActionHistory, getPostsSaga)])
}

export const layer1ActionHistoryForks = [fork(Layer1Saga)]
