import { MapChainId } from "@loopring-web/common-resources"
import { ChainId } from "@loopring-web/loopring-sdk"

export const parseRabbitConfig = (config: any, fromNetwork: string, idIndex: any) => {

  const toNetworks: string[] = config.fromToNetworks[fromNetwork] ?? []
  const toTaikoNetwork = toNetworks.find((net) =>
    [ChainId.TAIKO, ChainId.TAIKOHEKLA].map((id) => MapChainId[id]).includes(net),
  )
  const networkL2TokenIds = config.networkL2TokenIds[fromNetwork]
  const toTaikoNetworkL1Tokens = toTaikoNetwork 
    ? (config.networkL1Tokens[toTaikoNetwork] ?? [])
    : toTaikoNetwork
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
    toTaikoNetwork,
    toTaikoNetworkSupportedTokens,
    toL1SupportedTokens: toL1SupportedTokens as string[]
  }
}