import { ActiveAccountProps, useOpenModals } from "@loopring-web/component-lib";

import { useBtnStatus } from "hooks/common/useBtnStatus";

import { useUpdateAccount } from "./useUpdateAccount";
import { useChargeFees } from "../common/useChargeFees";
import { useModalData } from "../../stores/router";

export const useActiveAccount = <T>(): {
  activeAccountProps: ActiveAccountProps<T>;
} => {
  const { btnStatus } = useBtnStatus();
  const { setShowActiveAccount, setShowDeposit } = useOpenModals();

  const { goUpdateAccount } = useUpdateAccount();

  const { updateActiveAccountData, activeAccountValue } = useModalData();
  const { chargeFeeTokenList, isFeeNotEnough, handleFeeChange, feeInfo } =
    useChargeFees({
      isActiveAccount: true,
      requestType: "UPDATE_ACCOUNT_BY_NEW" as any,
      updateData: (feeInfo, chargeFeeList) => {
        updateActiveAccountData({
          ...activeAccountValue,
          fee: feeInfo,
          chargeFeeList:
            chargeFeeList && chargeFeeList.length
              ? chargeFeeList
              : activeAccountValue?.chargeFeeList &&
                activeAccountValue?.chargeFeeList.length
              ? activeAccountValue?.chargeFeeList
              : [],
        });
      },
    });

  const onActiveAccountClick = () => {
    if (activeAccountValue?.fee?.belong && activeAccountValue?.fee?.__raw__) {
      goUpdateAccount({
        isFirstTime: true,
        isReset: false,
        feeInfo: activeAccountValue.fee,
      });
    }
  };

  const activeAccountProps: ActiveAccountProps<any> = {
    onActiveAccountClick,
    activeAccountBtnStatus: btnStatus,
    goToDeposit: () => {
      setShowActiveAccount({ isShow: false });
      setShowDeposit({ isShow: true });
    },
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
  };

  return {
    activeAccountProps,
  };
};
