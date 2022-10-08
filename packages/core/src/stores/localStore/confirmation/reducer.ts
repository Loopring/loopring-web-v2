import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import { Confirmation } from "./interface";

const initialState: Confirmation = {
  confirmed: false,
  confirmedDefiInvest: false,
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
    confirmDefiInvest(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedDefiInvest = true;
    },
    confirmDualInvest(state: Confirmation, _action: PayloadAction<string>) {
      state.confirmedDualInvest = true;
    },
  },
});

export { confirmationSlice };
export const { confirm, confirmDefiInvest, confirmDualInvest } =
  confirmationSlice.actions;
