import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  getBtradeMap,
  getBtradeMapStatus,
  updateBtradeSyncMap,
} from "./reducer";
import { BtradeMap, store } from "../../index";
import { LoopringAPI } from "../../../api_wrapper";
import { PayloadAction } from "@reduxjs/toolkit";
import * as sdk from "@loopring-web/loopring-sdk";
import { BTRDE_PRE } from "@loopring-web/common-resources";

const getBtradeMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined;
  }
  const { chainId } = store.getState().system;
  const btradeMapStorage = window.localStorage.getItem("btradeMarkets");

  // const { idIndex } = store.getState().tokenMap;
  const {
    // markets: marketMap,
    // pairs,
    // marketArr: marketArray,
    // tokenArr: marketCoins,
    raw_data,
  } = await LoopringAPI.defiAPI?.getBtradeMarkets();
  let localStorageData: any[] = [];
  const reformat: any[] = (raw_data as sdk.BTRADE_MARKET[]).reduce(
    (prev, ele) => {
      if (/-/gi.test(ele.market) && ele.enabled) {
        localStorageData.push({
          ...ele,
          btradeMarket: ele.market,
          market: ele.market.replace(BTRDE_PRE, ""),
          feeBips: undefined,
          minAmount: {
            base: undefined,
            quote: undefined,
          },
          btradeAmount: {
            base: undefined,
            quote: undefined,
          },
          l2Amount: {
            base: undefined,
            quote: undefined,
          },
        });
        return [
          ...prev,
          {
            ...ele,
            btradeMarket: ele.market,
            market: ele.market.replace(BTRDE_PRE, ""),
          } as sdk.BTRADE_MARKET,
        ];
      } else {
        return prev;
      }
    },
    [] as sdk.BTRADE_MARKET[]
  );
  localStorage.setItem(
    "btradeMarkets",
    JSON.stringify({
      ...(btradeMapStorage ? JSON.parse(btradeMapStorage) : {}),
      [chainId]: localStorageData,
    })
  );

  const {
    markets: marketMap,
    pairs,
    marketArr: marketArray,
    tokenArr: marketCoins,
  } = sdk.makeMarkets({ markets: reformat });

  const tradeMap = Reflect.ownKeys(pairs ?? {}).reduce((prev, key) => {
    const tradePairs = pairs[key as string]?.tokenList?.sort();
    prev[key] = {
      ...pairs[key as string],
      tradePairs,
    };
    return prev;
  }, {});

  // const resultTokenMap = sdk.makeMarket(_tokenMap);

  let { __timer__ } = store.getState().invest.btradeMap;
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    return setInterval(async () => {
      if (!LoopringAPI.defiAPI) {
        return undefined;
      }

      // let { markets, pairs, tokenArr, tokenArrStr, marketArr, marketArrStr } =
      //   await LoopringAPI.defiAPI.getDefiMarkets();
      store.dispatch(getBtradeMap(undefined));
    }, 900000); //15*60*1000 //900000
  })();

  return {
    btradeMap: {
      marketArray,
      marketCoins,
      marketMap,
      tradeMap,
    },
    __timer__,
  };
};

export function* getPostsSaga() {
  try {
    const { btradeMap, __timer__ } = yield call(getBtradeMapApi);
    yield put(getBtradeMapStatus({ ...btradeMap, __timer__ }));
  } catch (err) {
    yield put(getBtradeMapStatus(err));
  }
}

export function* getBtradeSyncSaga({
  payload,
}: PayloadAction<{ btradeMap: BtradeMap }>) {
  try {
    if (payload.btradeMap) {
      yield put(getBtradeMapStatus({ ...payload.btradeMap }));
    }
  } catch (err) {
    yield put(getBtradeMapStatus(err));
  }
}

export function* BtradeMapInitSaga() {
  yield all([takeLatest(getBtradeMap, getPostsSaga)]);
}

export function* BtradeMapSyncSaga() {
  yield all([takeLatest(updateBtradeSyncMap, getBtradeSyncSaga)]);
}

export const btradeMapFork = [fork(BtradeMapInitSaga), fork(BtradeMapSyncSaga)];
