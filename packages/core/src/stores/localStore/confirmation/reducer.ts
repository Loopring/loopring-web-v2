import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import { Confirmation } from "./interface";

const initialState: Confirmation = {
  confirmed: false,
  confirmedRETHDefiInvest: false,
  confirmedWSETHDefiInvest: false,
  confirmedDualInvest: false,
  confirmedDualInvestV2: false,
  confirmedLRCStakeInvest: false,
  showDualBeginnerHelp: false,
};

const confirmationSlice: Slice<Confirmation> = createSlice<
  Confirmation,
  SliceCaseReducers<Confirmation>,
  "confirmation"
>({
  name: "confirmation",
  initialState,
  reducers: {
    confirm(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmed = true;
    },
    confirmedRETHDefiInvest(
      state: Confirmation,
      _action: PayloadAction<string>
    ) {
      state.confirmedRETHDefiInvest = true;
    },
    confirmedWSETHDefiInvest(
      state: Confirmation,
      _action: PayloadAction<string>
    ) {
      state.confirmedWSETHDefiInvest = true;
    },
    confirmedLRCStakeInvest(
      state: Confirmation,
      _action: PayloadAction<string>
    ) {
      state.confirmedLRCStakeInvest = true;
    },
    confirmDualInvest(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedDualInvest = true;
    },
    confirmDualInvestV2(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedDualInvestV2 = true;
    },
    showDualBeginnerHelp(state: Confirmation, _action: PayloadAction<string>) {
      state.showDualBeginnerHelp = true;
    },
    hidDualBeginnerHelp(state: Confirmation, _action: PayloadAction<string>) {
      state.showDualBeginnerHelp = false;
    },
  },
});

export { confirmationSlice };
export const {
  confirm,
  confirmedRETHDefiInvest,
  confirmedWSETHDefiInvest,
  confirmedLRCStakeInvest,
  confirmDualInvest,
  confirmDualInvestV2,
  showDualBeginnerHelp,
  hidDualBeginnerHelp,
} = confirmationSlice.actions;
