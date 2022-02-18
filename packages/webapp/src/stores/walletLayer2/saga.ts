import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  getWalletLayer2Status,
  socketUpdateBalance,
  updateWalletLayer2,
} from "./reducer";
import { CoinKey, PairKey, WalletCoin } from "@loopring-web/common-resources";
import { LoopringAPI } from "api_wrapper";
import store from "../index";

type WalletLayer2Map<R extends { [key: string]: any }> = {
  [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>;
};
const NFTLimit = 20;

const getWalletLayer2Balance = async <R extends { [key: string]: any }>() => {
  const { accountId, apiKey, readyState, _accountIdNotActive } =
    store.getState().account;
  const { idIndex } = store.getState().tokenMap;
  let walletLayer2;
  if (apiKey && accountId && LoopringAPI.userAPI) {
    // @ts-ignore
    const { userBalances } = await LoopringAPI.userAPI.getUserBalances(
      { accountId: accountId, tokens: "" },
      apiKey
    );

    if (userBalances) {
      walletLayer2 = Reflect.ownKeys(userBalances).reduce((prev, item) => {
        // @ts-ignore
        return { ...prev, [idIndex[item]]: userBalances[Number(item)] };
      }, {} as WalletLayer2Map<R>);
    }
  } else if (
    !apiKey &&
    ["DEPOSITING", "NOT_ACTIVE", "LOCKED"].includes(readyState) &&
    ((_accountIdNotActive && _accountIdNotActive !== -1) ||
      (accountId && accountId !== -1))
  ) {
    // const {
    //   activeAccountValue: { chargeFeeList },
    // } = store.getState()._router_modalData;
    // let tokens = chargeFeeList
    //   .map((item) => `${tokenMap[item.belong ?? "ETH"].tokenId}`)
    //   .join(",");
    const { userBalances } =
      (await LoopringAPI?.globalAPI?.getUserBalanceForFee({
        accountId:
          _accountIdNotActive && _accountIdNotActive !== -1
            ? _accountIdNotActive
            : accountId,
        tokens: "",
        // tokens,
      })) ?? {};
    if (userBalances) {
      // @ts-ignore
      walletLayer2 = Reflect.ownKeys(userBalances).reduce((prev, item) => {
        return { ...prev, [idIndex[item]]: userBalances[Number(item)] };
      }, {} as WalletLayer2Map<R>);
    }
  }

  return { walletLayer2 };
};

export function* getPostsSaga() {
  try {
    //
    const { walletLayer2 } = yield call(getWalletLayer2Balance);
    yield put(getWalletLayer2Status({ walletLayer2 }));
  } catch (err) {
    yield put(getWalletLayer2Status(err));
  }
}

export function* walletLayer2Saga() {
  yield all([takeLatest(updateWalletLayer2, getPostsSaga)]);
}

export function* getSocketSaga({ payload }: any) {
  try {
    let { walletLayer2 } = store.getState().walletLayer2;
    walletLayer2 = { ...walletLayer2, ...payload };
    yield put(getWalletLayer2Status({ walletLayer2 }));
  } catch (err) {
    yield put(getWalletLayer2Status(err));
  }
}

export function* walletLayer2SocketSaga() {
  yield all([takeLatest(socketUpdateBalance, getSocketSaga)]);
}

export const walletLayer2Fork = [
  fork(walletLayer2Saga),
  fork(walletLayer2SocketSaga),
];
