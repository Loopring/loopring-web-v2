import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import { Confirmation } from "./interface";

const initialState: Confirmation = {
  confirmed: false,
  confirmedRETHDefiInvest: false,
  confirmedWSETHDefiInvest: false,
  confirmedDualInvest: false,
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
    confirmDualInvest(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedDualInvest = true;
    },
  },
});

export { confirmationSlice };
export const {
  confirm,
  confirmedRETHDefiInvest,
  confirmedWSETHDefiInvest,
  confirmDualInvest,
} = confirmationSlice.actions;
