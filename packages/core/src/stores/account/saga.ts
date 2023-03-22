import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  cleanAccountStatus,
  nextAccountStatus,
  updateAccountStatus,
} from "./reducer";
import { PayloadAction } from "@reduxjs/toolkit";
import { Account, AccountStatus } from "@loopring-web/common-resources";
import { ConnectProviders, connectProvides } from "@loopring-web/web3-provider";
import { AccountInfo, WalletType } from "@loopring-web/loopring-sdk";
import { store } from "../index";
import { LoopringAPI } from "../../api_wrapper";
import { toggleCheck } from "../../services";

const LoopFrozenFlag = true;
const getAccount = async (): Promise<{
  account: AccountInfo;
  walletType: WalletType;
  __timer__: NodeJS.Timer | -1;
}> => {
  let { accAddress, __timer__, frozen } = store.getState().account;
  if (frozen === LoopFrozenFlag) {
    __timer__ = ((__timer__) => {
      if (__timer__ && __timer__ !== -1) {
        clearTimeout(__timer__);
      }
      return setTimeout(() => {
        store.dispatch(updateAccountStatus({ frozen: account.frozen }));
      }, 1000 * 60);
    })(__timer__);
  }
  toggleCheck();
  const [{ accInfo: account }, { walletType }] = await Promise.all([
    LoopringAPI?.exchangeAPI?.getAccount({
      owner: accAddress,
    }) ?? Promise.resolve({ accInfo: {} } as any),
    LoopringAPI?.walletAPI?.getWalletType({
      wallet: accAddress, //realAddr != "" ? realAddr : address,
    }) ?? Promise.resolve({ walletType: {} } as any),
  ]);

  if (__timer__ && __timer__ !== -1) {
    clearTimeout(__timer__);
  }
  return {
    account,
    walletType: {
      ...walletType,
      isContract1XAddress:
        walletType?.loopringWalletContractVersion?.startsWith("V1_") ?? false,
    },
    __timer__: __timer__ ?? -1,
  };
};

export function* accountUpdateSaga({
  payload,
}: PayloadAction<Partial<Account>>) {
  try {
    let data = { account: {}, walletType: {}, __timer__: -1 };
    if (payload.apiKey || payload.frozen === LoopFrozenFlag) {
      data = yield call(getAccount);
    }
    yield put(
      nextAccountStatus({
        ...payload,
        ...data.account,
        ...data.walletType,
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
      isContract1XAddress: undefined,
    };

    if (payload && payload.shouldUpdateProvider) {
      yield call(async () => await connectProvides.clear());
      account = {
        ...account,
        connectName: ConnectProviders.Unknown,
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
