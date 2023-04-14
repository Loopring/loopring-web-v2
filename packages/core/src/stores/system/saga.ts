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
import { getStakingMap } from "../invest/StakingMap/reducer";

import * as sdk from "@loopring-web/loopring-sdk";
import { getRedPacketConfigs } from "../redPacket/reducer";
import { AvaiableNetwork } from "@loopring-web/web3-provider";
import { getCexMap } from "../invest/CexMap/reducer";

const initConfig = function* <_R extends { [key: string]: any }>(
  _chainId: sdk.ChainId | "unknown"
) {
  const { chainId } = store.getState().system;
  const _tokenMap = JSON.parse(window.localStorage.getItem("tokenMap") ?? "{}")[
    chainId
  ];
  const _ammpools = JSON.parse(window.localStorage.getItem("ammpools") ?? "{}")[
    chainId
  ];
  const _markets = JSON.parse(window.localStorage.getItem("markets") ?? "{}")[
    chainId
  ];

  const _disableWithdrawTokenList = JSON.parse(
    window.localStorage.getItem("disableWithdrawTokenList") ?? "{}"
  )[chainId];
  let tokensMap,
    coinMap,
    totalCoinMap,
    idIndex,
    addressIndex,
    tokenListRaw,
    markets,
    ammpools,
    pairs,
    marketArr,
    tokenArr,
    disableWithdrawTokenList,
    ammpoolsRaw,
    disableWithdrawTokenListRaw,
    marketRaw;
  if (_tokenMap && _ammpools && _markets && _disableWithdrawTokenList) {
    myLog(
      "tokenConfig, ammpoolConfig, markets, disableWithdrawTokenList from local storge"
    );
    const resultTokenMap = sdk.makeMarket(_tokenMap);
    tokensMap = resultTokenMap.tokensMap;
    coinMap = resultTokenMap.coinMap;
    totalCoinMap = resultTokenMap.totalCoinMap;
    idIndex = resultTokenMap.idIndex;
    addressIndex = resultTokenMap.addressIndex;

    const resultMarket = sdk.makeMarkets(_markets);
    markets = resultMarket.markets;
    pairs = resultMarket.pairs;
    marketArr = resultMarket.marketArr;
    tokenArr = resultMarket.tokenArr;
    ammpools = sdk.makeAmmPool(_ammpools)?.ammpools;
    // const { markets, pairs, marketArr, tokenArr } = sdk.makeMarkets(_disableWithdrawTokenList);
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
        disableWithdrawTokenList: [..._disableWithdrawTokenList],
      })
    );
    store.dispatch(initAmmMap({ ammpools, chainId }));
    yield delay(1);
    store.dispatch(getTokenPrices(undefined));
    if (!Object.keys(store.getState().tokenPrices).length) {
      yield take("tokenPrices/getTokenPricesStatus");
    }
    store.dispatch(getTickers({ tickerKeys: marketArr }));
    store.dispatch(getAmmMap({ ammpools }));
    yield take("ammMap/getAmmMapStatus");
    store.dispatch(getAmmActivityMap({ ammpools }));
    myLog("getTokenPricesStatus update");

    Promise.all([
      LoopringAPI.exchangeAPI?.getTokens(),
      LoopringAPI.ammpoolAPI?.getAmmPoolConf(),
      LoopringAPI.exchangeAPI?.getMixMarkets(),
      LoopringAPI.exchangeAPI?.disableWithdrawTokenList() ?? {
        disableWithdrawTokenList: [],
        raw_data: undefined,
      },
    ]).then(
      ([
        {
          tokensMap,
          coinMap,
          totalCoinMap,
          idIndex,
          addressIndex,
          raw_data: tokenListRaw,
        },
        { ammpools, raw_data: ammpoolsRaw },
        { pairs, marketArr, tokenArr, markets, raw_data: marketRaw },
        { disableWithdrawTokenList, raw_data: disableWithdrawTokenListRaw },
      ]: any) => {
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
            tokenListRaw,
            disableWithdrawTokenListRaw,
            marketRaw,
          })
        );
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
            tokenListRaw,
            disableWithdrawTokenListRaw,
            marketRaw,
          })
        );
        // myLog(
        //   "tokenConfig, ammpoolConfig, markets, disableWithdrawTokenList update from server-side update"
        // );
        store.dispatch(getAmmMap({ ammpools, ammpoolsRaw, chainId }));
        store.dispatch(getAmmActivityMap({ ammpools }));
      }
    );
  } else {
    [
      {
        tokensMap,
        coinMap,
        totalCoinMap,
        idIndex,
        addressIndex,
        raw_data: tokenListRaw,
      },
      { ammpools, raw_data: ammpoolsRaw },
      { pairs, marketArr, tokenArr, markets, raw_data: marketRaw },
      { disableWithdrawTokenList, raw_data: disableWithdrawTokenListRaw },
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
    myLog(
      "tokenConfig, ammpoolConfig, markets, disableWithdrawTokenList update from server-side init"
    );
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
        tokenListRaw,
        disableWithdrawTokenListRaw,
        marketRaw,
      })
    );
    store.dispatch(initAmmMap({ ammpools, ammpoolsRaw, chainId }));
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
  }
  store.dispatch(getRedPacketConfigs(undefined));
  store.dispatch(getNotify(undefined));
  store.dispatch(getDefiMap(undefined));
  store.dispatch(getDualMap(undefined));
  store.dispatch(getStakingMap(undefined));
  store.dispatch(getCexMap(undefined));

  yield all([
    take("defiMap/getDefiMapStatus"),
    take("dualMap/getDualMapStatus"),
    take("stakingMap/getStakingMapStatus"),
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
  chainId: sdk.ChainId
): Promise<{
  gasPrice: number | undefined;
  forexMap: ForexMap<sdk.Currency>;
}> => {
  if (LoopringAPI.exchangeAPI) {
    let indexUSD = 0;
    const tokenId =
      chainId === sdk.ChainId.GOERLI
        ? "0xd4e71c4bb48850f5971ce40aa428b09f242d3e8a"
        : "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
    const promiseArray = Reflect.ownKeys(sdk.Currency).map((key, index) => {
      if (key.toString().toUpperCase() === sdk.Currency.usd.toUpperCase()) {
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
    const forexMap: ForexMap<sdk.Currency> = Reflect.ownKeys(
      sdk.Currency
    ).reduce<ForexMap<sdk.Currency>>((prev, key, index) => {
      if (restForexs[index] && key && restForexs[index].tokenPrices) {
        prev[key] = restForexs[index].tokenPrices[tokenId] / baseUsd;
      }
      return prev;
    }, {} as ForexMap<sdk.Currency>);

    return {
      gasPrice,
      forexMap,
    };
  }
  return {
    forexMap: {} as ForexMap<sdk.Currency>,
    gasPrice: undefined,
  };
};

const getSystemsApi = async <_R extends { [key: string]: any }>(
  chainId: any
) => {
  const extendsChain: string[] = (AvaiableNetwork ?? []).filter(
    (item) => ![1, 5].includes(Number(item))
  );

  const env =
    window.location.hostname === "localhost"
      ? ENV.DEV
      : sdk.ChainId.GOERLI === chainId
      ? ENV.UAT
      : ENV.PROD;
  chainId = AvaiableNetwork.includes(chainId.toString())
    ? chainId
    : NETWORKEXTEND.NONETWORK;
  // chainId =
  //   ChainId.GOERLI === chainId
  //     ? ChainId.GOERLI
  //     : ChainId.MAINNET === chainId
  //     ? ChainId.MAINNET
  //     : NETWORKEXTEND.NONETWORK;
  if (chainId === NETWORKEXTEND.NONETWORK) {
    throw new CustomError(ErrorMap.NO_NETWORK_ERROR);
  } else {
    LoopringAPI.InitApi(chainId as sdk.ChainId);

    if (LoopringAPI.exchangeAPI) {
      let baseURL, socketURL, etherscanBaseUrl;
      if (extendsChain.includes(chainId.toString())) {
        const { isTaikoTest } = store.getState().settings;
        baseURL = !isTaikoTest
          ? `https://${process.env.REACT_APP_API_URL}`
          : `https://${process.env.REACT_APP_API_URL_UAT}`;
        socketURL = !isTaikoTest
          ? `wss://ws.${process.env.REACT_APP_API_URL}/v3/ws`
          : `wss://ws.${process.env.REACT_APP_API_URL_UAT}/v3/ws`;
        etherscanBaseUrl = !isTaikoTest
          ? `https://etherscan.io/`
          : `https://goerli.etherscan.io/`;
      } else {
        baseURL =
          sdk.ChainId.MAINNET === chainId
            ? `https://${process.env.REACT_APP_API_URL}`
            : `https://${process.env.REACT_APP_API_URL_UAT}`;
        socketURL =
          sdk.ChainId.MAINNET === chainId
            ? `wss://ws.${process.env.REACT_APP_API_URL}/v3/ws`
            : `wss://ws.${process.env.REACT_APP_API_URL_UAT}/v3/ws`;
        etherscanBaseUrl =
          sdk.ChainId.MAINNET === chainId
            ? `https://etherscan.io/`
            : `https://goerli.etherscan.io/`;
      }

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
        sdk.ChainId.MAINNET !== chainId &&
        process.env.REACT_APP_GOERLI_NFT_FACTORY_COLLECTION
      ) {
        sdk.NFTFactory_Collection[sdk.ChainId.GOERLI] =
          process.env.REACT_APP_GOERLI_NFT_FACTORY_COLLECTION;
      }
      try {
        const _exchangeInfo = JSON.parse(
          window.localStorage.getItem("exchangeInfo") ?? "{}"
        );
        // const _allowTrade = JSON.parse(window.localStorage.getItem("allowTrade") ?? "{}")[
        //   chainId
        //   ];
        if (_exchangeInfo[chainId]) {
          myLog("exchangeInfo from localstorage");
          exchangeInfo = _exchangeInfo[chainId];
          // const { forexMap, gasPrice } = await should15MinutesUpdateDataGroup(chainId)
          [{ forexMap, gasPrice }, allowTrade] = await Promise.all([
            should15MinutesUpdateDataGroup(chainId),
            LoopringAPI.exchangeAPI.getAccountServices({}).then((result) => {
              return {
                ...result,
                legal: (result as any)?.raw_data?.legal ?? { enable: false },
              };
            }),
          ]);

          LoopringAPI.exchangeAPI
            .getExchangeInfo()
            .then(({ exchangeInfo }: any) => {
              window.localStorage.setItem(
                "exchangeInfo",
                JSON.stringify({
                  ..._exchangeInfo,
                  [exchangeInfo.chainId]: exchangeInfo,
                })
              );
              myLog("exchangeInfo from service");
            });
        } else {
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
          myLog("exchangeInfo from service because no localstorage ");
          window.localStorage.setItem(
            "exchangeInfo",
            JSON.stringify({
              ..._exchangeInfo,
              [exchangeInfo.chainId]: exchangeInfo,
            })
          );
        }
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
