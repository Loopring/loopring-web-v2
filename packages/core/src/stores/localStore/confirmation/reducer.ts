import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice'
import { Confirmation, DualInvestConfirmType } from './interface'

const initialState: Confirmation = {
  confirmed: false,
  confirmedRETHDefiInvest: false,
  confirmedWSETHDefiInvest: false,
  // confirmedDualInvest: false,
  confirmedDualInvestV2: undefined,
  confirmDualAutoInvest: false,
  confirmDualDipInvest: false,
  confirmDualGainInvest: false,

  confirmedLRCStakeInvest: false,
  showDualBeginnerHelp: false,
  confirmedBtradeSwap: false,
  confirmedLeverageETHInvest: false,
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
  // confirmDualInvest,
  confirmDualAutoInvest,
  confirmDualInvestV2,
  confirmedBtradeSwap,
  showDualBeginnerHelp,
  hidDualBeginnerHelp,
  confirmedLeverageETHInvest,
} = confirmationSlice.actions
