import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { PopupStates } from "./interface";

const initialState: PopupStates = {
  showRETHStakignPopup: false,
  showWSTETHStakignPopup: false,
  showLRCStakignPopup: false,
  confirmationNeeded: true
};
const popupSlice: Slice = createSlice({
  name: "stakingMap",
  initialState,
  reducers: {
    setShowRETHStakignPopup(state: PopupStates, action: PayloadAction<{show: boolean, confirmationNeeded: boolean}>) {
      state.showRETHStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowWSTETHStakignPopup(state: PopupStates, action: PayloadAction<{show: boolean, confirmationNeeded: boolean}>) {
      state.showWSTETHStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowLRCStakignPopup(state: PopupStates, action: PayloadAction<{show: boolean, confirmationNeeded: boolean}>) {
      state.showLRCStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
  },
});
const { setShowRETHStakignPopup, setShowWSTETHStakignPopup, setShowLRCStakignPopup } =
  popupSlice.actions;
export {
  popupSlice,
  setShowRETHStakignPopup, 
  setShowWSTETHStakignPopup,
  setShowLRCStakignPopup
};
