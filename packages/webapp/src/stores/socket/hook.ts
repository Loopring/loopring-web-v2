import { useDispatch, useSelector } from 'react-redux'
import { sendSocketTopic, socketEnd } from './reducer';
import { SocketMap } from './interface';
import React from 'react';
import { statusUnset } from '../Amm/AmmMap';
import { StateBase } from '@loopring-web/common-resources';

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
    // const sendSocketTopic = (socket: SocketMap) => {
    //     dispatch(socketSlice.actions.sendSocketTopic({socket}))
    // }
    // const socketEnd = () => {
    //     dispatch(socketSlice.actions.socketEnd(undefined))
    // }
    // const statusUnset = () => {
    //     dispatch(socketSlice.actions.statusUnset(undefined))
    // }
    return {
        ...socket,
        statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
        sendSocketTopic: React.useCallback((socket: SocketMap) => dispatch(sendSocketTopic({socket})), [dispatch]),
        socketEnd: React.useCallback(() => dispatch(socketEnd(undefined)), [dispatch]),
    }

}
