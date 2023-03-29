import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { RootState } from "../../index";
import { getCexMap, statusUnset } from "./reducer";
import { CexMap, CexMapStates } from "./interface";

export const useCexMap = (): CexMapStates & {
  getCexMap: () => void;
  statusUnset: () => void;
  updateCexSyncMap: (props: { cexMap: CexMap }) => void;
} => {
  const cexMap: CexMapStates = useSelector(
    (state: RootState) => state.invest.cexMap
  );
  const dispatch = useDispatch();
  return {
    ...cexMap,
    statusUnset: React.useCallback(
      () => dispatch(statusUnset(undefined)),
      [dispatch]
    ),
    getCexMap: React.useCallback(
      () => dispatch(getCexMap(undefined)),
      [dispatch]
    ),
    updateCexSyncMap: React.useCallback(
      ({ cexMap }: { cexMap: CexMap }) => dispatch(getCexMap(cexMap)),
      [dispatch]
    ),
  };
};
