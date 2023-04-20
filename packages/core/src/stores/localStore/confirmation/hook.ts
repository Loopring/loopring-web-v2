import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../index";
import { Confirmation } from "./interface";

import {
  confirm,
  confirmedRETHDefiInvest,
  confirmedWSETHDefiInvest,
  confirmDualInvest,
  showDualBeginnerHelp,
  hidDualBeginnerHelp,
  confirmedLRCStakeInvest,
  confirmedBtradeSwap,
} from "./reducer";

export const useConfirmation = (): {
  confirmation: Confirmation;
  confirmWrapper: () => void;
  confirmedRETHDefiInvest: () => void;
  confirmedWSETHDefiInvest: () => void;
  confirmedLRCStakeInvest: () => void;
  confirmDualInvest: () => void;
  confirmedBtradeSwap: () => void;
} => {
  const confirmation: Confirmation = useSelector(
    (state: RootState) => state.localStore.confirmation
  );
  const dispatch = useDispatch();

  return {
    confirmation,
    confirmWrapper: React.useCallback(() => {
      dispatch(confirm(undefined));
    }, [dispatch]),
    confirmDualInvest: React.useCallback(() => {
      dispatch(confirmDualInvest(undefined));
      dispatch(showDualBeginnerHelp(undefined));
      setTimeout(() => {
        dispatch(hidDualBeginnerHelp(undefined));
      }, 5 * 1000);
    }, [dispatch]),
    confirmedRETHDefiInvest: React.useCallback(() => {
      dispatch(confirmedRETHDefiInvest(undefined));
    }, [dispatch]),
    confirmedWSETHDefiInvest: React.useCallback(() => {
      dispatch(confirmedWSETHDefiInvest(undefined));
    }, [dispatch]),
    confirmedLRCStakeInvest: React.useCallback(() => {
      dispatch(confirmedLRCStakeInvest(undefined));
    }, [dispatch]),
    confirmedBtradeSwap: React.useCallback(() => {
      dispatch(confirmedBtradeSwap(undefined));
    }, [dispatch]),
  };
};
