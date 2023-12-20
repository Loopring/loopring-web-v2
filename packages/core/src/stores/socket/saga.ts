import { all, fork, put, takeLatest } from 'redux-saga/effects'
import { getSocketStatus, sendSocketTopic, socketEnd, socketUserEnd } from './reducer'
import { SocketMap, SocketUserMap, store } from '../index'
import { AccountStatus, MapChainId, myLog } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const getSocket = async ({ socket, apiKey }: { socket: any; apiKey?: string }) => {
  await (window as any).loopringSocket.socketSendMessage({ socket, apiKey })
  myLog('socketStatus get', socket)
  return
}

export function* closeSocket() {
  try {
    const {
      settings: { defaultNetwork },
      account,
    } = store.getState()
    if ((window as any).loopringSocket) {
      // const { socket } = yield call(getEndSocket)
      // function* getEndSocket() {

      const network = MapChainId[defaultNetwork] ?? MapChainId[1]
      const networkWallet: sdk.NetworkWallet = [
        sdk.NetworkWallet.ETHEREUM,
        sdk.NetworkWallet.GOERLI,
      ].includes(network as sdk.NetworkWallet)
        ? sdk.NetworkWallet.ETHEREUM
        : sdk.NetworkWallet[network]
      let socket = {}
      if (account.readyState !== AccountStatus.ACTIVATED) {
        yield (window as any).loopringSocket.socketClose()
        myLog('socketStatus end')
      } else {
        socket = {
          [sdk.WsTopicType.account]: true,
          [sdk.WsTopicType.notification]: {
            address: account.accAddress,
            network: networkWallet,
          },
        }
        // SocketUserMap
        yield getSocket({
          socket,
          apiKey: account.apiKey,
        })
      }
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
      delete socket[sdk.WsTopicType.notification]
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
    const {
      settings: { defaultNetwork },
      account,
    } = store.getState()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const networkWallet: sdk.NetworkWallet = [
      sdk.NetworkWallet.ETHEREUM,
      sdk.NetworkWallet.GOERLI,
    ].includes(network as sdk.NetworkWallet)
      ? sdk.NetworkWallet.ETHEREUM
      : sdk.NetworkWallet[network]
    const { socket } = payload
    if ((window as any).loopringSocket) {
      let userSocket: SocketMap & SocketUserMap = { ...socket }
      if (account.readyState == AccountStatus.ACTIVATED && account.accAddress) {
        userSocket = {
          ...userSocket,
          [sdk.WsTopicType.account]: true,
          [sdk.WsTopicType.notification]: {
            address: account.accAddress,
            network: networkWallet,
          },
        }
      }
      yield getSocket({
        socket: userSocket,
        apiKey: account.apiKey,
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
