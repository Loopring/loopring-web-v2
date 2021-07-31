import { all, call, fork, put, take, takeLatest } from "redux-saga/effects"
import { getSystemStatus, updateRealTimeObj, updateSystem } from './reducer'
import { ENV, NETWORKEXTEND } from "./interface"
import store from '../index';
// import { reset } from '../account/reducer';
import { ChainId } from 'loopring-sdk';
import { exchangeAPI, LoopringAPI } from '../apis/api';
import { getAmmMap, updateRealTimeAmmMap } from '../Amm/AmmMap';
import { getTokenMap } from '../token';
import { CustomError, ErrorMap } from '@loopring-web/common-resources';
import { getAmmActivityMap } from '../Amm/AmmActivityMap';
import { updateWalletLayer1 } from '../walletLayer1';
import { delay } from 'rxjs/operators';
import { LoopringSocket } from '../../services/socketUtil';
import { updateAccountStatus } from '../account/reducer';
import { AccountStatus } from '../account/interface';


const initConfig = function* <R extends { [ key: string ]: any }>(chainId: ChainId | 'unknown') {
    // store.dispatch(updateAccountStatus());
    const {tokenSymbolMap: tokensMap} = yield call(async () => await LoopringAPI.exchangeAPI?.getTokens())
    const {ammpools} = yield call(async () => await LoopringAPI.ammpoolAPI?.getAmmPoolConf());
    const {pairs, marketArr, tokenArr, markets} = yield call(async () => LoopringAPI.exchangeAPI?.getMixMarkets());
    store.dispatch(getTokenMap({tokensMap, marketMap: markets, pairs, marketArr, tokenArr}))
    yield take('tokenMap/getTokenMapStatus');
    // let basePath: string = `wss://ws.${baseURL}/v3/ws?wsApiKey=${wsKey}`
    store.dispatch(getAmmMap({ammpools}))
    store.dispatch(getAmmActivityMap({ammpools}))
    if (store.getState().tokenMap.status === 'ERROR') {

    }
    yield delay(10);
    //IF already connect has address, getInfo walletLayer 1
    const {account, walletLayer1} = store.getState() //.account.accAddr && !store.getState().walletLayer1.walletLayer1
    if (account.accAddress && walletLayer1.walletLayer1 === undefined) {
        store.dispatch(updateWalletLayer1(undefined));
    }

}

const getSystemsApi = async <R extends { [ key: string ]: any }>(chainId: any) => {
    //TODO get some other reuqired id...... put into system
    // const { chainId } = system
    const env = window.location.hostname === 'localhost' ? ENV.DEV : ChainId.GORLI === chainId ? ENV.UAT : ENV.PROD
    chainId = ChainId.GORLI === chainId ? ChainId.GORLI : ChainId.MAINNET === chainId ? ChainId.MAINNET : NETWORKEXTEND.NONETWORK

    if (chainId === NETWORKEXTEND.NONETWORK) {
        throw new CustomError(ErrorMap.NO_NETWORK_ERROR)
    } else {
        LoopringAPI.InitApi(chainId as ChainId);
        if (LoopringAPI.exchangeAPI) {
            const {exchangeInfo} = (await LoopringAPI.exchangeAPI.getExchangeInfo())
            const faitPrices = (await LoopringAPI.exchangeAPI.getFiatPrice({legal: 'USD'})).fiatPrices
            const faitPricesY = (await LoopringAPI.exchangeAPI.getFiatPrice({legal: 'CNY'})).fiatPrices
            const gasPrice = (await exchangeAPI().getGasPrice()).gasPrice / 1e+9;
            // : process.env.REACT_APP_API_URL_UAT;
            const baseURL = ChainId.MAINNET === chainId ? `https://${process.env.REACT_APP_API_URL}` : `https:/${process.env.REACT_APP_API_URL_UAT}`
            const socketURL = ChainId.MAINNET === chainId ? `wss://ws.${process.env.REACT_APP_API_URL}/v3/ws` : `wss://ws.${process.env.REACT_APP_API_URL_UAT}/v3/ws`;
            const etherscanUrl = ChainId.MAINNET === chainId ? `https://etherscan.io/address/` : `https://goerli.etherscan.io/address/`

            window.loopringSocket = new LoopringSocket(socketURL);

            const forex = faitPricesY[ 'USDT' ].price;
            let {__timer__} = store.getState().system;
            __timer__ = ((__timer__) => {
                if (__timer__ && __timer__ !== -1) {
                    clearInterval(__timer__);
                }
                return setInterval(async () => {
                    const faitPrices = (await exchangeAPI().getFiatPrice({legal: 'CNY'})).fiatPrices
                    const gasPrice = (await exchangeAPI().getGasPrice()).gasPrice / 1e+9
                    const forex = faitPrices[ 'USDT' ]?.price
                    store.dispatch(updateRealTimeAmmMap(undefined))
                    store.dispatch(updateRealTimeObj({faitPrices, gasPrice, forex}))
                }, 300000)   //

            })(__timer__);
            return {
                chainId,
                etherscanUrl,
                env,
                baseURL,
                socketURL,
                faitPrices,
                gasPrice,
                forex,
                exchangeInfo,
                __timer__
            }
        }
    }
}

export function* getUpdateSystem({payload}: any) {
    try {
        // @ts-ignore
        const {chainId} = payload;
        const {env, baseURL, faitPrices, gasPrice, forex, exchangeInfo,etherscanUrl, __timer__} = yield call(getSystemsApi, chainId);

        yield put(getSystemStatus({env, baseURL, faitPrices, gasPrice, forex, exchangeInfo, etherscanUrl,__timer__}));
        yield call(initConfig, chainId)
        //TODO check wallect store
    } catch (err) {
        yield put(getSystemStatus(err));
    }
}

function* systemSaga() {
    yield all([takeLatest(updateSystem, getUpdateSystem)]);
}

export const systemForks = [
    fork(systemSaga),
]
