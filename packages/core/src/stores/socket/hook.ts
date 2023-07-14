import { useDispatch, useSelector } from 'react-redux'
import { sendSocketTopic, socketEnd, statusUnset } from './reducer'
import { SocketMap } from './interface'
import React from 'react'
import { StateBase } from '@loopring-web/common-resources'

export function useSocket(): StateBase & {
  // socketStart:()=>void,
  socket: SocketMap
  statusUnset: () => void
  sendSocketTopic: (socket: SocketMap) => void
  socketEnd: () => void
} {
  const socket: StateBase & { socket: SocketMap } = useSelector((state: any) => state.socket)
  const dispatch = useDispatch()
  return {
    ...socket,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    sendSocketTopic: React.useCallback(
      (socket: SocketMap) => dispatch(sendSocketTopic({ socket })),
      [dispatch],
    ),
    socketEnd: React.useCallback(() => dispatch(socketEnd(undefined)), [dispatch]),
  }
}
