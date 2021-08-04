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
    publicKey: {},
    level: '',
    nonce: undefined,
    connectName: ConnectProviders.UnKnown,
    _chainId: 1,
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
                    _chainId,
                    nonce,
                    connectName,
                    _userOnModel
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
                if (_chainId) {
                    state._chainId = _chainId;
                }
                if (nonce) {
                    state.nonce = nonce;
                }
                if (_userOnModel !== undefined) {
                    state._userOnModel = _userOnModel;
                }


                state.status = SagaStatus.DONE;
            }
        },
        cleanAccountStatus(state: AccountState, action: PayloadAction<{shouldUpdateProvider?:boolean|undefined}>) {
            state.accAddress = '';
            state.readyState = AccountStatus.UN_CONNECT;
            state.accountId = -1;
            state.apiKey = '';
            state.eddsaKey = '';
            state.publicKey = {};
            state.level = '';
            state.nonce = undefined;
            state.status = SagaStatus.DONE;
            state.errorMessage = null;
            if(action.payload?.shouldUpdateProvider){
                state.connectName = ConnectProviders.UnKnown;
            }
            //no need update _chainId
            //no need update _userOnModel
        },
        statusUnset: (state: AccountState) => {
            state.status = SagaStatus.UNSET
        }
    },
})
export default accountSlice
export const {
    updateAccountStatus,
    restAccountStatus,
    cleanAccountStatus,
    nextAccountStatus,
    statusUnset
} = accountSlice.actions

