import { useDispatch, useSelector } from "react-redux";
import {
  clearAll,
  clearRedPacketHash,
  updateRedpacketHash,
  updateRedpacketHashProps,
} from "./reducer";
import React from "react";
import { RedpacketHashInfos } from "@loopring-web/common-resources";

export const useRedPacketHistory = (): {
  redPacketHistory: RedpacketHashInfos;
  clearAll: () => void;
  clearRedPacketHash: () => void;
  updateRedpacketHash: (props: updateRedpacketHashProps) => void;
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
    clearRedPacketHash: React.useCallback(
      () => dispatch(clearRedPacketHash(undefined)),
      [dispatch]
    ),
    updateRedpacketHash: React.useCallback(
      (prosp: updateRedpacketHashProps) => dispatch(updateRedpacketHash(prosp)),
      [dispatch]
    ),
  };
};
