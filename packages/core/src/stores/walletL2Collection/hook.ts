import { useDispatch, useSelector } from "react-redux";
import {
  reset,
  socketUpdateBalance,
  statusUnset,
  updateWalletL2Collection,
} from "./reducer";
import { WalletL2CollectionStates } from "./interface";
import React from "react";
import * as loopring_defs from "@loopring-web/loopring-sdk";
import {
  CollectionMeta,
  L2CollectionFilter,
} from "@loopring-web/common-resources";

export function useWalletL2Collection<
  C extends CollectionMeta
>(): WalletL2CollectionStates<C> & {
  updateWalletL2Collection: (props: {
    page?: number;
    filter?: L2CollectionFilter | undefined;
  }) => void;
  socketUpdateBalance: (balance: {
    [key: string]: loopring_defs.UserBalanceInfo;
  }) => void;
  statusUnset: () => void;
  resetL2Collection: () => void;
} {
  const walletL2Collection: WalletL2CollectionStates<C> = useSelector(
    (state: any) => state.walletL2Collection
  );
  const dispatch = useDispatch();

  return {
    ...walletL2Collection,
    resetL2Collection: React.useCallback(() => {
      dispatch(reset(undefined));
    }, [dispatch]),
    statusUnset: React.useCallback(
      () => dispatch(statusUnset(undefined)),
      [dispatch]
    ),
    updateWalletL2Collection: React.useCallback(
      ({
        page,
        filter,
      }: {
        page?: number;
        filter?: L2CollectionFilter | undefined;
      }) => dispatch(updateWalletL2Collection({ page, filter })),
      [dispatch]
    ),
    socketUpdateBalance: React.useCallback(
      (balance: { [key: string]: loopring_defs.UserBalanceInfo }) =>
        dispatch(socketUpdateBalance(balance)),
      [dispatch]
    ),
  };
}
