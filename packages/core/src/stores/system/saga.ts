import {
  all,
  call,
  fork,
  put,
  take,
  takeLatest,
  delay,
} from "redux-saga/effects";
import { getSystemStatus, updateRealTimeObj, updateSystem } from "./reducer";
import { ENV, NETWORKEXTEND } from "./interface";
import { store, LoopringSocket, LoopringAPI } from "../../index";
import {
  CustomError,
  ErrorMap,
  ForexMap,
  myLog,
} from "@loopring-web/common-resources";
import { statusUnset as accountStatusUnset } from "../account/reducer";
import { ChainId, Currency } from "@loopring-web/loopring-sdk";
import {
  getAmmMap,
  initAmmMap,
  updateRealTimeAmmMap,
} from "../Amm/AmmMap/reducer";
import { getTickers } from "../ticker/reducer";
import { getAmmActivityMap } from "../Amm/AmmActivityMap/reducer";
import { updateWalletLayer1 } from "../walletLayer1/reducer";
import { getTokenMap } from "../token/reducer";
import { getNotify } from "../notify/reducer";
import { getTokenPrices } from "../tokenPrices/reducer";
import { getDefiMap } from "../invest/DefiMap/reducer";
import { getInvestTokenTypeMap } from "../invest/InvestTokenTypeMap/reducer";
import { getDualMap } from "../invest/DualMap/reducer";
import * as sdk from "@loopring-web/loopring-sdk";

const initConfig = function* <_R extends { [key: string]: any }>(
  _chainId: ChainId | "unknown"
) {
  const [
    { tokensMap, coinMap, totalCoinMap, idIndex, addressIndex },
    { ammpools },
    { pairs, marketArr, tokenArr, markets },
    { disableWithdrawTokenList },
  ] = yield all([
    call(async () => LoopringAPI.exchangeAPI?.getTokens()),
    call(async () => LoopringAPI.ammpoolAPI?.getAmmPoolConf()),
    call(async () => LoopringAPI.exchangeAPI?.getMixMarkets()),
    call(async () => {
      try {
        return await LoopringAPI.exchangeAPI?.disableWithdrawTokenList();
      } catch (e: any) {
        return {
          disableWithdrawTokenList: [],
          raw_data: undefined,
        };
      }
    }),
  ]);
  store.dispatch(
    getTokenMap({
      tokensMap,
      coinMap,
      totalCoinMap,
      idIndex,
      addressIndex,
      marketMap: markets,
      pairs,
      marketArr,
      tokenArr,
      disableWithdrawTokenList,
    })
  );
  // store.dispatch(
  //   getTokenPricesStatus({ tokenPrices, __timer__, __rawConfig__ })
  // );
  store.dispatch(getNotify(undefined));
  store.dispatch(initAmmMap({ ammpools }));
  yield take("tokenMap/getTokenMapStatus");
  store.dispatch(getTokenPrices(undefined));
  yield take("tokenPrices/getTokenPricesStatus");
  store.dispatch(getTickers({ tickerKeys: marketArr }));
  store.dispatch(getAmmMap({ ammpools }));
  yield take("ammMap/getAmmMapStatus");
  store.dispatch(getAmmActivityMap({ ammpools }));
  if (store.getState().tokenMap.status === "ERROR") {
    throw "tokenMap Error";
  }
  store.dispatch(getDefiMap(undefined));
  store.dispatch(getDualMap(undefined));
  yield all([
    take("defiMap/getDefiMapStatus"),
    take("dualMap/getDualMapStatus"),
  ]);
  store.dispatch(getInvestTokenTypeMap(undefined));
  yield delay(5);
  const { account, walletLayer1 } = store.getState();
  if (account.accAddress && walletLayer1.walletLayer1 === undefined) {
    store.dispatch(updateWalletLayer1(undefined));
  }
  store.dispatch(accountStatusUnset(undefined));
};
const should15MinutesUpdateDataGroup = async (
  chainId: ChainId
): Promise<{
  gasPrice: number | undefined;
  forexMap: ForexMap<Currency>;
}> => {
  // myLog("loop get getFiatPrice getGasPrice");
  if (LoopringAPI.exchangeAPI) {
    let indexUSD = 0;
    const tokenId =
      chainId === ChainId.GOERLI
        ? "0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a"
        : "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const promiseArray = Reflect.ownKeys(Currency).map((key, index) => {
      if (key.toString().toUpperCase() === Currency.usd.toUpperCase()) {
        indexUSD = index;
      }

      return (
        LoopringAPI?.walletAPI?.getLatestTokenPrices({
          currency: key.toString().toUpperCase(),
          tokens: tokenId,
        }) ?? Promise.resolve({ tokenPrices: null })
      );
    });

    const [{ gasPrice }, ...restForexs] = await Promise.all([
      LoopringAPI.exchangeAPI.getGasPrice(),
      ...promiseArray,
    ]);
    const baseUsd = restForexs[indexUSD].tokenPrices[tokenId] ?? 1;
    const forexMap: ForexMap<Currency> = Reflect.ownKeys(Currency).reduce<
      ForexMap<Currency>
    >((prev, key, index) => {
      if (restForexs[index] && key && restForexs[index].tokenPrices) {
        prev[key] = restForexs[index].tokenPrices[tokenId] / baseUsd;
      }
      return prev;
    }, {} as ForexMap<Currency>);

    return {
      gasPrice,
      forexMap,
    };
  }
  return {
    forexMap: {} as ForexMap<Currency>,
    gasPrice: undefined,
  };
};

