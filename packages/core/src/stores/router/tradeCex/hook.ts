import { useDispatch, useSelector } from "react-redux";
import { resetCexSwap, updateCexTrade } from "./reducer";
import { TradeCex, TradeCexStatus } from "./interface";
import React from "react";

export function useTradeCex(): TradeCexStatus & {
  updateTradeCex: (tradeCex: Partial<TradeCex>) => void;
  resetTradeCex: () => void;
} {
  const tradeCexStatus: TradeCexStatus = useSelector(
    (state: any) => state._router_tradeCex
  );
  const dispatch = useDispatch();
  return {
    ...tradeCexStatus,
    updateTradeCex: React.useCallback(
      (tradeCex: Partial<TradeCex>) => {
        dispatch(updateCexTrade(tradeCex));
      },
      [dispatch]
    ),
    resetTradeCex: React.useCallback(() => {
      dispatch(resetCexSwap(undefined));
    }, [dispatch]),
  };
}
