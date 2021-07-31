import { all, fork, put, select, takeLatest } from "redux-saga/effects"
import { nextAccountStatus, restAccountStatus, updateAccountStatus } from './reducer';
import { PayloadAction } from '@reduxjs/toolkit';
import { Account, AccountStatus } from './interface';
import { LoopringProvider } from "@loopring-web/web3-provider";

export function* accountUpdateSaga({payload}: PayloadAction<Partial<Account>>) {
    try {
        // let data: { accountState: Partial<AccountState> };
        const {currentState} = yield select();
        const account = payload;
        yield put(nextAccountStatus({
            ...currentState,
            ...account
        }));
        // switch (toStatus) {
        //     case 'next':
        //         // @ts-ignore
        //         data = yield call(goNextAccountStatus, currentState, newState);
        //         subject.next({command: StorageCommands.UPDATE, data: data.accountState})
        //         yield put(nextAccountStatus(data.accountState));
        //         break
        //     // case AccountStatus.RESET:
        //     //     data = yield call(goCleanAccount);
        //     //     yield put(nextAccountStatus(data.accountState));
        //     //     break
        //     case AccountStatus.LOCKED:
        //         data = yield call(goAccountLocked, currentState);
        //         subject.next({command: StorageCommands.UPDATE, data: data.accountState})
        //         yield put(nextAccountStatus(data.accountState));
        //
        //         break
        //     default:
        //         break;
        // }

    } catch (err) {
        yield put(nextAccountStatus(err));
    }
}
function* accountSage() {
    yield all([takeLatest(updateAccountStatus, accountUpdateSaga)]);
}
function* goCleanAccount({payload}: PayloadAction<undefined>) {
    yield put(nextAccountStatus({
        accAddress: '',
        readyState: AccountStatus.UN_CONNECT,
        accountId: -1,
        apiKey: '',
        eddsaKey: '',
        connectName: LoopringProvider.UnKnow,
        status: 'UNSET',
        errorMessage: null,
    }));
}
function* accountRestSage() {
    yield all([takeLatest(restAccountStatus, goCleanAccount)]);
}
export const accountFork = [
    fork(accountSage),
    fork(accountRestSage)
]

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
//             connectName: LoopringProvider.UnKnow,
//             status: 'UNSET',
//             errorMessage: null,
//         }
//     }
// }
//
//
//

