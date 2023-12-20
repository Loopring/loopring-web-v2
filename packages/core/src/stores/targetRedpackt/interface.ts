import { StateBase } from '@loopring-web/common-resources'
import { LuckyTokenItemForReceive } from '@loopring-web/loopring-sdk'

export type RedPacketConfig = any
export type TargetRedPacketStates = {
  redPackets: LuckyTokenItemForReceive[] | undefined
  openedRedPackets: boolean
  showPopup: boolean
  __timer__?: number
} & StateBase
