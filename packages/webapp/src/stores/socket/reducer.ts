import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { STATUS } from '../constant';
import { StateBase } from '../interface';
import { SocketMap } from './interface';

const initialState: StateBase & {socket: SocketMap} = {
  socket: {},
  status: 'UNSET',
  errorMessage: null,
}
const socketSlice: Slice<StateBase & {socket: SocketMap}> = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    socketEnd(state,action:PayloadAction<undefined>){
      state.socket = {};
      state.status = STATUS.PENDING;
    },
    sendSocketTopic(state, action: PayloadAction<{socket: SocketMap}>) {
      state.socket = action.payload.socket
    },
    getSocketStatus(state, action: PayloadAction<undefined>) {

      // @ts-ignore
      if (action.error) {
        state.status = STATUS.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      // state.socket = action.payload.socket
      state.status = STATUS.DONE
    },

    statusUnset: state => {
      state.status = STATUS.UNSET
    }

  },
});
export { socketSlice };
export const { getSocketStatus, sendSocketTopic, socketEnd, statusUnset} = socketSlice.actions;
