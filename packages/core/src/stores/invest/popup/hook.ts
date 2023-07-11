import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { RootState } from "../../index";

import { PopupStates } from "./interface";
import { setShowLRCStakignPopup, setShowRETHStakignPopup, setShowWSTETHStakignPopup } from "./reducer";

export const usePopup = (): PopupStates & {
  setShowRETHStakignPopup: (v: boolean) => void;
  setShowWSTETHStakignPopup: (v: boolean) => void;
  setShowLRCStakignPopup: (v: boolean) => void;
} => {
  const popup: PopupStates = useSelector(
    (state: RootState) => state.invest.popup
  );
  const dispatch = useDispatch();
  return {
    ...popup,
    setShowRETHStakignPopup: React.useCallback(
      (v) => dispatch(setShowRETHStakignPopup(v)),
      [dispatch]
    ),
    setShowWSTETHStakignPopup: React.useCallback(
      (v) => dispatch(setShowWSTETHStakignPopup(v)),
      [dispatch]
    ),
    setShowLRCStakignPopup: React.useCallback(
      (v) => dispatch(setShowLRCStakignPopup(v)),
      [dispatch]
    ),
  };
};
