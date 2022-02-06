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
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const { setShowResetAccount } = useOpenModals();

  const { chargeFeeTokenList, isFeeNotEnough, handleFeeChange, feeInfo } =
    useChargeFees({
      tokenSymbol: "ETH",
      requestType: sdk.OffchainFeeReqType.UPDATE_ACCOUNT,
      updateData: undefined,
    });
  React.useEffect(() => {
    if (isFeeNotEnough) {
      disableBtn();
    } else {
      enableBtn();
    }
  }, [isFeeNotEnough]);

  const { goUpdateAccount } = useUpdateAccount();

  const onResetClick = React.useCallback(() => {
    setShowResetAccount({ isShow: false });
    goUpdateAccount({ isReset: true, feeInfo: feeInfo });
  }, [goUpdateAccount]);

  const resetProps: ResetProps<any> = {
    isFeeNotEnough,
    onResetClick,
    resetBtnStatus: btnStatus,
    feeInfo,
    chargeFeeTokenList,
    handleFeeChange,
  };

  return {
    resetProps: resetProps as ResetProps<T>,
  };
};
