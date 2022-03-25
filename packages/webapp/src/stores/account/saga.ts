import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  cleanAccountStatus,
  nextAccountStatus,
  updateAccountStatus,
} from "./reducer";
import { PayloadAction } from "@reduxjs/toolkit";
import { Account, AccountStatus } from "@loopring-web/common-resources";
import { ConnectProviders, connectProvides } from "@loopring-web/web3-provider";
import { AccountInfo } from "@loopring-web/loopring-sdk";
import store from "../index";
import { LoopringAPI } from "../../api_wrapper";

const getAccount = async (): Promise<{
  account: AccountInfo;
  __timer__: NodeJS.Timer | -1;
}> => {
  let { accAddress, __timer__ } = store.getState().account;
  const { accInfo: account } = await (accAddress && LoopringAPI.exchangeAPI
    ? LoopringAPI?.exchangeAPI.getAccount({
        owner: accAddress,
      })
    : Promise.resolve({ accInfo: {} } as any));
  if (account.frozen === true) {
    __timer__ = ((__timer__) => {
      if (__timer__ && __timer__ !== -1) {
        clearTimeout(__timer__);
      }
      return setTimeout(() => {
        store.dispatch(updateAccountStatus({ frozen: account.frozen }));
      }, 1000 * 60);
    })(__timer__);
    return {
      account,
      __timer__,
    };
  }

  if (__timer__ && __timer__ !== -1) {
    clearTimeout(__timer__);
  }
  return {
    account,
    __timer__: __timer__ ?? -1,
  };
};

export function* accountUpdateSaga({
  payload,
}: PayloadAction<Partial<Account>>) {
  try {
    // let account = payload;
    let data = { account: {}, __timer__: -1 };
    if (payload.apiKey || payload.frozen === true) {
      data = yield call(getAccount);
    }
    yield put(
      nextAccountStatus({
        ...payload,
        ...data.account,
        __timer__: data.__timer__,
      })
    );
  } catch (err) {
    yield put(nextAccountStatus(err));
  }
}

export function* cleanAccountSaga({
  payload,
}: PayloadAction<{ shouldUpdateProvider?: boolean | undefined }>) {
  try {
    let account: Partial<Account> = {
      accAddress: "",
      readyState: AccountStatus.UN_CONNECT,
      accountId: -1,
      apiKey: "",
      eddsaKey: "",
      publicKey: {},
      level: "",
      nonce: -1,
      keyNonce: -1,
      keySeed: "",
      _accountIdNotActive: -1,
      isInCounterFactualStatus: undefined,
      isContract: undefined,
    };

    if (payload && payload.shouldUpdateProvider) {
      yield call(async () => await connectProvides.clear());
      account = {
        ...account,
        connectName: ConnectProviders.unknown,
      };
    }
    yield put(
      nextAccountStatus({
        ...account,
      })
    );
  } catch (err) {
    yield put(nextAccountStatus(err));
  }
}

function* accountSage() {
  yield all([takeLatest(updateAccountStatus, accountUpdateSaga)]);
}

function* accountRestSage() {
  yield all([takeLatest(cleanAccountStatus, cleanAccountSaga)]);
}

export const accountFork = [fork(accountSage), fork(accountRestSage)];
