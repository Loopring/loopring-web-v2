import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import { getSocketStatus, sendSocketTopic, socketEnd } from './reducer'
import socketInstance from '../../services/socketUtil';
import store from '../index';
export function* closeSocket(){
    try {
        yield call(socketInstance.socketClose)
        yield put(getSocketStatus(undefined));
        //TODO check wallect store
    } catch (err) {
        yield put(getSocketStatus(err));
    }
}
export function* sendMessage({payload}: any){
    try {
        const { chainId } = store.getState().system;
        const { apiKey } = store.getState().account;
        const { socket } = payload;
        yield call(socketInstance.socketSendMessage, { chainId, socket, apiKey })
        yield put(getSocketStatus(undefined));
    } catch (err) {
        yield put(getSocketStatus(err));
    }
}

function* socketEndSaga(){
    yield all([takeLatest(socketEnd, closeSocket)]);
}

function* socketSendMessageSaga() {
    yield all([takeLatest(sendSocketTopic, sendMessage)]);
}



export const socketForks = [
    // fork(socketSaga),
    fork(socketEndSaga),
    fork(socketSendMessageSaga),
 //   fork(initConfig),
]



