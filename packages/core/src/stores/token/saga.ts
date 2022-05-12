import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getTokenMap, getTokenMapStatus } from "./reducer";
import { GetTokenMapParams } from "./interface";
import { PayloadAction } from "@reduxjs/toolkit";

const getTokenMapApi = async <R extends { [key: string]: any }>({
  tokensMap,
  coinMap,
  totalCoinMap,
  idIndex,
  addressIndex,
  pairs,
  marketArr,
  tokenArr,
  disableWithdrawTokenList,
}: GetTokenMapParams<R>) => {
  // let coinMap: CoinMap<any, CoinInfo<any>> = {};
  // let totalCoinMap: CoinMap<any, CoinInfo<any>> = {};
  let tokenMap: any = tokensMap;
  // let addressIndex: AddressMap = {};
  // let idIndex: IdMap = {};
  let disableWithdrawList: string[] = disableWithdrawTokenList
    ? disableWithdrawTokenList.map((item) => {
        return item.symbol;
      })
    : [];

  Reflect.ownKeys(tokensMap).forEach((key) => {
    // const coinInfo = {
    //   icon: getIcon(key as string, tokensMap),
    //   name: key as string,
    //   simpleName: key as string,
    //   description: "",
    //   company: "",
    // };
    // if (!(key as string).startsWith("LP-")) {
    //   coinMap[key as string] = coinInfo;
    // }
    // totalCoinMap[key as string] = coinInfo;

    if (pairs[key as string] && pairs[key as string].tokenList) {
      // @ts-ignore
      tokensMap[key].tradePairs = pairs[key as string].tokenList;
    }
    // addressIndex = {
    //   ...addressIndex,
    //   // @ts-ignore
    //   [tokensMap[key].address.toLowerCase()]: key as string,
    // };
    //
    // idIndex = {
    //   ...idIndex,
    //   // @ts-ignore
    //   [tokensMap[key].tokenId]: key as string,
    // };
  });
  return {
    data: {
      coinMap,
      totalCoinMap,
      addressIndex,
      idIndex,
      tokenMap,
      disableWithdrawList,
      marketArray: marketArr,
      marketCoins: tokenArr,
    },
  };
};

export function* getPostsSaga<R extends { [key: string]: any }>({
  payload,
}: PayloadAction<GetTokenMapParams<R>>) {
  try {
    const {
      tokensMap,
      coinMap,
      totalCoinMap,
      idIndex,
      addressIndex,
      marketMap,
      pairs,
      marketArr,
      tokenArr,
      disableWithdrawTokenList,
    } = payload;
    // @ts-ignore
    const { data } = yield call(getTokenMapApi, {
      tokensMap,
      coinMap,
      totalCoinMap,
      idIndex,
      addressIndex,
      pairs,
      marketArr,
      tokenArr,
      disableWithdrawTokenList,
    });

    yield put(getTokenMapStatus({ ...data, marketMap }));
  } catch (err) {
    yield put(getTokenMapStatus(err));
  }
}

export function* tokenInitSaga() {
  yield all([takeLatest(getTokenMap, getPostsSaga)]);
}

export const tokenSaga = [
  fork(tokenInitSaga),
  // fork(tokenPairsSaga),
];
