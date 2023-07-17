import { useDispatch, useSelector } from 'react-redux'
import { getNotify, statusUnset } from './reducer'
import { NotifyStates } from './interface'
import React from 'react'

export function useNotify(): NotifyStates & {
  getNotify: () => void
  statusUnset: () => void
} {
  const notifyMap: NotifyStates = useSelector((state: any) => state.notifyMap)
  const dispatch = useDispatch()
  return {
    ...notifyMap,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    getNotify: React.useCallback(() => dispatch(getNotify(undefined)), [dispatch]),
  }
}
