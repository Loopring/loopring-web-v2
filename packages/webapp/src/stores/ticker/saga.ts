import { all, call, fork, put, takeLatest } from "redux-saga/effects"
import { getTicker, getTickers, getTickerStatus } from './reducer'
import { CoinKey, CustomError, ErrorMap, PairKey, TradeFloat } from '@loopring-web/common-resources'


import { LoopringAPI } from "api_wrapper"
import { makeTickerMap } from '../../hooks/help';


type TickerMap<R extends { [ key: string ]: any }> = {
    [key in CoinKey<R> | PairKey<R>]?: TradeFloat & {
    reward?: number, rewardToken?: string
}

}


const getTickersApi = async <R extends { [ key: string ]: any }>(list: Array<keyof R>) => {

    if (!LoopringAPI.exchangeAPI) {
        return undefined
    }

    const tickers = await LoopringAPI.exchangeAPI.getMixTicker({market: list.join(',')})
    const data = makeTickerMap({tickerMap: tickers.tickMap})
    return {data}
}

export function* getPostsSaga({payload}: any) {
    try {
        // @ts-ignore
        const {tickerKey, tickerKeys} = payload;
        if (tickerKey || (tickerKeys && tickerKeys.length)) {
            const {data} = yield call(getTickersApi, tickerKey ? [tickerKey] : tickerKeys);
            yield put(getTickerStatus({tickerMap: data}));

        } else {
            throw new CustomError(ErrorMap.NO_TOKEN_KEY_LIST);
        }
    } catch (err) {
        yield put(getTickerStatus(err));
    }
}

function* tickerSaga() {
    yield all([takeLatest(getTicker, getPostsSaga)]);
}

function* tickersSaga() {
    yield all([takeLatest(getTickers, getPostsSaga)]);
}

export const tickerForks = [
    fork(tickerSaga),
    fork(tickersSaga),
]
 