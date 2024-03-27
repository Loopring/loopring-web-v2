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
  showDualBeginnerHelp: false,
  showRETHStakePopup: false,
  showWSTETHStakePopup: false,
  showLRCStakePopup: false,
  showLeverageETHPopup: false,
  confirmationNeeded: true,
  showAutoDefault: false,
  confirmedOpenVaultPosition: false,
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
    setShowRETHStakePopup(
      state: Confirmation,
      action: PayloadAction<{ isShow: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showRETHStakePopup = action.payload.isShow
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowWSTETHStakePopup(
      state: Confirmation,
      action: PayloadAction<{ isShow: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showWSTETHStakePopup = action.payload.isShow
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowLRCStakePopup(
      state: Confirmation,
      action: PayloadAction<{ isShow: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showLRCStakePopup = action.payload.isShow
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowLeverageETHPopup(
      state: Confirmation,
      action: PayloadAction<{ isShow: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showLeverageETHPopup = action.payload.isShow
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowAutoDefault(state: Confirmation, action: PayloadAction<{ show: boolean }>) {
      state.showAutoDefault = action.payload.show
    },
    setConfirmedOpenVaultPosition(state: Confirmation, _: PayloadAction) {
      state.confirmedOpenVaultPosition = true
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
  setShowRETHStakePopup,
  setShowWSTETHStakePopup,
  setShowLRCStakePopup,
  setShowLeverageETHPopup,
  setShowAutoDefault,
  setConfirmedOpenVaultPosition
} = confirmationSlice.actions
