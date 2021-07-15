import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getWalletLayer2Status, updateWalletLayer2 } from './reducer';
import { CoinKey, PairKey, WalletCoin } from '@loopring-web/component-lib/src/static-resource';
import { userAPI } from '../apis/api';
import store from '../index';

type WalletLayer2Map<R extends { [ key: string ]: any }> = {
    [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>
}

const getWalletLayer2Balance = async <R extends { [ key: string ]: any }>() => {
    //TODO: check is connect and active and assign walletLayer1
    //TODO: if not reject directory, any error happen will clean the
    // await sdk
    // const exchangeApi = exchangeAPI();
    const userApi = userAPI();
    const {accountId, apiKey} = store.getState().account;
    const {tokenMap, idIndex, marketCoins} = store.getState().tokenMap;
    let walletLayer2;
    if (apiKey && accountId) {
        // @ts-ignore
        const {userBalances} = await userApi.getUserBalances({accountId: accountId, tokens: ''}, apiKey)
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

// export function* walletLayer2Saga() {
//     yield all([takeLatest(updateWalletLayer2, getPostsSaga)]);
// }


export const walletLayer2Fork = [
    fork(walletLayer2Saga),
    // fork(tokenPairsSaga),
]

