import { createSlice, PayloadAction, Slice, SliceCaseReducers } from '@reduxjs/toolkit'
import { SagaStatus } from '@loopring-web/common-resources';
import { ContactsState } from './interface';

const initialState: ContactsState = {
  contacts: [],
  status: SagaStatus.PENDING,
  __timer__: -1,
}

export const contactsSlice: Slice<ContactsState> = createSlice<
  ContactsState,
  SliceCaseReducers<ContactsState>
>({
  name: 'contacts',
  initialState: initialState,
  reducers: {
    updateContacts(state) {
      state.status = SagaStatus.PENDING
    },
    reset(state) {
      state = {
        ...initialState,
      }
      state.status = SagaStatus.UNSET
    },
    getContactsStatus(state, action: PayloadAction<ContactsState>) {
      if ((action.payload as any).error) {
        state.status = SagaStatus.ERROR
        state.errorMessage = (action.payload as any).error
        state.contacts = []
        return
      }
      state.errorMessage = null
      state.contacts = action.payload.contacts
      if (action.payload.__timer__) {
        state.__timer__ = action.payload.__timer__
      }
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },

  },
})
export default contactsSlice
export const {updateContacts, getContactsStatus, statusUnset, reset} = contactsSlice.actions
