import { useDispatch, useSelector } from 'react-redux'
import { sendSocketTopic, socketEnd, statusUnset, socketUserEnd } from './reducer'
import { SocketMap } from './interface'
import React from 'react'
import { StateBase } from '@loopring-web/common-resources'

export function useSocket() {
  const socket: StateBase & { socket: SocketMap } = useSelector((state: any) => state.socket)
  const dispatch = useDispatch()
  return {
    ...socket,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    sendSocketTopic: React.useCallback(
      (socket: SocketMap) => dispatch(sendSocketTopic({ socket })),
      [dispatch],
    ),
    socketUserEnd: React.useCallback(() => dispatch(socketUserEnd(undefined)), [dispatch]),
    socketEnd: React.useCallback(() => dispatch(socketEnd(undefined)), [dispatch]),
  }
}
