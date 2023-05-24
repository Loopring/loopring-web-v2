import { useDispatch, useSelector } from "react-redux";
import { AmmMapStates } from "./interface";
import React from "react";
import { getAmmMap, statusUnset, updateRealTimeAmmMap } from "./reducer";
import { RootState } from "../../index";
import { LoopringMap } from "@loopring-web/loopring-sdk";
import { AmmPoolStat } from "@loopring-web/loopring-sdk/dist/defs";

export const useAmmMap = <
  R extends { [key: string]: any },
  I extends { [key: string]: any }
>(): AmmMapStates<R, I> & {
  getAmmMap: () => void;
  statusUnset: () => void;
  updateRealTimeAmmMap: (props: {
    ammPoolStats: LoopringMap<AmmPoolStat>;
  }) => void;
} => {
  const ammMap: AmmMapStates<R, I> = useSelector(
    (state: RootState) => state.amm.ammMap
  );
  const dispatch = useDispatch();
  return {
    ...ammMap,
    updateRealTimeAmmMap: React.useCallback(
      ({ ammPoolStats }: { ammPoolStats: LoopringMap<AmmPoolStat> }) => {
        dispatch(updateRealTimeAmmMap({ ammPoolStats }));
      },
      [dispatch]
    ),

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
