import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getTokenPrices, getTokenPricesStatus } from "./reducer";
import { LoopringAPI } from "api_wrapper";
import store from "../index";
import { PayloadAction } from "@reduxjs/toolkit";
import { myLog } from "@loopring-web/common-resources";

const getTokenPricesApi = async <R extends { [key: string]: any }>() => {
  const { addressIndex } = store.getState().tokenMap;
  if (LoopringAPI?.walletAPI && addressIndex) {
    myLog("loop get getLatestTokenPrices");
    const { tokenPrices: _tokenPrices, raw_data } =
      await LoopringAPI?.walletAPI.getLatestTokenPrices();
    let { __timer__ } = store.getState().tokenPrices;
    const tokenPrices: { [key in keyof R]: number } = Reflect.ownKeys(
      _tokenPrices
    ).reduce((prev, address) => {
      const symbol = addressIndex[address.toString().toLowerCase()];
      return { ...prev, [symbol]: _tokenPrices[address as keyof R] };
    }, {} as { [key in keyof R]: number });
    __timer__ = (() => {
      if (__timer__ && __timer__ !== -1) {
        clearInterval(__timer__);
      }
      return setInterval(() => {
        store.dispatch(getTokenPrices({}));
      }, 900000); //15*60*1000 //900000
    })();
    return { tokenPrices, __timer__, __rawConfig__: raw_data };
  }
};

export function* getPostsSaga({ payload }: PayloadAction<undefined>) {
  try {
    const { tokenPrices, __timer__, __rawConfig__ } = yield call(
      getTokenPricesApi
    );
    yield put(getTokenPricesStatus({ tokenPrices, __timer__, __rawConfig__ }));
  } catch (err) {
    yield put(getTokenPricesStatus(err));
  }
}

export function* tokenPricesInitSaga() {
  yield all([takeLatest(getTokenPrices, getPostsSaga)]);
}

export const tokenPricesSaga = [fork(tokenPricesInitSaga)];
