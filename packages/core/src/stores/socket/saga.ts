import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getSocketStatus, sendSocketTopic, socketEnd } from './reducer'
import { store } from '../index'
import { myLog } from '@loopring-web/common-resources'

const getEndSocket = async () => {
  await (window as any).loopringSocket.socketClose()
  myLog('socketStatus end')
  return
}

export function* closeSocket() {
  try {
    if ((window as any).loopringSocket) {
      yield call(getEndSocket)
      yield put(getSocketStatus(undefined))
    } else {
      yield put(getSocketStatus(undefined))
    }
  } catch (err) {
    yield put(getSocketStatus({ error: err }))
  }
}

const getSocket = async ({ socket, apiKey }: { socket: any; apiKey: string }) => {
  await (window as any).loopringSocket.socketSendMessage({ socket, apiKey })
  myLog('socketStatus get', socket)
  return
}

export function* sendMessage({ payload }: any) {
  try {
    const { apiKey } = store.getState().account
    const { socket } = payload
    if ((window as any).loopringSocket) {
      // yield call((window as any).loopringSocket.socketSendMessage, {socket, apiKey})
      yield call(getSocket, { socket, apiKey })
      yield put(getSocketStatus(undefined))
    } else {
      yield put(getSocketStatus(undefined))
    }
  } catch (err) {
    yield put(getSocketStatus({ error: err }))
  }
}

function* socketEndSaga() {
  yield all([takeLatest(socketEnd, closeSocket)])
}

function* socketSendMessageSaga() {
  yield all([takeLatest(sendSocketTopic, sendMessage)])
}

export const socketForks = [
  // fork(socketSaga),
  fork(socketEndSaga),
  fork(socketSendMessageSaga),
  //   fork(initConfig),
]
