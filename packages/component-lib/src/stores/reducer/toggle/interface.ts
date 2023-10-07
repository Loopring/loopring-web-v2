export type ToggleState = {
  order: { enable: boolean; reason?: string }
  joinAmm: { enable: boolean; reason?: string }
  exitAmm: { enable: boolean; reason?: string }
  transfer: { enable: boolean; reason?: string }
  transferNFT: { enable: boolean; reason?: string }
  deposit: { enable: boolean; reason?: string }
  depositNFT: { enable: boolean; reason?: string }
  withdraw: { enable: boolean; reason?: string }
  withdrawNFT: { enable: boolean; reason?: string }
  mintNFT: { enable: boolean; reason?: string }
  deployNFT: { enable: boolean; reason?: string }
  updateAccount: { enable: boolean; reason?: string }
  defiInvest: { enable: boolean; reason?: string }
  WSTETHInvest: { enable: boolean; reason?: string }
  RETHInvest: { enable: boolean; reason?: string }
  dualInvest: { enable: boolean; reason?: string }
  leverageETHInvest: { enable: boolean; reason?: string }
  collectionNFT: { enable: boolean; reason?: string }
  claim: { enable: boolean; reason?: string }
  redPacketNFTV1: { enable: boolean; reason?: string }
  LRCStackInvest: { enable: boolean; reason?: string }
  BTradeInvest: { enable: boolean; reason?: string }
  StopLimit: { enable: boolean; reason?: string }
  VaultInvest: {
    enable: boolean
    reason?: string
  }
  // @ts-ignore
  send: {
    orbiter: string[]
  }
  // @ts-ignore
  receive: {
    layerSwap: string[]
    orbiter: string[]
  }
  CIETHInvest: { enable: boolean; reason?: string }
  redpacket_exclusive: { enable: boolean; reason?: string }
  [key: string]: { enable?: boolean; reason?: string; [key: string]: any }
  dual_reinvest: { enable: boolean; reason?: string }
  whiteList: any
  // @ts-ignore
  isSupperUser: any
}
