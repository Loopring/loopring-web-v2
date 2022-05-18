import {
  AccountStep,
  ResetProps,
  useOpenModals,
} from "@loopring-web/component-lib";

import {
  useBtnStatus,
  useUpdateAccount,
  useChargeFees,
  useModalData,
  makeWalletLayer2,
  useWalletLayer2,
} from "../../index";

import { SagaStatus, WalletMap } from "@loopring-web/common-resources";
import React from "react";

export const useActiveAccount = <T>(): {
  activeAccountProps: ResetProps<T>;
  activeAccountCheckFeeIsEnough: (isRequiredAPI?: boolean) => void;
} => {
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const {
    setShowActiveAccount,
    setShowAccount,
    modals: {
      isShowActiveAccount: { isShow },
    },
  } = useOpenModals();
  const { status: walletLayer2Status } = useWalletLayer2();
  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>)
  );
  const { goUpdateAccount } = useUpdateAccount();
  const { updateActiveAccountData, activeAccountValue } = useModalData();
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useChargeFees({
    isActiveAccount: true,
    requestType: "UPDATE_ACCOUNT_BY_NEW" as any,
    updateData: ({ fee, chargeFeeTokenList, isFeeNotEnough }) => {
      updateActiveAccountData({
        ...activeAccountValue,
        fee,
        isFeeNotEnough,
        chargeFeeList:
          chargeFeeTokenList && chargeFeeTokenList.length
            ? chargeFeeTokenList
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
    checkFeeIsEnough();
  }, []);
  React.useEffect(() => {
    if (walletLayer2Callback && walletLayer2Status === SagaStatus.UNSET) {
      walletLayer2Callback();
    }
  }, [walletLayer2Status]);
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

  const activeAccountProps: ResetProps<any> = {
    onResetClick: onActiveAccountClick,
    isNewAccount: true,
    resetBtnStatus: btnStatus,
    goToDeposit: () => {
      setShowActiveAccount({ isShow: false });
      setShowAccount({ isShow: true, step: AccountStep.AddAssetGateway });
      // setShowDeposit({ isShow: true });
    },
    walletMap,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
  };

  return {
    activeAccountProps,
    activeAccountCheckFeeIsEnough: checkFeeIsEnough,
  };
};
