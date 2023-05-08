import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getCexMap, getCexMapStatus, updateCexSyncMap } from "./reducer";
import { CexMap, store } from "../../index";
import { LoopringAPI } from "../../../api_wrapper";
import { PayloadAction } from "@reduxjs/toolkit";

const getCexMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined;
  }
  const {
    markets: marketMap,
    tokenArr: marketCoins,
    marketArr: marketArray,
  } = await LoopringAPI.defiAPI?.getCefiMarkets();

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
    CexMap: {
      marketArray,
      marketCoins,
      marketMap,
    },
    __timer__,
  };
};

export function* getPostsSaga() {
  try {
    const { CexMap, __timer__ } = yield call(getCexMapApi);
    yield put(getCexMapStatus({ ...CexMap, __timer__ }));
  } catch (err) {
    yield put(getCexMapStatus(err));
  }
}

export function* getCexSyncSaga({
  payload,
}: PayloadAction<{ CexMap: CexMap }>) {
  try {
    if (payload.CexMap) {
      yield put(getCexMapStatus({ ...payload.CexMap }));
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
