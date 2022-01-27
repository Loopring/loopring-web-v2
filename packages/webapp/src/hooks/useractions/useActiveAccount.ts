import { ActiveAccountProps, useOpenModals } from "@loopring-web/component-lib";

import { useBtnStatus } from "hooks/common/useBtnStatus";

import { useUpdateAccount } from "./useUpdateAccount";
import { useChargeFees } from "../common/useChargeFees";
import { useModalData } from "../../stores/router";
import { makeWalletLayer2 } from "../help";
import { SagaStatus, WalletMap } from "@loopring-web/common-resources";
import React from "react";
import { useWalletLayer2 } from "../../stores/walletLayer2";

export const useActiveAccount = <T>(): {
  activeAccountProps: ActiveAccountProps<T>;
} => {
  const { btnStatus } = useBtnStatus();
  const { setShowActiveAccount, setShowDeposit } = useOpenModals();
  const { status: walletLayer2Status } = useWalletLayer2();

  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>)
  );
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
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
  }, []);
  React.useEffect(() => {
    if (walletLayer2Callback && walletLayer2Status === SagaStatus.UNSET) {
      walletLayer2Callback();
    }
  }, [walletLayer2Status]);
  const onActiveAccountClick = () => {
    if (activeAccountValue?.fee?.belong && activeAccountValue?.fee?.__raw__) {
      setShowActiveAccount({ isShow: false });
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
    walletMap,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
  };

  return {
    activeAccountProps,
  };
};
