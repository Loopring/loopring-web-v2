import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../index";
import { Confirmation } from "./interface";
import { confirm, confirmDefiInvest } from "./reducer";

export const useConfirmation = (): {
  confirmation: Confirmation;
  confirmWrapper: () => void;
  confirmDefiInvest: () => void;
} => {
  const confirmation: Confirmation = useSelector(
    (state: RootState) => state.localStore.confirmation
  );
  const dispatch = useDispatch();

  const confirmWrapper = React.useCallback(() => {
    dispatch(confirm(undefined));
  }, [dispatch]);

  return {
    confirmation,
    confirmWrapper,
    confirmDefiInvest: React.useCallback(() => {
      dispatch(confirmDefiInvest(undefined));
    }, [dispatch]),
  };
};
