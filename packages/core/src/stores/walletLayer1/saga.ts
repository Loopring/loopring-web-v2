import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getWalletLayer1Status, updateWalletLayer1 } from "./reducer";
import { CoinKey, PairKey, WalletCoin } from "@loopring-web/common-resources";
import { store, LoopringAPI } from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";

type WalletLayer1Map<R extends { [key: string]: any }> = {
  [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>;
};

const getWalletLayer1Balance = async <R extends { [key: string]: any }>() => {
  const { accAddress } = store.getState().account;
  const { tokenMap, addressIndex } = store.getState().tokenMap;
  if (tokenMap && LoopringAPI.exchangeAPI && accAddress) {
    const { ethBalance } = await LoopringAPI.exchangeAPI.getEthBalances({
      owner: accAddress,
    });
    const tokenArray2 = Reflect.ownKeys(tokenMap);
    const tokenArray1 = tokenArray2.splice(0, tokenArray2.length / 2);
    const [
      { tokenBalances: tokenBalances1 },
      { tokenBalances: tokenBalances2 },
    ] = await Promise.all([
      LoopringAPI.exchangeAPI.getTokenBalances({
        owner: accAddress,
        token: tokenArray1.map((ele) => tokenMap[ele as string].address), // marketCoins.join(),
      }),
      LoopringAPI.exchangeAPI.getTokenBalances({
        owner: accAddress,
        token: tokenArray2.map((ele) => tokenMap[ele as string].address), // marketCoins.join(),
      }),
    ]);
    var tokenBalances = new Map([...tokenBalances1, ...tokenBalances2]);

    tokenBalances.set(
      tokenMap["ETH"].address as unknown as sdk.TokenAddress,
      ethBalance
    );
    let walletLayer1;
    if (tokenBalances.size) {
      walletLayer1 = Array.from(tokenBalances.keys()).reduce((prev, item) => {
        return {
          ...prev,
          [addressIndex[item]]: {
            belong: addressIndex[item],
            count: sdk.fromWEI(
              tokenMap,
              addressIndex[item],
              tokenBalances.get(item)
            ),
          },
        };
      }, {} as WalletLayer1Map<R>);
    }
    return { walletLayer1 };
  } else {
    return { walletLayer1: {} };
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
