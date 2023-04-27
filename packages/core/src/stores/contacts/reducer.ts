import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import {
  Account,
  AccountState,
  AccountStatus,
  SagaStatus,
} from "@loopring-web/common-resources";
import { ConnectProviders } from "@loopring-web/web3-provider";
import { AddressType } from "@loopring-web/loopring-sdk";

type DisplayContact = {
  name: string
  address: string
  avatarURL: string
  editing: boolean
  addressType: AddressType
}

type ContactsState = {
  contacts: DisplayContact[] | undefined;
}

const initialState: ContactsState = {
  contacts: [],
};

export const contactsSlice: Slice<ContactsState> = createSlice<
  ContactsState,
  SliceCaseReducers<ContactsState>
>({
  name: "contacts",
  initialState: initialState,
  reducers: {
    updateContacts(state, action: PayloadAction<DisplayContact[]>) {
      // const contacts = action.payload
      state.contacts = action.payload
    },
    // changeShowModel(
    //   state,
    //   action: PayloadAction<{ _userOnModel: boolean | undefined }>
    // ) {
    //   const { _userOnModel } = action.payload;
    //   state._userOnModel = _userOnModel;
    // },
    // nextAccountStatus(state, action: PayloadAction<Partial<Account>>) {
    //   // @ts-ignore
    //   if (action.error) {
    //     state.status = SagaStatus.ERROR;
    //     // @ts-ignore
    //     state.errorMessage = action.error;
    //   } else {
    //     const {
    //       accAddress,
    //       qrCodeUrl,
    //       readyState,
    //       accountId,
    //       wrongChain,
    //       level,
    //       apiKey,
    //       eddsaKey,
    //       _chainId,
    //       keySeed,
    //       nonce,
    //       frozen,
    //       _accountIdNotActive,
    //       connectName,
    //       isInCounterFactualStatus,
    //       isContract1XAddress,
    //       isContractAddress,
    //       isCFAddress,
    //       isContract,
    //       __timer__,
    //     } = action.payload;
    //     if (_accountIdNotActive) {
    //       state._accountIdNotActive = _accountIdNotActive;
    //     }
    //     if (accAddress !== undefined) {
    //       state.accAddress = accAddress;
    //     }

    //     if (qrCodeUrl !== undefined) {
    //       state.qrCodeUrl = qrCodeUrl;
    //     }

    //     if (wrongChain !== undefined) {
    //       state.wrongChain = wrongChain;
    //     }
    //     if (readyState) {
    //       state.readyState = readyState;
    //     }
    //     if (accountId !== undefined) {
    //       state.accountId = accountId;
    //     }
    //     if (level !== undefined) {
    //       state.level = level;
    //     }
    //     if (apiKey !== undefined) {
    //       state.apiKey = apiKey;
    //     }
    //     if (eddsaKey !== undefined) {
    //       state.eddsaKey = eddsaKey;
    //     }
    //     if (connectName !== undefined) {
    //       state.connectName = connectName;
    //     }
    //     if (_chainId !== undefined) {
    //       state._chainId = _chainId;
    //     }
    //     if (nonce !== undefined) {
    //       state.nonce = nonce;
    //     }
    //     if (keySeed !== undefined) {
    //       state.keySeed = keySeed;
    //     }
    //     if (__timer__ !== undefined) {
    //       state.__timer__ = __timer__;
    //     }
    //     state.isInCounterFactualStatus = isInCounterFactualStatus;
    //     state.isContract1XAddress = isContract1XAddress;
    //     state.isContractAddress = isContractAddress;
    //     state.isCFAddress = isCFAddress;
    //     state.isContract = isContract;
    //     state.frozen = frozen;
    //     state.status = SagaStatus.DONE;
    //   }
    // },
    // cleanAccountStatus(
    //   state,
    //   _action: PayloadAction<{ shouldUpdateProvider?: boolean | undefined }>
    // ) {
    //   state.status = SagaStatus.PENDING;
    // },
    // statusUnset: (state) => {
    //   state.status = SagaStatus.UNSET;
    // },
  },
});
export default contactsSlice;
export const {
  updateContacts,
  // restAccountStatus,
  // changeShowModel,
  // cleanAccountStatus,
  // nextAccountStatus,
  // statusUnset,
} = contactsSlice.actions;
