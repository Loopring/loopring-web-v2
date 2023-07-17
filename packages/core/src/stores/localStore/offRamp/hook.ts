import { useDispatch, useSelector } from 'react-redux'
import { clearAll, clearOffRampHash, updateOffRampHash } from './reducer'
import React from 'react'
import { OffRampHashInfos, OffRampHashItem } from '@loopring-web/common-resources'

export const useRedPacketHistory = (): {
  redPacketHistory: OffRampHashInfos
  clearAll: () => void
  clearOffRampHash: () => void
  updateOffRampHash: (props: OffRampHashItem) => void
} => {
  const redPacketHistory: OffRampHashInfos = useSelector(
    (state: any) => state.localStore.redPacketHistory,
  )
  const dispatch = useDispatch()
  return {
    redPacketHistory: redPacketHistory,
    clearAll: React.useCallback(() => dispatch(clearAll(undefined)), [dispatch]),
    clearOffRampHash: React.useCallback(() => dispatch(clearOffRampHash(undefined)), [dispatch]),
    updateOffRampHash: React.useCallback(
      (prosp: OffRampHashItem) => dispatch(updateOffRampHash(prosp)),
      [dispatch],
    ),
  }
}
