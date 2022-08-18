import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getDualMap, getDualMapStatus, updateDualSyncMap } from "./reducer";
import { DualMap, store } from "../../index";
import { LoopringAPI } from "../../../api_wrapper";
import { PayloadAction } from "@reduxjs/toolkit";

const getDualMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined;
  }
  // Todo:
  // const {
  //   markets: marketMap,
  //   tokenArr: marketCoins,
  //   marketArr: marketArray,
  // } = await LoopringAPI.defiAPI?.getDualMarkets();

  let { __timer__ } = store.getState().invest.dualMap;
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    return setInterval(async () => {
      if (!LoopringAPI.defiAPI) {
        return undefined;
      }

      // let { markets, pairs, tokenArr, tokenArrStr, marketArr, marketArrStr } =
      //   await LoopringAPI.defiAPI.getDualMarkets();
      store.dispatch(getDualMap(undefined));
    }, 900000); //15*60*1000 //900000
  })();

  return {
    dualMap: {
      marketArray: [],
      marketCoins: [],
      marketMap: {},
    },
    __timer__,
  };
};

export function* getPostsSaga() {
  try {
    const { dualMap, __timer__ } = yield call(getDualMapApi);
    yield put(getDualMapStatus({ ...dualMap, __timer__ }));
  } catch (err) {
    yield put(getDualMapStatus(err));
  }
}

export function* getDualSyncSaga({
  payload,
}: PayloadAction<{ dualMap: DualMap }>) {
  try {
    if (payload.dualMap) {
      yield put(getDualMapStatus({ dualMap: payload.dualMap }));
    }
  } catch (err) {
    yield put(getDualMapStatus(err));
  }
}

export function* dualMapInitSaga() {
  yield all([takeLatest(getDualMap, getPostsSaga)]);
}

export function* dualMapSyncSaga() {
  yield all([takeLatest(updateDualSyncMap, getPostsSaga)]);
}

export const dualMapFork = [fork(dualMapInitSaga), fork];
