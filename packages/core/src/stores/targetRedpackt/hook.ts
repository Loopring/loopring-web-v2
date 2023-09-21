import { useDispatch, useSelector } from 'react-redux'
import {  statusUnset, setShowRedPacketsPopup, getExclusiveRedpacket } from './reducer'
import { TargetRedPacketStates } from './interface'
import React from 'react'
import { useAccount } from '../account'

export function useTargetRedPackets(): TargetRedPacketStates & {
  statusUnset: () => void
  setShowRedPacketsPopup: (show: boolean) => void
  getExclusiveRedpacket: () => void
} {
  const targetRedpacket: TargetRedPacketStates = useSelector((state: any) => state.targetRedpacket)
  const dispatch = useDispatch()
  const {account} = useAccount()
  React.useEffect(() => {
    dispatch(getExclusiveRedpacket(undefined))
    const timer = setInterval(() => {
      dispatch(getExclusiveRedpacket(undefined))
    }, 5 * 60 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [account.apiKey])
  return {
    ...targetRedpacket,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    setShowRedPacketsPopup: React.useCallback((show: boolean) => dispatch(setShowRedPacketsPopup(show)), [dispatch]),
    getExclusiveRedpacket() {
      dispatch(getExclusiveRedpacket(undefined))
    },
  }
}
