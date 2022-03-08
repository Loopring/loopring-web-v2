import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  ModalStatePlayLoad,
  setShowDeposit,
  setShowNFTDeposit,
  setShowNFTTransfer,
  setShowNFTWithdraw,
  setShowResetAccount,
  setShowTransfer,
  setShowWithdraw,
  Transaction,
} from "@loopring-web/component-lib";

import { useAccount } from "stores/account";
import { NFTWholeINFO } from "@loopring-web/common-resources";

export function useModals() {
  const dispatch = useDispatch();
  const {
    account: { readyState },
  } = useAccount();
  const { t } = useTranslation("common");
  const showDeposit = React.useCallback(
    ({
      isShow,
      symbol,
      partner,
    }: ModalStatePlayLoad & Transaction & { partner?: boolean }) =>
      dispatch(
        setShowDeposit({
          isShow,
          symbol,
          partner,
        })
      ),
    [dispatch]
  );
  const showTransfer = React.useCallback(
    ({ isShow, symbol }: ModalStatePlayLoad & Transaction) =>
      dispatch(
        setShowTransfer({
          isShow,
          symbol,
        })
      ),
    [dispatch]
  );
  const showWithdraw = React.useCallback(
    ({ isShow, symbol }: ModalStatePlayLoad & Transaction) =>
      dispatch(
        setShowWithdraw({
          isShow,
          symbol,
        })
      ),
    [dispatch]
  );
  const showResetAccount = React.useCallback(
    (isShow: boolean) =>
      dispatch(
        setShowResetAccount({
          isShow,
        })
      ),
    [dispatch]
  );
  const showNFTTransfer = React.useCallback(
    ({ isShow, ...rest }: ModalStatePlayLoad & Partial<NFTWholeINFO>) =>
      dispatch(setShowNFTTransfer({ isShow, ...rest })),
    [dispatch]
  );
  const showNFTDeposit = React.useCallback(
    ({ isShow, ...rest }: ModalStatePlayLoad & Partial<NFTWholeINFO>) =>
      dispatch(setShowNFTDeposit({ isShow, ...rest })),
    [dispatch]
  );
  const showNFTWithdraw = React.useCallback(
    ({ isShow, ...rest }: ModalStatePlayLoad & Partial<NFTWholeINFO>) =>
      dispatch(setShowNFTWithdraw({ isShow, ...rest })),
    [dispatch]
  );

  return {
    showDeposit,
    showTransfer,
    showWithdraw,
    showResetAccount,
    showNFTTransfer,
    showNFTDeposit,
    showNFTWithdraw,
    // ShowResetAccount,
  };
}
