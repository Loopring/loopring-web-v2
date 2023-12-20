import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SagaStatus, StateBase } from '@loopring-web/common-resources'
import { SocketMap, SocketUserMap } from './interface'

const initialState: StateBase & { socket: SocketMap & SocketUserMap } = {
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
    socketUserEnd(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    // socketNotSupport(state,action: PayloadAction<undefined>) {
    //
    // },
    sendSocketTopic(state, _action: PayloadAction<{ socket: SocketMap }>) {
      state.status = SagaStatus.PENDING
    },
    getSocketStatus(state, action: PayloadAction<{ socket: SocketMap } | Error>) {
      // @ts-ignore
      if ((action.payload as any).error) {
        state.status = SagaStatus.ERROR
        state.errorMessage = (action.payload as any).error
        state.socket = {}
        return
      }
      state.socket = (action.payload as { socket: SocketMap })?.socket ?? {}
      state.status = SagaStatus.DONE
    },

    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { socketSlice }
export const { getSocketStatus, socketUserEnd, sendSocketTopic, socketEnd, statusUnset } =
  socketSlice.actions
