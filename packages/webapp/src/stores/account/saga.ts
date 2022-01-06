import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  cleanAccountStatus,
  nextAccountStatus,
  updateAccountStatus,
} from "./reducer";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  Account,
  AccountStatus,
  ConnectProviders,
} from "@loopring-web/common-resources";
import { connectProvides } from "@loopring-web/web3-provider";

export function* accountUpdateSaga({
  payload,
}: PayloadAction<Partial<Account>>) {
  try {
    // let data: { accountState: Partial<AccountState> };
    // const {currentState} = yield select();
    const account = payload;
    yield put(
      nextAccountStatus({
        // ...currentState,
        ...account,
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

// function* goCleanAccount({payload}: PayloadAction<undefined>) {
//     yield put(cleanAccountStatus(undefined));
// }

function* accountRestSage() {
  yield all([takeLatest(cleanAccountStatus, cleanAccountSaga)]);
}

export const accountFork = [fork(accountSage), fork(accountRestSage)];

// const subject = new Subject<{ command: keyof typeof StorageCommands, data?: any }>();
// const goNextAccountStatus = async (currentState: Partial<AccountState>,
//                                    nextState: Partial<AccountState>): Promise<{ accountState: Partial<AccountState> }> => {
//     // let newAccountState: Partial<AccountState>
//     switch (nextState) {
//         case AccountStatus.RESET:
//             connectProvides.clear()
//             //TODO sessionStorage clear
//             break;
//         case AccountStatus.UN_CONNECT:
//             console.log('connectName:', nextState.connectName, 'readyState:', currentState.readyState)
//             // if(nextState.readyState !== currentState.readyState )  {
//             //     await connect({...currentState,...nextState})
//             // }
//             // if (success) {
//             //     nextState
//             // } else {
//             //     return {accountState:currentAccountState}
//             // }
//             break;
//         // case AccountStatus.CONNECT:
//         case AccountStatus.DEPOSITING:
//             break;
//         case AccountStatus.NO_ACCOUNT:
//             // if (success) {
//             //
//             // } else {
//             //   return {accountState:currentAccountState}
//             // }
//             break;
//         case AccountStatus.LOCKED:
//         // if (success) {
//         //
//         //   return await goNextAccountStatus({...currentAccountState, readyState: AccountStatus.ACTIVATED})
//         //
//         // } else {
//         //   return {accountState:currentAccountState}
//         // }
//
//         case AccountStatus.ACTIVATED:
//
//         // goNextAccountStatus({
//         //   ...newAccountState
//         //   readyState: AccountStatus.LOCKED
//         // })
//         // return {accountState: nextState}
//
//     }
//     return {accountState: nextState}
// }
//
// const goAccountLocked = async (accountState: AccountState): Promise<{ accountState: Partial<AccountState> }> => {
//     if (accountState.readyState === AccountStatus.ACTIVATED) {
//         //TODO GOBACK TO LOCKED STATE
//         return {
//             accountState: {
//                 ...accountState,
//                 readyState: AccountStatus.LOCKED
//             }
//         }
//     } else {
//     }
//     return {
//         accountState: {}
//     }
// }
// const goCleanAccount = async (): Promise<{ accountState: Partial<AccountState> }> => {
//
//     subject.next({command: StorageCommands.CLEAN})
//     return {
//         accountState: {
//             accAddress: '',
//             readyState: AccountStatus.RESET,
//             accountId: -1,
//             apiKey: '',
//             eddsaKey: '',
//             connectName: ConnectProviders.UnKnow,
//             status: 'UNSET',
//             errorMessage: null,
//         }
//     }
// }
//
//
//
