import { useDispatch, useSelector } from 'react-redux'
import { getRedPacketConfigs, statusUnset } from './reducer'
import { RedPacketConfigStates } from './interface'
import { CoinKey } from '@loopring-web/common-resources'
import React from 'react'

export function useRedPacketConfig(): RedPacketConfigStates & {
  updateRedPacketConfigs: (tickerKeys: Array<CoinKey<any>>) => void
  statusUnset: () => void
} {
  const redPacketConfigs = useSelector((state: any) => state.redPacketConfigs)
  const dispatch = useDispatch()
  return {
    ...redPacketConfigs,
    statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
    updateRedPacketConfigs: React.useCallback(() => dispatch(getRedPacketConfigs({})), [dispatch]),
  }
}
