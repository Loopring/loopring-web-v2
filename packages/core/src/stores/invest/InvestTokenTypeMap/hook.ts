import { InvestTokenTypeMap, InvestTokenTypeMapStates } from "./interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../index";
import React from "react";
import { getInvestTokenTypeMap } from "./reducer";

export const useInvestTokenTypeMap = (): InvestTokenTypeMapStates & {
  getInvestTokenTypeMap: () => void;
} => {
  const investTokenTypeMap: InvestTokenTypeMap = useSelector(
    (state: RootState) => state.invest.investTokenTypeMap
  );
  const dispatch = useDispatch();
  return {
    investTokenTypeMap,
    getInvestTokenTypeMap: React.useCallback(
      () => dispatch(getInvestTokenTypeMap(undefined)),
      [dispatch]
    ),
  };
};
