import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { NotifyStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: NotifyStates = {
  notifyMap: undefined,
  status: SagaStatus.PENDING,
  errorMessage: null,
}

const notifyMapSlice: Slice<NotifyStates> = createSlice({
  name: 'notifyMap',
  initialState,
  reducers: {
    getNotify(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getNotifyStatus(state, action: PayloadAction<NotifyStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignoreis                                                  i
        state.errorMessage = action.error
      }
      state.notifyMap = action.payload.notifyMap
      state.status = SagaStatus.DONE
    },

    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { notifyMapSlice }
export const { getNotify, resetNotify, getNotifyStatus, statusUnset } = notifyMapSlice.actions
