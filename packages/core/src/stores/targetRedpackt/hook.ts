import { useDispatch, useSelector } from 'react-redux'
import {  statusUnset, setShowRedPacketsPopup, setOpendPopup } from './reducer'
import { TargetRedPacketStates } from './interface'
import React from 'react'

export function useTargetRedPackets(): TargetRedPacketStates & {
  statusUnset: () => void
  setShowRedPacketsPopup: (show: boolean) => void
  setOpendPopup: () => void
} {
  const targetRedpacket: TargetRedPacketStates = useSelector((state: any) => state.targetRedpacket)
  const dispatch = useDispatch()
  return {
    ...targetRedpacket,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    setShowRedPacketsPopup: React.useCallback((show: boolean) => dispatch(setShowRedPacketsPopup(show)), [dispatch]),
    setOpendPopup: React.useCallback(() => dispatch(setOpendPopup(undefined)), [dispatch]),
  }
}
