import React from "react";

import { ResetProps, useOpenModals } from "@loopring-web/component-lib";
import { FeeInfo } from "@loopring-web/common-resources";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useChargeFees } from "hooks/common/useChargeFees";
import * as sdk from "@loopring-web/loopring-sdk";
import { useUpdateAccount } from "./useUpdateAccount";
import { makeWalletLayer2 } from "../help";

export const useReset = <T extends FeeInfo>(): {
  resetProps: ResetProps<T>;
} => {
  const walletMap = makeWalletLayer2(true).walletMap ?? {};
  const { btnStatus } = useBtnStatus();
  const {
    modals: { isShowResetAccount },
    setShowResetAccount,
  } = useOpenModals();

  const { chargeFeeTokenList, isFeeNotEnough, handleFeeChange, feeInfo } =
    useChargeFees({
      tokenSymbol: "ETH",
      walletMap,
      requestType: sdk.OffchainFeeReqType.UPDATE_ACCOUNT,
      updateData: undefined,
    });

  const { goUpdateAccount } = useUpdateAccount();

  const onResetClick = React.useCallback(() => {
    setShowResetAccount({ isShow: false });
    goUpdateAccount({ isReset: true, feeInfo: feeInfo });
  }, [goUpdateAccount]);

  const resetProps: ResetProps<T> = {
    isFeeNotEnough,
    onResetClick,
    resetBtnStatus: btnStatus,
    feeInfo: feeInfo as T,
    chargeFeeTokenList: chargeFeeTokenList as T[],
    handleFeeChange,
  };

  return {
    resetProps: resetProps as ResetProps<T>,
  };
};
