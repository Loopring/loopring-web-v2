import { all, call, fork, put, take, takeLatest } from "redux-saga/effects"
import { getSystemStatus, updateRealTimeObj, updateSystem } from './reducer'
import { ENV, NETWORKEXTEND } from "./interface"
import store from '../index';
import { LoopringAPI } from 'api_wrapper';
import { getAmmMap, initAmmMap, updateRealTimeAmmMap } from '../Amm/AmmMap';
import { getTokenMap } from '../token';
import { CustomError, ErrorMap, myLog } from '@loopring-web/common-resources';
import { getAmmActivityMap } from '../Amm/AmmActivityMap';
import { updateWalletLayer1 } from '../walletLayer1';
import { delay } from 'rxjs/operators';
import { LoopringSocket } from 'services/socket';
import { statusUnset as accountStatusUnset } from '../account';
import { ChainId, FiatPriceInfo, LoopringMap } from '@loopring-web/loopring-sdk';
import { getTokenPrices } from '../tokenPrices';
import { getTickers, } from '../ticker';


const initConfig = function* <R extends { [ key: string ]: any }>(chainId: ChainId | 'unknown') {
    const[{tokenSymbolMap: tokensMap},{ammpools},{pairs, marketArr, tokenArr, markets} ] = yield all([
        call(async ()=> LoopringAPI.exchangeAPI?.getTokens()),
        call(async ()=> LoopringAPI.ammpoolAPI?.getAmmPoolConf()),
        call(async ()=> LoopringAPI.exchangeAPI?.getMixMarkets())])
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
    fiatPrices: LoopringMap<FiatPriceInfo> | undefined,
    fiatPricesY: LoopringMap<FiatPriceInfo> | undefined,
    gasPrice: number | undefined,
    forex: number | undefined,
}> => {
    if (LoopringAPI.exchangeAPI && LoopringAPI.walletAPI) {
        const [fiatPrices,fiatPricesY, gasPrice]:[
            LoopringMap<FiatPriceInfo>,
            LoopringMap<FiatPriceInfo>,
            number,
        ] = await  Promise.all(
            [LoopringAPI.exchangeAPI.getFiatPrice({legal: 'USD'}),
            LoopringAPI.exchangeAPI.getFiatPrice({legal: 'CNY'}),
                LoopringAPI.exchangeAPI.getGasPrice(),
            ]
        )
            .then((results)=>{
            return [results[0].fiatPrices,results[1].fiatPrices,results[2].gasPrice / 1e+9]
        })
        
        // const  = (await ).fiatPrices
        // const  = (await ).fiatPrices
        // const tokenPrices = (await LoopringAPI.walletAPI.getLatestTokenPrices()).tokenPrices;
        // const tokenPrices = Reflect.ownKeys(result).reduce((prev, address) => {
        //     const symbol = addressIndex[ address as string ].replace('LP', 'AMM');
        //     return {...prev, [ symbol ]: result[ address ]}
        // }, {})

        // const gasPrice = (await LoopringAPI.exchangeAPI.getGasPrice()).gasPrice / 1e+9;
        const forex = fiatPricesY[ 'USDT' ].price;
        return {
            fiatPrices,
            fiatPricesY,
            gasPrice,
            forex,
            // allowTrade,
        }
    }
    return {
        fiatPrices: undefined,
        fiatPricesY: undefined,
        // tokenPrices:undefined,
        gasPrice: undefined,
        forex: undefined,
        // allowTrade,
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



            const baseURL = ChainId.MAINNET === chainId ? `https://${process.env.REACT_APP_API_URL}` : `https:/${process.env.REACT_APP_API_URL_UAT}`
            const socketURL = ChainId.MAINNET === chainId ? `wss://ws.${process.env.REACT_APP_API_URL}/v3/ws` : `wss://ws.${process.env.REACT_APP_API_URL_UAT}/v3/ws`;
            const etherscanBaseUrl = ChainId.MAINNET === chainId ? `https://etherscan.io/` : `https://goerli.etherscan.io/`
            let allowTrade;let exchangeInfo; let fiatPrices, fiatPricesY, gasPrice, forex;
            try{
                 [{exchangeInfo}, {fiatPrices, fiatPricesY, gasPrice, forex}, allowTrade]= await Promise.all(
                    [LoopringAPI.exchangeAPI.getExchangeInfo(),
                        should15MinutesUpdateDataGroup(),
                        LoopringAPI.exchangeAPI.getAccountServices({})])
               // const = (await )
               // const = await ;
               //   = await LoopringAPI.exchangeAPI.getAccountServices({});

            } catch {
                allowTrade =  {register: {enable:false},
                order: {enable:false},
                joinAmm: {enable:false},
                dAppTrade: {enable:false},
                raw_data: {enable:false},}
            }

            window.loopringSocket = new LoopringSocket(socketURL);

            let {__timer__} = store.getState().system;
            __timer__ = ((__timer__) => {
                if (__timer__ && __timer__ !== -1) {
                    clearInterval(__timer__);
                }
                return setInterval(async () => {
                    if (LoopringAPI.exchangeAPI) {
                        // const fiatPrices = (await LoopringAPI.exchangeAPI.getFiatPrice({legal: 'CNY'})).fiatPrices
                        // const fiatPrices = (await LoopringAPI.exchangeAPI.getFiatPrice({legal:  Currency.usd})).fiatPrices
                        // const fiatPricesY = (await LoopringAPI.exchangeAPI.getFiatPrice({legal: 'CNY'})).fiatPrices
                        // const tokenPrices =  (await LoopringAPI.walletAPI.getLatestTokenPrices()).tokenPrices;
                        // const gasPrice = (await LoopringAPI.exchangeAPI.getGasPrice()).gasPrice / 1e+9
                        // const forex = fiatPricesY[ 'USDT' ]?.price
                        const {fiatPrices, gasPrice, forex} = await should15MinutesUpdateDataGroup();
                        store.dispatch(updateRealTimeAmmMap(undefined))
                        store.dispatch(updateRealTimeObj({fiatPrices, gasPrice, forex}))
                    }
                }, 300000)   //

            })(__timer__);
            return {
                allowTrade,
                chainId,
                etherscanBaseUrl,
                env,
                baseURL,
                socketURL,
                fiatPrices,
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
            allowTrade,
            fiatPrices,
            gasPrice,
            forex,
            exchangeInfo,
            etherscanBaseUrl,
            __timer__
        } = yield call(getSystemsApi, chainId);

        yield put(getSystemStatus({env, baseURL, allowTrade,fiatPrices, gasPrice, forex, exchangeInfo, etherscanBaseUrl, __timer__}));
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
