import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getWalletLayer2Status, socketUpdateBalance, updateWalletLayer2 } from './reducer';
import { CoinKey, PairKey, WalletCoin } from '@loopring-web/common-resources';
import { LoopringAPI } from 'api_wrapper';
import store from '../index';

type WalletLayer2Map<R extends { [ key: string ]: any }> = {
    [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>
}

const getWalletLayer2Balance = async <R extends { [ key: string ]: any }>() => {
    //TODO: check is connect and active and assign walletLayer1
    //TODO: if not reject directory, any error happen will clean the
    // await sdk
    // const exchangeApi = exchangeAPI();
    const {accountId, apiKey} = store.getState().account;
    const {tokenMap, idIndex, marketCoins} = store.getState().tokenMap;
    let walletLayer2;
    if (apiKey && accountId && LoopringAPI.userAPI) {
        // @ts-ignore
        const {userBalances} = await LoopringAPI.userAPI.getUserBalances({accountId: accountId, tokens: ''}, apiKey)
        if (userBalances) {
            // tokenId: number;
            // total: string;
            // locked: string;
            // pending: {
            //     withdraw: string;
            //     deposit: string;
            // };
            walletLayer2 = Reflect.ownKeys(userBalances).reduce((prev, item) => {
                // @ts-ignore
                return {...prev, [ idIndex[ item ] ]: userBalances[ Number(item) ]}
            }, {} as WalletLayer2Map<R>)
        }
    }

    return {walletLayer2}
};

export function* getPostsSaga() {
    try {
        //
        const {walletLayer2} = yield call(getWalletLayer2Balance);
        yield put(getWalletLayer2Status({walletLayer2}));
    } catch (err) {
        yield put(getWalletLayer2Status(err));
    }
}



export function* walletLayer2Saga() {
    yield all([takeLatest(updateWalletLayer2, getPostsSaga)]);
}
export function* getSocketSaga({payload}: any){

    try {
        let {walletLayer2} =  store.getState().walletLayer2;
        walletLayer2 = {...walletLayer2,...payload}
        yield put(getWalletLayer2Status({walletLayer2}));
    } catch (err) {
        yield put(getWalletLayer2Status(err));
    }
}

export function* walletLayerSocketSaga() {
    yield all([takeLatest(socketUpdateBalance, getSocketSaga)]);
}



export const walletLayer2Fork = [
    fork(walletLayer2Saga),
    fork(walletLayerSocketSaga),
]

