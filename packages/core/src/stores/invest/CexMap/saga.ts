import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getCexMap, getCexMapStatus, updateCexSyncMap } from "./reducer";
import { CexMap, store } from "../../index";
import { LoopringAPI } from "../../../api_wrapper";
import { PayloadAction } from "@reduxjs/toolkit";
import * as sdk from "@loopring-web/loopring-sdk";

const getCexMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined;
  }
  // const { idIndex } = store.getState().tokenMap;
  const {
    // markets: marketMap,
    // pairs,
    // marketArr: marketArray,
    // tokenArr: marketCoins,
    raw_data,
  } = await LoopringAPI.defiAPI?.getCefiMarkets();
  const reformat: any = (raw_data as sdk.CEX_MARKET[]).reduce((prev, ele) => {
    if (/-/gi.test(ele.market)) {
      return [
        ...prev,
        {
          ...ele,
          cexMarket: ele.market,
          market: ele.market.replace("CEFI-", ""),
        } as sdk.CEX_MARKET,
      ];
    } else {
      return prev;
    }
  }, [] as sdk.CEX_MARKET[]);
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

  let { __timer__ } = store.getState().invest.cexMap;
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
      store.dispatch(getCexMap(undefined));
    }, 900000); //15*60*1000 //900000
  })();

  return {
    cexMap: {
      marketArray,
      marketCoins,
      marketMap,
      tradeMap,
    },
    __timer__,
  };
};;

export function* getPostsSaga() {
  try {
    const { cexMap, __timer__ } = yield call(getCexMapApi);
    yield put(getCexMapStatus({ ...cexMap, __timer__ }));
  } catch (err) {
    yield put(getCexMapStatus(err));
  }
}
export function* getCexSyncSaga({
  payload,
}: PayloadAction<{ cexMap: CexMap }>) {
  try {
    if (payload.cexMap) {
      yield put(getCexMapStatus({ ...payload.cexMap }));
    }
  } catch (err) {
    yield put(getCexMapStatus(err));
  }
}

export function* CexMapInitSaga() {
  yield all([takeLatest(getCexMap, getPostsSaga)]);
}
export function* CexMapSyncSaga() {
  yield all([takeLatest(updateCexSyncMap, getCexSyncSaga)]);
}

export const cexMapFork = [fork(CexMapInitSaga), fork(CexMapSyncSaga)];
