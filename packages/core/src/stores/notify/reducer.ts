import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { NotifyStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: NotifyStates = {
  notifyMap: undefined,
  myNotifyMap: {
    items: [],
    total: undefined,
    unReads: undefined,
  },
  status: SagaStatus.PENDING,
  errorMessage: null,
}

const notifyMapSlice: Slice<NotifyStates> = createSlice({
  name: 'notifyMap',
  initialState,
  reducers: {
    restUerNotify(state) {
      state.status = SagaStatus.DONE
      state.myNotifyMap = initialState.myNotifyMap
    },
    getNotify(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getUserNotify(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getNotifyStatus(state, action: PayloadAction<NotifyStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignoreis                                                  i
        state.errorMessage = action.error
      }
      if (action.payload.notifyMap) {
        state.notifyMap = action.payload.notifyMap
      }
      if (action.payload.myNotifyMap) {
        state.myNotifyMap = action.payload.myNotifyMap
      }
      state.status = SagaStatus.DONE
    },

    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { notifyMapSlice }
export const { restUerNotify, getNotify, getUserNotify, getNotifyStatus, statusUnset } =
  notifyMapSlice.actions
