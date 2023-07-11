import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { PopupStates } from "./interface";

const initialState: PopupStates = {
  showRETHStakignPopup: false,
  showWSTETHStakignPopup: false,
  showLRCStakignPopup: false,
};
const popupSlice: Slice = createSlice({
  name: "stakingMap",
  initialState,
  reducers: {
    setShowRETHStakignPopup(state: PopupStates, action: PayloadAction<boolean>) {
      state.showRETHStakignPopup = action.payload
    },
    setShowWSTETHStakignPopup(state: PopupStates, action: PayloadAction<boolean>) {
      state.showWSTETHStakignPopup = action.payload
    },
    setShowLRCStakignPopup(state: PopupStates, action: PayloadAction<boolean>) {
      state.showLRCStakignPopup = action.payload
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
