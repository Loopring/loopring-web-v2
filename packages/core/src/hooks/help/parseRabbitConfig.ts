import { MapChainId } from "@loopring-web/common-resources"
import { ChainId } from "@loopring-web/loopring-sdk"

export const parseRabbitConfig = (
  config: any,
  fromNetwork: string,
  idIndex: any,
): {
  toTaikoNetwork: string | undefined
  toTaikoNetworkSupportedTokens: string[]
  toL1SupportedTokens: string[]
} => {
  if (!config)
    return {
      toTaikoNetwork: undefined,
      toTaikoNetworkSupportedTokens: [],
      toL1SupportedTokens: [],
    }
  const toNetworks: string[] = config.fromToNetworks[fromNetwork] ?? []
  const toTaikoNetwork = toNetworks.find((net) =>
    [ChainId.TAIKO, ChainId.TAIKOHEKLA].map((id) => MapChainId[id]).includes(net),
  )
  const networkL2TokenIds = config.networkL2TokenIds[fromNetwork] ?? []
  const toTaikoNetworkL1Tokens = toTaikoNetwork
    ? config.networkL1Tokens[toTaikoNetwork] ?? {}
    : {}
  const toSelfL1Tokens = config.networkL1Tokens[fromNetwork]
  const toTaikoNetworkSupportedTokens = networkL2TokenIds
    .map((id: number) => {
      return idIndex[id]
    })
    .filter((symbol) => {
      return toTaikoNetworkL1Tokens[symbol]
    })
  const toL1SupportedTokens = networkL2TokenIds
    .map((id: number) => {
      return idIndex[id]
    })
    .filter((symbol) => {
      return toSelfL1Tokens[symbol]
    })

  return {
    toTaikoNetwork: toTaikoNetwork,
    toTaikoNetworkSupportedTokens,
    toL1SupportedTokens: toL1SupportedTokens as string[],
  }
}


export const parseRabbitConfig2 = (
  config: any,
  fromNetwork: string,
  fromNetworkIdIndex: any,
): {
  toOtherNetworks: {
    network: string
    supportedTokens: string[]
  }[]
  agentId?: number
  agentAddr?: string
  exchange?: string
} => {
  if (!config)
    return {
      toOtherNetworks: [],
    }
  const toNetworks: string[] = config.fromToNetworks[fromNetwork] ?? []

  const toOtherNetworks = toNetworks.filter(otherNetwork => otherNetwork !== fromNetwork).map((otherNetwork) => {
    const networkL2TokenIds = config.networkL2TokenIds[fromNetwork] ?? []
    const toOtherNetworkL1Tokens = config.networkL1Tokens[otherNetwork] ?? {}
    const supportedTokens = networkL2TokenIds
      .map((id: number) => {
        return fromNetworkIdIndex[id]
      })
      .filter((symbol) => {
        return toOtherNetworkL1Tokens[symbol]
      })
    
    return {
      network: otherNetwork,
      supportedTokens,
      // agentId,
      // agentAddr,
      // exchange,
    }
  })
  const agentId = config.networkL2AgentAccountIds[fromNetwork]
  const agentAddr = config.networkL2AgentAddresses[fromNetwork]
  const exchange = config.networkExchanges[fromNetwork]
  return {
    toOtherNetworks,
    agentId,
    agentAddr,
    exchange,
  }
}