const getSystemsApi = async <_R extends { [key: string]: any }>(
  chainId: any
) => {
  const env =
    window.location.hostname === "localhost"
      ? ENV.DEV
      : ChainId.GOERLI === chainId
      ? ENV.UAT
      : ENV.PROD;
  chainId =
    ChainId.GOERLI === chainId
      ? ChainId.GOERLI
      : ChainId.MAINNET === chainId
      ? ChainId.MAINNET
      : NETWORKEXTEND.NONETWORK;

  if (chainId === NETWORKEXTEND.NONETWORK) {
    throw new CustomError(ErrorMap.NO_NETWORK_ERROR);
  } else {
    LoopringAPI.InitApi(chainId as ChainId);

    if (LoopringAPI.exchangeAPI) {
      const baseURL =
        ChainId.MAINNET === chainId
          ? `https://${process.env.REACT_APP_API_URL}`
          : `https://${process.env.REACT_APP_API_URL_UAT}`;
      const socketURL =
        ChainId.MAINNET === chainId
          ? `wss://ws.${process.env.REACT_APP_API_URL}/v3/ws`
          : `wss://ws.${process.env.REACT_APP_API_URL_UAT}/v3/ws`;
      const etherscanBaseUrl =
        ChainId.MAINNET === chainId
          ? `https://etherscan.io/`
          : `https://goerli.etherscan.io/`;
      LoopringAPI.userAPI?.setBaseUrl(baseURL);
      LoopringAPI.exchangeAPI?.setBaseUrl(baseURL);
      LoopringAPI.globalAPI?.setBaseUrl(baseURL);
      LoopringAPI.ammpoolAPI?.setBaseUrl(baseURL);
      LoopringAPI.walletAPI?.setBaseUrl(baseURL);
      LoopringAPI.wsAPI?.setBaseUrl(baseURL);
      LoopringAPI.nftAPI?.setBaseUrl(baseURL);
      LoopringAPI.delegate?.setBaseUrl(baseURL);
      LoopringAPI.defiAPI?.setBaseUrl(baseURL);
      let allowTrade, exchangeInfo, gasPrice, forexMap;
      if (
        /dev\.loopring\.io/.test(baseURL) &&
        ChainId.MAINNET !== chainId &&
        process.env.REACT_APP_GOERLI_NFT_FACTORY_COLLECTION
      ) {
        sdk.NFTFactory_Collection[ChainId.GOERLI] =
          process.env.REACT_APP_GOERLI_NFT_FACTORY_COLLECTION;
      }
      try {
        [{ exchangeInfo }, { forexMap, gasPrice }, allowTrade] =
          await Promise.all([
            LoopringAPI.exchangeAPI.getExchangeInfo(),
            should15MinutesUpdateDataGroup(chainId),
            LoopringAPI.exchangeAPI.getAccountServices({}).then((result) => {
              return {
                ...result,
                legal: (result as any)?.raw_data?.legal ?? { enable: false },
              };
            }),
          ]);
      } catch (e: any) {
        allowTrade = {
          defiInvest: { enable: false },
          register: { enable: false },
          order: { enable: false },
          joinAmm: { enable: false },
          dAppTrade: { enable: false },
          raw_data: { enable: false },
          legal: { enable: false },
        };
        throw new CustomError(ErrorMap.NO_SDK);
      }

      // @ts-ignore
      (window as any).loopringSocket = new LoopringSocket(socketURL);

      let { __timer__ } = store.getState().system;
      __timer__ = ((__timer__) => {
        if (__timer__ && __timer__ !== -1) {
          clearInterval(__timer__ as NodeJS.Timeout);
        }
        return setInterval(async () => {
          if (LoopringAPI.exchangeAPI) {
            const { forexMap, gasPrice } = await should15MinutesUpdateDataGroup(
              chainId
            );
            store.dispatch(updateRealTimeAmmMap(undefined));
            store.dispatch(updateRealTimeObj({ forexMap, gasPrice }));
          }
        }, 300000); //
      })(__timer__);
      return {
        allowTrade,
        chainId,
        etherscanBaseUrl,
        env,
        baseURL,
        socketURL,
        forexMap,
        gasPrice,
        exchangeInfo,
        __timer__,
      };
    }
  }
};

export function* getUpdateSystem({ payload }: any) {
  try {
    const { chainId } = payload;
    const {
      env,
      baseURL,
      allowTrade,
      fiatPrices,
      exchangeInfo,
      gasPrice,
      forexMap,
      etherscanBaseUrl,
      __timer__,
    } = yield call(getSystemsApi, chainId);

    yield put(
      getSystemStatus({
        env,
        baseURL,
        allowTrade,
        fiatPrices,
        gasPrice,
        forexMap,
        exchangeInfo,
        etherscanBaseUrl,
        __timer__,
      })
    );
    yield call(initConfig, chainId);
  } catch (err) {
    yield put(getSystemStatus(err));
  }
}

function* systemSaga() {
  yield all([takeLatest(updateSystem, getUpdateSystem)]);
}

export const systemForks = [fork(systemSaga)];
