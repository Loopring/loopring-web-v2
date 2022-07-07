import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { RootState } from "../../index";
import { getDefiMap, statusUnset } from "./reducer";
import { DefiMapStates } from "./interface";

export const useDefiMap = (): DefiMapStates & {
  getDefiMap: () => void;
  statusUnset: () => void;
} => {
  const defiMap: DefiMapStates = useSelector(
    (state: RootState) => state.invest.defiMap
  );
  const dispatch = useDispatch();
  return {
    ...defiMap,
    statusUnset: React.useCallback(
      () => dispatch(statusUnset(undefined)),
      [dispatch]
    ),
    getDefiMap: React.useCallback(
      () => dispatch(getDefiMap(undefined)),
      [dispatch]
    ),
  };
};
