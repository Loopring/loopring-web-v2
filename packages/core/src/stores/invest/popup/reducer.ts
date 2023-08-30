import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PopupStates } from './interface'

const initialState: PopupStates = {
  showRETHStakignPopup: false,
  showWSTETHStakignPopup: false,
  showLRCStakignPopup: false,
  showLeverageETHPopup: false,
  confirmationNeeded: true,
  showVaultPopup: false,
}
const popupSlice: Slice = createSlice({
  name: 'stakingMap',
  initialState,
  reducers: {
    setShowRETHStakignPopup(
      state: PopupStates,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showRETHStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowWSTETHStakignPopup(
      state: PopupStates,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showWSTETHStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowLRCStakignPopup(
      state: PopupStates,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showLRCStakignPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowLeverageETHPopup(
      state: PopupStates,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showLeverageETHPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
    setShowVaultPopup(
      state: PopupStates,
      action: PayloadAction<{ show: boolean; confirmationNeeded: boolean }>,
    ) {
      state.showVaultPopup = action.payload.show
      state.confirmationNeeded = action.payload.confirmationNeeded
    },
  },
})
export const {
  setShowRETHStakignPopup,
  setShowWSTETHStakignPopup,
  setShowLRCStakignPopup,
  setShowLeverageETHPopup,
  setShowVaultPopup,
} = popupSlice.actions
export { popupSlice }
