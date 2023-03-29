import { useDispatch, useSelector } from "react-redux";
import {
  updateTradeStack,
  resetTradeStack,
  updateRedeemStack,
  resetRedeemStack,
} from "./reducer";
import { RedeemStackStatus, TradeStackStatus } from "./interface";
import React from "react";
import { RedeemStack, TradeStack } from "@loopring-web/common-resources";

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

export function useRedeemStack<
  C extends { [key: string]: any }
>(): RedeemStackStatus<C> & {
  updateRedeemStack: (RedeemStack: Partial<RedeemStack<C>>) => void;
  resetRedeemStack: () => void;
} {
  const redeemStackStatus: RedeemStackStatus<C> = useSelector(
    (state: any) => state._router_redeemStack
  );
  const dispatch = useDispatch();
  return {
    ...redeemStackStatus,
    updateRedeemStack: React.useCallback(
      (redeemStack: Partial<RedeemStack<C>>) => {
        dispatch(updateRedeemStack(redeemStack));
      },
      [dispatch]
    ),
    resetRedeemStack: React.useCallback(() => {
      dispatch(resetRedeemStack(undefined));
    }, [dispatch]),
  };
}
