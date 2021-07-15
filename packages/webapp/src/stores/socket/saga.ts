import { all, call, fork, put, takeLatest } from 'redux-saga/effects';
import { getSocketStatus, sendSocketTopic, socketEnd } from './reducer'
import {
    socketClose, socketSendMessage,
} from '../../services/socketUtil';
import store from '../index';
export function* closeSocket(){
    try {
        yield call(socketClose)
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
        // @ts-ignore
        yield call(socketSendMessage, { chainId, socket, apiKey })
        yield put(getSocketStatus(undefined));
    } catch (err) {
        yield put(getSocketStatus(err));
    }
}

function* socketEndSaga(){
    yield all([takeLatest(socketEnd, closeSocket)]);
}
// function* socketSaga() {
//     yield all([takeLatest(socketStart, startSocket)]);
// }
function* socketSendMessageSaga() {
    yield all([takeLatest(sendSocketTopic, sendMessage)]);
}



export const socketForks = [
    // fork(socketSaga),
    fork(socketEndSaga),
    fork(socketSendMessageSaga),
 //   fork(initConfig),
]



