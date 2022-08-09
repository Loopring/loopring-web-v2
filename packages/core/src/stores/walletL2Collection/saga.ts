import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getWalletL2CollectionStatus, updateWalletL2Collection } from "./reducer";
import { store, LoopringAPI } from "../../index";
import {
  CustomError,
  ErrorMap, myLog,
  CollectionLimit,
} from "@loopring-web/common-resources";
import * as sdk from '@loopring-web/loopring-sdk';

const getWalletL2CollectionBalance = async <_R extends { [ key: string ]: any }>({
                                                                                   page,
                                                                                 }: {
  page: number;
}) => {
  const offset = (page - 1) * CollectionLimit;
  const {accountId, apiKey, accAddress} = store.getState().account;
  myLog('getWalletL2CollectionBalance');
  if (apiKey && accountId && LoopringAPI.userAPI) {
    const response = await LoopringAPI.userAPI
      .getUserNFTCollection(
        {
          // @ts-ignore
          owner: accAddress,
          limit: CollectionLimit,
          offset,
          // metadata: true, // close metadata
        },
        apiKey
      )
      .catch((_error) => {
        throw new CustomError(ErrorMap.TIME_OUT);
      });
    let collections: sdk.CollectionMeta[] = [], totalNum = 0;
    if (
      response &&
      ((response as sdk.RESULT_INFO).code ||
        (response as sdk.RESULT_INFO).message)
    ) {
      throw new CustomError(ErrorMap.ERROR_UNKNOWN);
    }
    collections = (response as any).collections;
    totalNum = (response as any).totalNum;
    return {
      walletL2Collection: collections ?? [],
      total: totalNum,
      page,
    };
  }
  return {};
};

export function* getPostsSaga({payload: {page = 1}}: any) {
  try {
    // @ts-ignore
    const walletL2Collection: any = yield call(getWalletL2CollectionBalance, {
      page,
    });
    yield put(getWalletL2CollectionStatus({...walletL2Collection}));
  } catch (err) {
    yield put(getWalletL2CollectionStatus(err));
  }
}

export function* walletL2CollectionSaga() {
  yield all([takeLatest(updateWalletL2Collection, getPostsSaga)]);
}

export const walletL2CollectionFork = [fork(walletL2CollectionSaga)];
