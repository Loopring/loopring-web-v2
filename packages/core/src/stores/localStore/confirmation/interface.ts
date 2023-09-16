export enum DualInvestConfirmType {
  USDCOnly = 'USDCOnly',
  all = 'all',
}

export interface Confirmation {
  confirmed: boolean
  confirmedRETHDefiInvest: boolean
  confirmedWSETHDefiInvest: boolean
  // confirmedDualInvest: boolean
  confirmedDualInvestV2: DualInvestConfirmType | undefined
  confirmDualAutoInvest: boolean
  showDualBeginnerHelp: boolean
  confirmedLRCStakeInvest: boolean
  confirmedBtradeSwap: boolean
  confirmedLeverageETHInvest: boolean
}
