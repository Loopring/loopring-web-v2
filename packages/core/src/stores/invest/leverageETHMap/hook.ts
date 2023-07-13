import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { LeverageETHMap, RootState } from "../../index";
import { updateLeverageETHMap } from "./reducer";
import { LeverageETHMapStates } from "./interface";

export const useLeverageETHMap = (): LeverageETHMapStates & {
  // getLeverageETHMap: () => void;
  // statusUnset: () => void;
  updateLeverageETHMap: (props: { leverageETHMap: LeverageETHMap }) => void;
} => {
  const leverageETHMap: LeverageETHMapStates = useSelector(
    (state: RootState) => state.invest.leverageETHMap
  );
  const dispatch = useDispatch();
  return {
    ...leverageETHMap,
    // statusUnset: React.useCallback(
    //   () => dispatch(statusUnset(undefined)),
    //   [dispatch]
    // ),
    // getLeverageETHMap: React.useCallback(
    //   () => dispatch(getLeverageETHMap(undefined)),
    //   [dispatch]
    // ),
    updateLeverageETHMap: React.useCallback(
      ({ leverageETHMap }: { leverageETHMap: LeverageETHMap }) => dispatch(updateLeverageETHMap({leverageETHMap: leverageETHMap})),
      [dispatch]
    ),
  };
};
