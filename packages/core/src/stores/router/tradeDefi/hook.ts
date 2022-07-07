import { useDispatch, useSelector } from "react-redux";
import {
  updateTradeDefi,
  // resetTradeDefi
} from "./reducer";
import { TradeDefi, TradeDefiStatus } from "./interface";
import React from "react";
import { RequireOne } from "@loopring-web/common-resources";

export function useTradeDefi<
  C extends { [key: string]: any }
>(): TradeDefiStatus<C> & {
  updateTradeDefi: (tradeDefi: RequireOne<TradeDefi<C>, "market">) => void;
  // resetTradeDefi: (tradeDefi: TradeDefi<C>) => void;
} {
  const tradeDefiStatus: TradeDefiStatus<C> = useSelector(
    (state: any) => state._router_tradeDefi
  );
  const dispatch = useDispatch();
  return {
    ...tradeDefiStatus,
    updateTradeDefi: React.useCallback(
      (tradeDefi: RequireOne<TradeDefi<C>, "market">) => {
        dispatch(updateTradeDefi(tradeDefi));
      },
      [dispatch]
    ),
    // resetTradeDefi: React.useCallback(
    //   (tradeDefi: Partial<TradeDefi<C>>) => {
    //     dispatch(resetTradeDefi(tradeDefi));
    //   },
    //   [dispatch]
    // ),
  };
}
