import { useDispatch, useSelector } from "react-redux";
import { addMarket, addMarkets, clearAll, removeMarket } from "./reducer";
import React from "react";
import { RedpacketHashInfos } from "@loopring-web/common-resources";

export const useRedPacketHistory = (): {
  redPacketHistory: RedpacketHashInfos;
  clearAll: () => void;
  removeMarket: (pair: string) => void;
  addMarket: (pair: string) => void;
  addMarkets: (pair: string[]) => void;
} => {
  const redPacketHistory: RedpacketHashInfos = useSelector(
    (state: any) => state.localStore.redPacketHistory
  );
  const dispatch = useDispatch();
  return {
    redPacketHistory: redPacketHistory,
    clearAll: React.useCallback(
      () => dispatch(clearAll(undefined)),
      [dispatch]
    ),
    removeMarket: React.useCallback(
      (pair) => dispatch(removeMarket(pair)),
      [dispatch]
    ),
    addMarket: React.useCallback(
      (pair) => dispatch(addMarket(pair)),
      [dispatch]
    ),
    addMarkets: React.useCallback(
      (pairs) => dispatch(addMarkets(pairs)),
      [dispatch]
    ),
  };
};
