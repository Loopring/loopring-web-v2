import { all, takeLatest, call, put } from "redux-saga/effects";
import { getAmmTrades, getAmmTradesStatus } from './reducer';

const getAmmTradesApi = ()=>new Promise((resolve)=>{
    //TODO: check is connect and active and assign wallet
    //TODO: if not reject directory, any error happen will clean the
    resolve([
    {side: 'Buy',
        amount: {
            sell:{ belong:'ETH', tradeValue: 0.1 },
            buy:{ belong:'LRC', tradeValue: 123 }
        },
        time: Date.now(),
        fee: 0.02,
        priceValue: 0.123,
        priceToken: 'LRC'}
    ,{side: 'Buy',
        amount: {
            sell:{ belong:'ETH', tradeValue: 0.1 },
            buy:{ belong:'LRC', tradeValue: 123 }
        },
        time: Date.now(),
        fee: 0.02,
        priceValue: 0.123,
        priceToken: 'LRC'}
])});
export function* getPostsSaga() {
    try {
        //
        const { data } = yield call(getAmmTradesApi);
        const posts = data;
        yield put(getAmmTradesStatus(posts));
    } catch (err) {
        yield put(getAmmTradesStatus(err));
    }
}

export default function* ammTradesSaga() {
    yield all([takeLatest(getAmmTrades, getPostsSaga)]);
}
