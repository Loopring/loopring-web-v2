import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { ContactStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: ContactStates = {
  contactMap: undefined,
  status: SagaStatus.PENDING,
  errorMessage: null,
}

const contactMapSlice: Slice<ContactStates> = createSlice({
  name: 'contactMap',
  initialState,
  reducers: {
    restUerContact(state) {
      state.status = SagaStatus.DONE
    },
    getContact(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getUserContact(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getContactStatus(state, action: PayloadAction<ContactStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignoreis                                                  i
        state.errorMessage = action.error
      }
      if (action.payload.contactMap) {
        state.contactMap = action.payload.contactMap
      }
      state.status = SagaStatus.DONE
    },

    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { contactMapSlice }
export const { restUerContact, getContact, getUserContact, getContactStatus, statusUnset } =
  contactMapSlice.actions
