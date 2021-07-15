import { useDispatch, useSelector } from 'react-redux'
import { StateBase } from '../interface';
import { socketSlice } from './reducer';
import { SocketMap } from './interface';

export function useSocket(): StateBase & {
    // socketStart:()=>void,
    statusUnset: () => void,
    sendSocketTopic: (socket: SocketMap) => void,
    socketEnd: () => void
} {
    const socket: StateBase & { socket: SocketMap } = useSelector((state: any) => state.socket)
    const dispatch = useDispatch();
    // const socketStart = () => {
    //     dispatch(socketSlice.actions.socketStart(undefined))
    // }
    const sendSocketTopic = (socket: SocketMap) => {
        dispatch(socketSlice.actions.sendSocketTopic({socket}))
    }
    const socketEnd = () => {
        dispatch(socketSlice.actions.socketEnd(undefined))
    }
    const statusUnset = () => {
        dispatch(socketSlice.actions.statusUnset(undefined))
    }
    return {
        ...socket,
        statusUnset,
        // socketStart,
        sendSocketTopic,
        socketEnd,
    }

}
