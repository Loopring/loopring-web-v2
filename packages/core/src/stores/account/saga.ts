import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  cleanAccountStatus,
  nextAccountStatus,
  updateAccountStatus,
} from "./reducer";
import { PayloadAction } from "@reduxjs/toolkit";
import { Account, AccountStatus, myLog } from "@loopring-web/common-resources";
import { ConnectProviders, connectProvides } from "@loopring-web/web3-provider";
import { AccountInfo, ChainId, WalletType } from "@loopring-web/loopring-sdk";
import { store } from "../index";
import { LoopringAPI } from "../../api_wrapper";
import { updateToggleStatus } from "@loopring-web/component-lib";

const LoopFrozenFlag = true;
const getAccount = async (): Promise<{
  account: AccountInfo;
  walletType: WalletType;
  __timer__: NodeJS.Timer | -1;
}> => {
  let { accAddress, __timer__ } = store.getState().account;
  let { chainId, dexToggleUrl } = store.getState().system;
  const [{ accInfo: account }, { walletType }] = await Promise.all([
    LoopringAPI?.exchangeAPI?.getAccount({
      owner: accAddress,
    }) ?? Promise.resolve({ accInfo: {} } as any),
    LoopringAPI?.walletAPI?.getWalletType({
      wallet: accAddress, //realAddr != "" ? realAddr : address,
    }) ?? Promise.resolve({ walletType: {} } as any),
  ]);
  // .then(({walletType})=>{
  //    store.dispatch(updateAccountStatus({
  //      ...walletType,
  //    }));
  //  })
  if (account.frozen === LoopFrozenFlag) {
    myLog("account.frozen ___timer___", account.accountId);
    store.dispatch(
      updateToggleStatus({
        order: { enable: false, reason: "account frozen" },
        joinAmm: { enable: false, reason: "account frozen" },
        exitAmm: { enable: false, reason: "account frozen" },
        transfer: { enable: false, reason: "account frozen" },
        transferNFT: { enable: false, reason: "account frozen" },
        defi: { enable: false, reason: "account frozen" },
        // deposit: { enable: false, reason: "account frozen" },
        // depositNFT: { enable: false, reason: "account frozen" },
        withdraw: { enable: false, reason: "account frozen" },
        withdrawNFT: { enable: false, reason: "account frozen" },
        mintNFT: { enable: false, reason: "account frozen" },
        deployNFT: { enable: false, reason: "account frozen" },
        updateAccount: { enable: false, reason: "account frozen" },
        LRCStackInvest: { enable: false, reason: "account frozen" },
        redPacketNFTV1: { enable: false, reason: "account frozen" },
        claim: { enable: false, reason: "account frozen" },
      })
    );
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
      walletType,
      __timer__,
    };
  } else {
    let toggle = {};
    if (chainId === ChainId.MAINNET) {
      toggle = await fetch(dexToggleUrl)
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .catch(() => ({}));
    }
    store.dispatch(
      updateToggleStatus({
        order: { enable: true, reason: undefined },
        joinAmm: { enable: true, reason: undefined },
        exitAmm: { enable: true, reason: undefined },
        transfer: { enable: true, reason: undefined },
        transferNFT: { enable: true, reason: undefined },
        defi: { enable: true, reason: undefined },
        deposit: { enable: true, reason: undefined },
        depositNFT: { enable: true, reason: undefined },
        withdraw: { enable: true, reason: undefined },
        withdrawNFT: { enable: true, reason: undefined },
        mintNFT: { enable: true, reason: undefined },
        deployNFT: { enable: true, reason: undefined },
        updateAccount: { enable: true, reason: undefined },
        LRCStackInvest: { enable: true, reason: undefined },
        redPacketNFTV1: { enable: true, reason: undefined },
        claim: { enable: true, reason: undefined },
        ...toggle,
      })
    );
  }

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
