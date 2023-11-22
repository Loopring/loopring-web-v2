import { useDispatch, useSelector } from 'react-redux'
import { getNotify, statusUnset, getUserNotify, restUerNotify } from './reducer'
import { NotifyStates } from './interface'
import React from 'react'

export function useNotify() {
  const notifyMap: NotifyStates = useSelector((state: any) => state.notifyMap)
  const dispatch = useDispatch()
  return {
    ...notifyMap,
    restUserNotify: React.useCallback(() => dispatch(restUerNotify(undefined)), [dispatch]),
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getNotify: React.useCallback(() => dispatch(getNotify(undefined)), [dispatch]),
    getUserNotify: React.useCallback(() => dispatch(getUserNotify(undefined)), [dispatch]),
  }
}
