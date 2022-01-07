import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import {
  Account,
  AccountState,
  AccountStatus,
  ConnectProviders,
  SagaStatus,
} from "@loopring-web/common-resources";

const initialState: AccountState = {
  accAddress: "",
  qrCodeUrl: "",
  readyState: AccountStatus.UN_CONNECT,
  accountId: -1,
  apiKey: "",
  eddsaKey: "",
  publicKey: {},
  level: "",
  keySeed: "",
  nonce: undefined,
  keyNonce: undefined,
  connectName: ConnectProviders.unknown,
  _chainId: 1,
  status: "PENDING",
  errorMessage: null,
};

const accountSlice: Slice<AccountState> = createSlice<
  AccountState,
  SliceCaseReducers<AccountState>
>({
  name: "account",
  initialState: initialState,
  reducers: {
    updateAccountStatus(
      state: AccountState,
      action: PayloadAction<Partial<Account>>
    ) {
      state.status = SagaStatus.PENDING;
    },
    changeShowModel(
      state: AccountState,
      action: PayloadAction<{ _userOnModel: boolean | undefined }>
    ) {
      const { _userOnModel } = action.payload;
      state._userOnModel = _userOnModel;
    },
    nextAccountStatus(
      state: AccountState,
      action: PayloadAction<Partial<Account>>
    ) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR;
        // @ts-ignore
        state.errorMessage = action.error;
      } else {
        const {
          accAddress,
          qrCodeUrl,
          readyState,
          accountId,
          wrongChain,
          level,
          apiKey,
          eddsaKey,
          _chainId,
          keySeed,
          nonce,
          _accountIdNotActive,
          connectName,
          // _userOnModel
        } = action.payload;
        if (_accountIdNotActive) {
          state._accountIdNotActive = _accountIdNotActive;
        }
        if (accAddress !== undefined) {
          state.accAddress = accAddress;
        }

        if (qrCodeUrl !== undefined) {
          state.qrCodeUrl = qrCodeUrl;
        }

        if (wrongChain !== undefined) {
          state.wrongChain = wrongChain;
        }
        if (readyState) {
          state.readyState = readyState;
        }
        if (accountId !== undefined) {
          state.accountId = accountId;
        }
        if (level !== undefined) {
          state.level = level;
        }
        if (apiKey !== undefined) {
          state.apiKey = apiKey;
        }
        if (eddsaKey !== undefined) {
          state.eddsaKey = eddsaKey;
        }
        if (connectName !== undefined) {
          state.connectName = connectName;
        }
        if (_chainId !== undefined) {
          state._chainId = _chainId;
        }
        if (nonce !== undefined) {
          state.nonce = nonce;
        }
        if (keySeed !== undefined) {
          state.keySeed = keySeed;
        }
        state.status = SagaStatus.DONE;
      }
    },
    cleanAccountStatus(
      state: AccountState,
      action: PayloadAction<{ shouldUpdateProvider?: boolean | undefined }>
    ) {
      state.status = SagaStatus.PENDING;
    },
    statusUnset: (state: AccountState) => {
      state.status = SagaStatus.UNSET;
    },
  },
});
export default accountSlice;
export const {
  updateAccountStatus,
  // restAccountStatus,
  changeShowModel,
  cleanAccountStatus,
  nextAccountStatus,
  statusUnset,
} = accountSlice.actions;
