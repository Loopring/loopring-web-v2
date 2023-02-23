import { useDispatch, useSelector } from "react-redux";
import { updateTradeStack, resetTradeStack } from "./reducer";
import { TradeStackStatus } from "./interface";
import React from "react";
import { TradeStack } from "@loopring-web/common-resources";

export function useTradeStack<
  C extends { [key: string]: any }
>(): TradeStackStatus<C> & {
  updateTradeStack: (tradeStack: Partial<TradeStack<C>>) => void;
  resetTradeStack: () => void;
} {
  const tradeStackStatus: TradeStackStatus<C> = useSelector(
    (state: any) => state._router_tradeStack
  );
  const dispatch = useDispatch();
  return {
    ...tradeStackStatus,
    updateTradeStack: React.useCallback(
      (tradeStack: Partial<TradeStack<C>>) => {
        dispatch(updateTradeStack(tradeStack));
      },
      [dispatch]
    ),
    resetTradeStack: React.useCallback(() => {
      dispatch(resetTradeStack(undefined));
    }, [dispatch]),
  };
}
