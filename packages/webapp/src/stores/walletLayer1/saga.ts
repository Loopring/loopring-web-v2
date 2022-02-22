import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getWalletLayer1Status, updateWalletLayer1 } from "./reducer";
import { CoinKey, PairKey, WalletCoin } from "@loopring-web/common-resources";
import { LoopringAPI } from "api_wrapper";
import store from "../index";
import { fromWEI } from "@loopring-web/loopring-sdk";

type WalletLayer1Map<R extends { [key: string]: any }> = {
  [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>;
};

const getWalletLayer1Balance = async <R extends { [key: string]: any }>() => {
  const { accAddress } = store.getState().account;
  const { tokenMap, marketCoins } = store.getState().tokenMap;
  if (marketCoins && tokenMap && LoopringAPI.exchangeAPI) {
    const { ethBalance } = await LoopringAPI.exchangeAPI.getEthBalances({
      owner: accAddress,
    });
    const { tokenBalances } = await LoopringAPI.exchangeAPI.getTokenBalances(
      {
        owner: accAddress,
        token: marketCoins.join(),
      },
      tokenMap
    );
    tokenBalances["ETH"] = ethBalance;
    let walletLayer1;
    if (tokenBalances) {
      walletLayer1 = Reflect.ownKeys(tokenBalances).reduce((prev, item) => {
        return {
          ...prev,
          [item]: {
            belong: item,
            count: fromWEI(tokenMap, item, tokenBalances[item as string]),
          },
        };
      }, {} as WalletLayer1Map<R>);
    }
    return { walletLayer1 };
  }
};

export function* getPostsSaga() {
  try {
    //
    const { walletLayer1 } = yield call(getWalletLayer1Balance);
    yield put(getWalletLayer1Status({ walletLayer1 }));
  } catch (err) {
    yield put(getWalletLayer1Status(err));
  }
}

export function* walletLayer1Saga() {
  yield all([takeLatest(updateWalletLayer1, getPostsSaga)]);
}

export const walletLayer1Fork = [
  fork(walletLayer1Saga),
  // fork(tokenPairsSaga),
];
