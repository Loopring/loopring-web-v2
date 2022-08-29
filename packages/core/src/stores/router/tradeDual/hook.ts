import { useDispatch, useSelector } from "react-redux";
import { updateTradeDual, resetTradeDual } from "./reducer";
import { TradeDual, TradeDualStatus } from "./interface";
import React from "react";

export function useTradeDual<
  C extends { [key: string]: any }
>(): TradeDualStatus<C> & {
  updateTradeDual: (tradeDual: Partial<TradeDual<C>>) => void;
  resetTradeDual: () => void;
} {
  const tradeDualStatus: TradeDualStatus<C> = useSelector(
    (state: any) => state._router_tradeDual
  );
  const dispatch = useDispatch();
  return {
    ...tradeDualStatus,
    updateTradeDual: React.useCallback(
      (tradeDual: Partial<TradeDual<C>>) => {
        dispatch(updateTradeDual(tradeDual));
      },
      [dispatch]
    ),
    resetTradeDual: React.useCallback(() => {
      dispatch(resetTradeDual(undefined));
    }, [dispatch]),
  };
}
