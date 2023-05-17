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
  currentAccountId: number | undefined
}

const initialState: ContactsState = {
  contacts: [],
  currentAccountId: undefined
};

export const contactsSlice: Slice<ContactsState> = createSlice<
  ContactsState,
  SliceCaseReducers<ContactsState>
>({
  name: "contacts",
  initialState: initialState,
  reducers: {
    updateContacts(state, action: PayloadAction<DisplayContact[]>) {
      state.contacts = action.payload
    },
    updateAccountId(state, action: PayloadAction<number>) {
      state.currentAccountId = action.payload
    },
  },
});
export default contactsSlice;
export const {
  updateContacts,
  updateAccountId
} = contactsSlice.actions;
