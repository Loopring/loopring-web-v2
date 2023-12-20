import { useDispatch, useSelector } from 'react-redux'
import { statusUnset, setShowRedPacketsPopup, getExclusiveRedpacket } from './reducer'
import { TargetRedPacketStates } from './interface'
import React from 'react'

export function useTargetRedPackets(): TargetRedPacketStates & {
  statusUnset: () => void
  setShowRedPacketsPopup: (show: boolean) => void
  getExclusiveRedpacket: () => void
} {
  const targetRedpacket: TargetRedPacketStates = useSelector((state: any) => state.targetRedpacket)
  const dispatch = useDispatch()
  return {
    ...targetRedpacket,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    setShowRedPacketsPopup: React.useCallback(
      (show: boolean) => dispatch(setShowRedPacketsPopup(show)),
      [dispatch],
    ),
    getExclusiveRedpacket() {
      dispatch(getExclusiveRedpacket(undefined))
    },
  }
}
