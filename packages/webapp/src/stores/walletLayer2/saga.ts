import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  getWalletLayer2Status,
  socketUpdateBalance,
  updateWalletLayer2,
} from "./reducer";
import { CoinKey, PairKey, WalletCoin } from "@loopring-web/common-resources";
import { LoopringAPI } from "api_wrapper";
import store from "../index";
import { useModalData } from "../router";

type WalletLayer2Map<R extends { [key: string]: any }> = {
  [key in CoinKey<R> | PairKey<R>]?: WalletCoin<R>;
};

const getWalletLayer2Balance = async <R extends { [key: string]: any }>() => {
  const { accountId, apiKey, readyState, _accountIdNotActive } =
    store.getState().account;
  const { tokenMap, idIndex, marketCoins } = store.getState().tokenMap;
  let walletLayer2, userNFTBalances;
  if (apiKey && accountId && LoopringAPI.userAPI) {
    // @ts-ignore
    const { userBalances } = await LoopringAPI.userAPI.getUserBalances(
      { accountId: accountId, tokens: "" },
      apiKey
    );
    userNFTBalances = (
      await LoopringAPI.userAPI.getUserNFTBalances(
        { accountId: accountId },
        apiKey
      )
    ).userNFTBalances;
    if (userBalances) {
      walletLayer2 = Reflect.ownKeys(userBalances).reduce((prev, item) => {
        // @ts-ignore
        return { ...prev, [idIndex[item]]: userBalances[Number(item)] };
      }, {} as WalletLayer2Map<R>);
    }
  } else if (
    !apiKey &&
    _accountIdNotActive &&
    _accountIdNotActive != -1 &&
    ["DEPOSITING", "NOT_ACTIVE"].includes(readyState)
  ) {
    const {
      activeAccountValue: { chargeFeeList },
    } = store.getState()._router_modalData;
    // let tokens = chargeFeeList
    //   .map((item) => `${tokenMap[item.belong ?? "ETH"].tokenId}`)
    //   .join(",");
    const { userBalances } =
      (await LoopringAPI?.globalAPI?.getUserBalanceForFee({
        accountId: _accountIdNotActive,
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

  return { walletLayer2, nftLayer2: userNFTBalances ?? [] };
};

export function* getPostsSaga() {
  try {
    //
    const { walletLayer2, nftLayer2 } = yield call(getWalletLayer2Balance);
    yield put(getWalletLayer2Status({ walletLayer2, nftLayer2 }));
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

export function* walletLayerSocketSaga() {
  yield all([takeLatest(socketUpdateBalance, getSocketSaga)]);
}

export const walletLayer2Fork = [
  fork(walletLayer2Saga),
  fork(walletLayerSocketSaga),
];
