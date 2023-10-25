import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { Confirmation } from './interface'
import { DualInvestConfirmType } from '@loopring-web/common-resources'

const initialState: Confirmation = {
  confirmed: false,
  confirmedRETHDefiInvest: false,
  confirmedWSETHDefiInvest: false,
  confirmedDualInvestV2: undefined,
  confirmDualAutoInvest: false,
  confirmDualDipInvest: false,
  confirmDualGainInvest: false,
  confirmedLRCStakeInvest: false,
  confirmedBtradeSwap: false,
  confirmedLeverageETHInvest: false,
  confirmedVault: false,
  showDualBeginnerHelp: false,
  showRETHStakignPopup: false,
  showWSTETHStakignPopup: false,
  showLRCStakignPopup: false,
  showLeverageETHPopup: false,
  confirmationNeeded: true,
}

const confirmationSlice: Slice<Confirmation> = createSlice<
  Confirmation,
  SliceCaseReducers<Confirmation>,
  'confirmation'
>({
  name: 'confirmation',
  initialState,
  reducers: {
    confirm(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmed = true
    },
    confirmedRETHDefiInvest(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedRETHDefiInvest = true
    },
    confirmedWSETHDefiInvest(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedWSETHDefiInvest = true
    },
    confirmedLRCStakeInvest(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedLRCStakeInvest = true
    },
    confirmDualAutoInvest(state: Confirmation, _action: PayloadAction<undefined>) {
      state.confirmDualAutoInvest = true
    },
    confirmDualDipInvest(state: Confirmation, _action: PayloadAction<undefined>) {
      state.confirmDualDipInvest = true
    },
    confirmDualGainInvest(state: Confirmation, _action: PayloadAction<undefined>) {
      state.confirmDualGainInvest = true
    },
    confirmDualInvestV2(
      state: Confirmation,
      _action: PayloadAction<{ level: DualInvestConfirmType | undefined }>,
    ) {
      state.confirmedDualInvestV2 = _action.payload?.level
    },
    confirmedBtradeSwap(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedBtradeSwap = true
    },
    showDualBeginnerHelp(state: Confirmation, _action: PayloadAction<string>) {
      state.showDualBeginnerHelp = true
    },
    hidDualBeginnerHelp(state: Confirmation, _action: PayloadAction<string>) {
      state.showDualBeginnerHelp = false
    },
    confirmedLeverageETHInvest(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedLeverageETHInvest = true
    },
    confirmedVault(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedVault = true
    },
    setShowRETHStakignPopup(
      state: Confirmation,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showRETHStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowWSTETHStakignPopup(
      state: Confirmation,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showWSTETHStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowLRCStakingPopup(
      state: Confirmation,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showLRCStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowLeverageETHPopup(
      state: Confirmation,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showLeverageETHPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
  },
})

export { confirmationSlice }
export const {
  confirm,
  confirmedRETHDefiInvest,
  confirmedWSETHDefiInvest,
  confirmedLRCStakeInvest,
  confirmDualDipInvest,
  confirmDualGainInvest,
  confirmDualAutoInvest,
  confirmDualInvestV2,
  confirmedBtradeSwap,
  showDualBeginnerHelp,
  hidDualBeginnerHelp,
  confirmedLeverageETHInvest,
  confirmedVault,
  setShowRETHStakignPopup,
  setShowWSTETHStakignPopup,
  setShowLRCStakingPopup,
  setShowLeverageETHPopup,
} = confirmationSlice.actions
