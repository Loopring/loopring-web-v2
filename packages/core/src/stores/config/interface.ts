import { ForexMap, StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'


export type FastWithdrawConfig = {
  fromToNetworks: {
    [key in string]: Array<string>
  },
  networkExchanges: {
    [key in string]: string
  },
  networkProtocols: {
    [key in string]: string
  },
  networkL1Tokens: {
    [key in string]: {
      [key in string]: string
    }
  },
  networkL2TokenIds: {
    [key in string]: Array<number>
  },
  networkL2AgentAddresses: {
    [key in string]: string
  },
  networkL2AgentAccountIds: {
    [key in string]: number
  }
}

export type Config = {
  fastWithdrawConfig: FastWithdrawConfig | undefined
}
