import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getSocketStatus, sendSocketTopic, socketEnd, socketUserEnd } from './reducer'
import { SocketMap, SocketUserMap, store } from '../index'
import { AccountStatus, myLog } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const getSocket = async ({ socket, apiKey }: { socket: any; apiKey?: string }) => {
  await (window as any).loopringSocket.socketSendMessage({ socket, apiKey })
  myLog('socketStatus get', socket)
  return
}
function* getEndSocket() {
  const account = store.getState().account
  let socket = {}
  if (account.readyState !== AccountStatus.ACTIVATED) {
    yield (window as any).loopringSocket.socketClose()
    myLog('socketStatus end')
  } else {
    socket = {
      [sdk.WsTopicType.account]: true,
      ['notification']: true,
    }
    // SocketUserMap
    yield getSocket({
      socket,
      apiKey: account.apiKey,
    })
    // yield getSocket({ payload: { socket: SocketUserMap } })
  }

  return { socket }
}

export function* closeSocket() {
  try {
    if ((window as any).loopringSocket) {
      const { socket } = yield call(getEndSocket)
      yield put(getSocketStatus({ socket }))
    } else {
      yield put(getSocketStatus(undefined))
    }
  } catch (err) {
    yield put(getSocketStatus({ error: err }))
  }
}

export function* closeUserSocket() {
  let { socket } = store.getState().socket
  try {
    if ((window as any).loopringSocket) {
      delete socket[sdk.WsTopicType.account]
      delete socket['notification']
      yield getSocket({
        socket,
      })
      yield put(getSocketStatus({ socket }))
    } else {
      yield put(getSocketStatus(undefined))
    }
  } catch (err) {
    yield put(getSocketStatus({ error: err }))
  }
}

export function* sendMessage({ payload }: { payload: { socket: SocketMap } }) {
  try {
    const { apiKey, readyState } = store.getState().account
    const { socket } = payload
    if ((window as any).loopringSocket) {
      let userSocket: SocketMap & SocketUserMap = { ...socket }
      if (readyState == AccountStatus.ACTIVATED) {
        userSocket = {
          ...userSocket,
          [sdk.WsTopicType.account]: true,
          ['notification']: true,
        }
      }
      // yield call((window as any).loopringSocket.socketSendMessage, {socket, apiKey})
      yield call(getSocket, {
        socket: userSocket,
        apiKey,
      })
      yield put(getSocketStatus({ socket: userSocket }))
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
function* socketUserEndSaga() {
  yield all([takeLatest(socketUserEnd, closeUserSocket)])
}

function* socketSendMessageSaga() {
  yield all([takeLatest<any>(sendSocketTopic, sendMessage)])
}

export const socketForks = [
  // fork(socketSaga),
  fork(socketEndSaga),
  fork(socketSendMessageSaga),
  fork(socketUserEndSaga),
  //   fork(initConfig),
]
