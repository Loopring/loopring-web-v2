import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { Account, AccountState, AccountStatus, ConnectProviders, SagaStatus } from '@loopring-web/common-resources';

// import { Lv2Account, } from 'defs/account_defs'
// import { AccountStatus } from 'state_machine/account_machine_spec'
// import { UserStorage } from 'storage'
// const initialState = (initState:Partial<AccountState>) => {
//   // const defaultAccId = process.env.REACT_APP_TEST_ACCOUND_ID ? process.env.REACT_APP_TEST_ACCOUND_ID : UserStorage.getAccountId()
//   // const defaultApiKey = process.env.REACT_APP_TEST_API_KEY ? process.env.REACT_APP_TEST_API_KEY : UserStorage.getApikey()
//   // const defaultOwner = process.env.REACT_APP_TEST_OWNER ? process.env.REACT_APP_TEST_OWNER : UserStorage.getAccount()
//   // const defaultEddsaKey = process.env.REACT_APP_TEST_EDDSA_KEY ? process.env.REACT_APP_TEST_EDDSA_KEY : UserStorage.getEddsakey()
//
//   // const defaultStatus = AccountStatus.UNCONNNECTED
//   // return {
//   //   accAddr: defaultOwner,
//   //   status: defaultStatus,
//   //   accountId: defaultAccId,
//   //   publicKey: {},
//   //   nonce: 0,
//   //   isContractAddress: false,
//   //   apiKey: defaultApiKey,
//   //   eddsaKey: defaultEddsaKey,
//   //   connectName: ConnectorNames.Unknown,
//   //   connectNameTemp: ConnectorNames.Unknown,
//   // } as Lv2Account
//   return {
//     accAddress: '',
//     status: AccountStatus.UN_CONNECT,
//     accountId: '',
//     apiKey: '',
//     eddsaKey: '',
//     connectName: ConnectProviders.UnKnow,
//     // ...initState,
//   }
// }
const initialState: AccountState = {
    accAddress: '',
    readyState: AccountStatus.UN_CONNECT,
    accountId: -1,
    apiKey: '',
    eddsaKey: '',
    level: '',
    connectName: ConnectProviders.UnKnow,
    status: 'UNSET',
    errorMessage: null,
}

const accountSlice: Slice<AccountState> = createSlice<AccountState, SliceCaseReducers<AccountState>>({
    name: 'account',
    initialState: initialState,
    reducers: {
        updateAccountStatus(state: AccountState, action: PayloadAction<Partial<Account>>) {
            state.status = SagaStatus.PENDING
        },
        restAccountStatus(state: AccountState, action: PayloadAction<undefined>) {
            state.status = SagaStatus.PENDING
        },
        nextAccountStatus(state: AccountState, action: PayloadAction<Partial<Account>>) {
            // @ts-ignore
            if (action.error) {
                state.status = SagaStatus.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            } else {
                const {
                    accAddress,
                    readyState,
                    accountId,
                    level,
                    apiKey,
                    eddsaKey,
                    connectName
                } = action.payload;
                if (accAddress) {
                    state.accAddress = accAddress;
                }
                if (readyState) {
                    state.readyState = readyState;
                }
                if (accountId) {
                    state.accountId = accountId;
                }
                if (level) {
                    state.level = level;
                }
                if (apiKey) {
                    state.apiKey = apiKey;
                }
                if (eddsaKey) {
                    state.eddsaKey = eddsaKey;
                }
                if (connectName) {
                    state.connectName = connectName;
                }
                state.status = SagaStatus.DONE;
            }
        },
        statusUnset: (state: AccountState) => {
            state.status = SagaStatus.UNSET
        }
    },
})
export default accountSlice
export const {updateAccountStatus, restAccountStatus, nextAccountStatus, statusUnset} = accountSlice.actions

