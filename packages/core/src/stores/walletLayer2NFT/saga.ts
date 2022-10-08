import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getWalletLayer2NFTStatus, updateWalletLayer2NFT } from "./reducer";
import { store, LoopringAPI } from "../../index";
import {
  CustomError,
  ErrorMap,
  NFTLimit,
} from "@loopring-web/common-resources";

const getWalletLayer2NFTBalance = async <_R extends { [key: string]: any }>({
  page,
  collection,
}: {
  page: number;
  collection: string | undefined;
}) => {
  // let _collection: string = collection;
  // if (!collection) {
  //   _collection = store.getState().walletLayer2NFT.collection;
  // }
  const offset = (page - 1) * NFTLimit;
  const { accountId, apiKey } = store.getState().account;
  if (apiKey && accountId && LoopringAPI.userAPI) {
    let { userNFTBalances, totalNum } = await LoopringAPI.userAPI
      .getUserNFTBalances(
        {
          accountId,
          tokenAddrs: collection,
          limit: NFTLimit,
          offset,
          nonZero: true,
          metadata: true, // close metadata
        },
        apiKey
      )
      .catch((_error) => {
        throw new CustomError(ErrorMap.TIME_OUT);
      });
    return {
      walletLayer2NFT: userNFTBalances ?? [],
      total: totalNum,
      collection: collection,
      page,
    };
  }
  return {};
};

export function* getPostsSaga({ payload: { page = 1, collection } }: any) {
  try {
    // @ts-ignore
    const walletLayer2NFT: any = yield call(getWalletLayer2NFTBalance, {
      page,
      collection,
    });
    yield put(getWalletLayer2NFTStatus({ ...walletLayer2NFT }));
  } catch (err) {
    yield put(getWalletLayer2NFTStatus(err));
  }
}

export function* walletLayer2NFTSaga() {
  yield all([takeLatest(updateWalletLayer2NFT, getPostsSaga)]);
}

export const walletLayer2NFTFork = [fork(walletLayer2NFTSaga)];
