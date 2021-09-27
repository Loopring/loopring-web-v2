import { all, call, fork, put, take, takeLatest } from "redux-saga/effects"
import { getSystemStatus, updateRealTimeObj, updateSystem } from './reducer'
import { ENV, NETWORKEXTEND } from "./interface"
import store from '../index';
// import { reset } from '../account/reducer';
import { LoopringAPI } from 'api_wrapper';
import { getAmmMap, initAmmMap, updateRealTimeAmmMap } from '../Amm/AmmMap';
import { getTokenMap } from '../token';
import { CustomError, ErrorMap, myLog } from '@loopring-web/common-resources';
import { getAmmActivityMap } from '../Amm/AmmActivityMap';
import { updateWalletLayer1 } from '../walletLayer1';
import { delay } from 'rxjs/operators';
import { LoopringSocket } from 'services/socket';
import { statusUnset as accountStatusUnset } from '../account';
import { ChainId, Currency, FiatPriceInfo, LoopringMap } from 'loopring-sdk';
import { getTokenPrices } from '../tokenPrices';
import { getTickers, useTicker } from '../ticker';

const initConfig = function* <R extends { [ key: string ]: any }>(chainId: ChainId | 'unknown') {
    // store.dispatch(updateAccountStatus());
    const {tokenSymbolMap: tokensMap} = yield call(async () => await LoopringAPI.exchangeAPI?.getTokens())
    const {ammpools} = yield call(async () => await LoopringAPI.ammpoolAPI?.getAmmPoolConf());
    const {pairs, marketArr, tokenArr, markets} = yield call(async () => LoopringAPI.exchangeAPI?.getMixMarkets());
    // const

    //


    store.dispatch(getTokenMap({tokensMap, marketMap: markets, pairs, marketArr, tokenArr}))
    store.dispatch(initAmmMap({ammpools}))
    yield take('tokenMap/getTokenMapStatus');
    store.dispatch(getTokenPrices(undefined));
    yield take('tokenPrices/getTokenPricesStatus');
    store.dispatch(getTickers({tickerKeys:marketArr}))
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
    store.dispatch(accountStatusUnset(undefined));
}
const should15MinutesUpdateDataGroup = async (): Promise<{
    faitPrices: LoopringMap<FiatPriceInfo> | undefined,
    faitPricesY: LoopringMap<FiatPriceInfo> | undefined,
    gasPrice: number | undefined,
    forex: number | undefined,
}> => {
    if (LoopringAPI.exchangeAPI && LoopringAPI.walletAPI) {
        const faitPrices = (await LoopringAPI.exchangeAPI.getFiatPrice({legal:  Currency.usd})).fiatPrices
        const faitPricesY = (await LoopringAPI.exchangeAPI.getFiatPrice({legal: 'CNY'})).fiatPrices
        // const tokenPrices = (await LoopringAPI.walletAPI.getLatestTokenPrices()).tokenPrices;
        // const tokenPrices = Reflect.ownKeys(result).reduce((prev, address) => {
        //     const symbol = addressIndex[ address as string ].replace('LP', 'AMM');
        //     return {...prev, [ symbol ]: result[ address ]}
        // }, {})

        const gasPrice = (await LoopringAPI.exchangeAPI.getGasPrice()).gasPrice / 1e+9;
        const forex = faitPricesY[ 'USDT' ].price;
        return {
            faitPrices,
            faitPricesY,
            gasPrice,
            forex,
        }
    }
    return {
        faitPrices: undefined,
        faitPricesY: undefined,
        // tokenPrices:undefined,
        gasPrice: undefined,
        forex: undefined,
    }
}

const getSystemsApi = async <R extends { [ key: string ]: any }>(chainId: any) => {
    //TODO get some other reuqired id...... put into system
    // const { chainId } = system
    const env = window.location.hostname === 'localhost' ? ENV.DEV : ChainId.GOERLI === chainId ? ENV.UAT : ENV.PROD
    chainId = ChainId.GOERLI === chainId ? ChainId.GOERLI : ChainId.MAINNET === chainId ? ChainId.MAINNET : NETWORKEXTEND.NONETWORK

    if (chainId === NETWORKEXTEND.NONETWORK) {
        throw new CustomError(ErrorMap.NO_NETWORK_ERROR)
    } else {
        LoopringAPI.InitApi(chainId as ChainId);
        if (LoopringAPI.exchangeAPI) {

            const {exchangeInfo} = (await LoopringAPI.exchangeAPI.getExchangeInfo())
            const {faitPrices, faitPricesY, gasPrice, forex,} = await should15MinutesUpdateDataGroup();
            // : process.env.REACT_APP_API_URL_UAT;
            const baseURL = ChainId.MAINNET === chainId ? `https://${process.env.REACT_APP_API_URL}` : `https:/${process.env.REACT_APP_API_URL_UAT}`
            const socketURL = ChainId.MAINNET === chainId ? `wss://ws.${process.env.REACT_APP_API_URL}/v3/ws` : `wss://ws.${process.env.REACT_APP_API_URL_UAT}/v3/ws`;
            const etherscanBaseUrl = ChainId.MAINNET === chainId ? `https://etherscan.io/` : `https://goerli.etherscan.io/`

            window.loopringSocket = new LoopringSocket(socketURL);

            let {__timer__} = store.getState().system;
            __timer__ = ((__timer__) => {
                if (__timer__ && __timer__ !== -1) {
                    clearInterval(__timer__);
                }
                return setInterval(async () => {
                    if (LoopringAPI.exchangeAPI) {
                        // const faitPrices = (await LoopringAPI.exchangeAPI.getFiatPrice({legal: 'CNY'})).fiatPrices
                        // const faitPrices = (await LoopringAPI.exchangeAPI.getFiatPrice({legal:  Currency.usd})).fiatPrices
                        // const faitPricesY = (await LoopringAPI.exchangeAPI.getFiatPrice({legal: 'CNY'})).fiatPrices
                        // const tokenPrices =  (await LoopringAPI.walletAPI.getLatestTokenPrices()).tokenPrices;
                        // const gasPrice = (await LoopringAPI.exchangeAPI.getGasPrice()).gasPrice / 1e+9
                        // const forex = faitPricesY[ 'USDT' ]?.price
                        const {faitPrices, gasPrice, forex} = await should15MinutesUpdateDataGroup();
                        store.dispatch(updateRealTimeAmmMap(undefined))
                        store.dispatch(updateRealTimeObj({faitPrices, gasPrice, forex}))
                    }
                }, 300000)   //

            })(__timer__);
            return {
                chainId,
                etherscanBaseUrl,
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
        const {
            env,
            baseURL,
            faitPrices,
            gasPrice,
            forex,
            exchangeInfo,
            etherscanBaseUrl,
            __timer__
        } = yield call(getSystemsApi, chainId);

        yield put(getSystemStatus({env, baseURL, faitPrices, gasPrice, forex, exchangeInfo, etherscanBaseUrl, __timer__}));
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
