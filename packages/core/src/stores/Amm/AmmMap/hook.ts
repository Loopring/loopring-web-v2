import { useDispatch, useSelector } from "react-redux";
import { AmmMapStates } from "./interface";
import React from "react";
import { getAmmMap, statusUnset } from "./reducer";
import { RootState } from "../../index";

export const useAmmMap = <
  R extends { [key: string]: any },
  I extends { [key: string]: any }
>(): AmmMapStates<R, I> & {
  getAmmMap: () => void;
  statusUnset: () => void;
} => {
  const ammMap: AmmMapStates<R, I> = useSelector(
    (state: RootState) => state.amm.ammMap
  );
  const dispatch = useDispatch();
  return {
    ...ammMap,
    statusUnset: React.useCallback(
      () => dispatch(statusUnset(undefined)),
      [dispatch]
    ),
    getAmmMap: React.useCallback(
      () => dispatch(getAmmMap(undefined)),
      [dispatch]
    ),
  };
};
