import React from "react";

import { ResetProps, useOpenModals } from "@loopring-web/component-lib";
import { FeeInfo } from "@loopring-web/common-resources";
import { useBtnStatus, useChargeFees } from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";
import { useUpdateAccount } from "./useUpdateAccount";

export const useReset = <T extends FeeInfo>(): {
  resetProps: ResetProps<T>;
} => {
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const {
    setShowResetAccount,
    modals: {
      isShowResetAccount: { isShow },
    },
  } = useOpenModals();

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useChargeFees({
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

  React.useEffect(() => {
    if (isShow) {
      checkFeeIsEnough();
    }
  }, [isShow]);

  const { goUpdateAccount } = useUpdateAccount();

  const onResetClick = React.useCallback(() => {
    setShowResetAccount({ isShow: false });
    goUpdateAccount({ isReset: true, feeInfo: feeInfo });
  }, [goUpdateAccount, feeInfo]);

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
