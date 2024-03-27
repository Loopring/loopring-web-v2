import { DualInvestConfirmType } from '@loopring-web/common-resources'

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
  confirmDualDipInvest: boolean
  confirmDualGainInvest: boolean
  showWSTETHStakePopup: boolean
  showRETHStakePopup: boolean
  showLRCStakePopup: boolean
  showLeverageETHPopup: boolean
  showAutoDefault: boolean
  confirmationNeeded: boolean
  confirmedOpenVaultPosition: boolean
}
