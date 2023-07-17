import { StateBase } from '@loopring-web/common-resources'

export type RedPacketConfig = any
export type RedPacketConfigStates = {
  redPacketConfigs: RedPacketConfig
  __timer__?: number
} & StateBase
