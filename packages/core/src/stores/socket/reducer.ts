import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SagaStatus, StateBase } from '@loopring-web/common-resources'
import { SocketMap } from './interface'

const initialState: StateBase & { socket: SocketMap } = {
  socket: {},
  status: SagaStatus.UNSET,
  errorMessage: null,
}
const socketSlice: Slice<StateBase & { socket: SocketMap }> = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    socketEnd(state, _action: PayloadAction<undefined>) {
      state.socket = {}
      state.status = SagaStatus.PENDING
    },
    // socketNotSupport(state,action: PayloadAction<undefined>) {
    //
    // },
    sendSocketTopic(state, action: PayloadAction<{ socket: SocketMap }>) {
      state.socket = action.payload.socket
      state.status = SagaStatus.PENDING
    },
    getSocketStatus(state, action: PayloadAction<undefined | Error>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      state.status = SagaStatus.DONE
    },

    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { socketSlice }
export const { getSocketStatus, sendSocketTopic, socketEnd, statusUnset } = socketSlice.actions
