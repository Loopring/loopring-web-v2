import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  getWalletLayer2NFTStatus,
  socketUpdateBalance,
  updateWalletLayer2NFT,
} from "./reducer";
import { LoopringAPI } from "api_wrapper";
import store from "../index";

export const NFTLimit = 24;

const getWalletLayer2NFTBalance = async <R extends { [key: string]: any }>({
  offset,
}: {
  offset: number;
}) => {
  const { accountId, apiKey } = store.getState().account;
  if (apiKey && accountId && LoopringAPI.userAPI) {
    let { userNFTBalances, totalNum } =
      await LoopringAPI.userAPI.getUserNFTBalances(
        { accountId: accountId, limit: NFTLimit, offset },
        apiKey
      );
    return {
      walletLayer2NFT: userNFTBalances ?? [],
      total: totalNum,
    };
  }
  return {};
};

export function* getPostsSaga({ payload: { page = 1 } }: any) {
  try {
    const offset = (page - 1) * NFTLimit;
    // @ts-ignore
    const walletLayer2NFT: any = yield call(getWalletLayer2NFTBalance, {
      offset,
    });
    yield put(getWalletLayer2NFTStatus({ ...walletLayer2NFT }));
  } catch (err) {
    yield put(getWalletLayer2NFTStatus(err));
  }
}

export function* walletLayer2NFTSaga() {
  yield all([takeLatest(updateWalletLayer2NFT, getPostsSaga)]);
}

export function* getSocketSaga(payload: any) {
  try {
    // let { walletLayer2NFT } = store.getState().walletLayer2NFT;
    // walletLayer2NFT = {  };
    yield put(getWalletLayer2NFTStatus({ ...payload }));
  } catch (err) {
    yield put(getWalletLayer2NFTStatus(err));
  }
}

export const walletLayer2NFTFork = [fork(walletLayer2NFTSaga)];
