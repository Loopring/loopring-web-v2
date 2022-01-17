import React from "react";

import {
  ActiveAccountProps,
  TokenType,
  useOpenModals,
} from "@loopring-web/component-lib";

import {
  AccountStatus,
  FeeInfo,
  SagaStatus,
  WalletMap,
} from "@loopring-web/common-resources";
import { useBtnStatus } from "hooks/common/useBtnStatus";

import { useUpdateAccount } from "./useUpdateAccount";
import * as sdk from "@loopring-web/loopring-sdk";
import { useChargeFees } from "../common/useChargeFees";
import { makeWalletLayer2 } from "../help";
import { updateActiveAccountData } from "../../stores/router";

export const useActiveAccount = <T>(): {
  activeAccountProps: ActiveAccountProps<T>;
} => {
  const { btnStatus } = useBtnStatus();
  const walletMap2 = makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>);
  const { setShowActiveAccount, setShowDeposit } = useOpenModals();

  const { goUpdateAccount } = useUpdateAccount();

  const { chargeFeeTokenList, isFeeNotEnough, handleFeeChange, feeInfo } =
    useChargeFees({
      isActiveAccount: true,
      walletMap: walletMap2,
      requestType: sdk.OffchainFeeReqType.TRANSFER,
      updateData: updateActiveAccountData,
    });

  const onActiveAccountClick = () => {
    goUpdateAccount({
      isFirstTime: true,
      isReset: false,
      feeInfo: feeInfo,
    });
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
