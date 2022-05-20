import {
  AccountStatus,
  FeeInfo,
  SagaStatus,
  WalletMap,
} from "@loopring-web/common-resources";
import {
  makeWalletLayer2,
  store,
  useAccount,
  useWalletLayer2,
} from "../../index";
import {
  AccountStep,
  CheckActiveStatusProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import { connectProvides } from "@loopring-web/web3-provider";
import * as sdk from "@loopring-web/loopring-sdk";

export function isAccActivated() {
  return store.getState().account.readyState === AccountStatus.ACTIVATED;
}

export const useCheckActiveStatus = <C extends FeeInfo>({
  // isFeeNotEnough,
  checkFeeIsEnough,
  chargeFeeTokenList,
  onDisconnect,
  isDepositing,
}: // isShow,
{
  // isShow: boolean;
  isDepositing: boolean;
  onDisconnect: () => void;
  isFeeNotEnough: boolean;
  chargeFeeTokenList: C[];
  checkFeeIsEnough: () => void;
}): { checkActiveStatusProps: CheckActiveStatusProps<C> } => {
  const { account } = useAccount();
  const { status: walletLayer2Status, updateWalletLayer2 } = useWalletLayer2();
  const {
    setShowAccount,
    setShowActiveAccount,
    modals: { isShowAccount },
  } = useOpenModals();
  const [know, setKnow] = React.useState(false);
  const [knowDisable, setKnowDisable] = React.useState(true);
  const [isAddressContract, setIsAddressContract] =
    React.useState<undefined | boolean>(undefined);
  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>)
  );
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState(true);

  const goUpdateAccount = () => {
    setShowAccount({ isShow: false });
    setShowActiveAccount({ isShow: true });
  };
  const onIKnowClick = () => {
    if (account.isContract) {
      setKnow(true);
    } else if (isFeeNotEnough) {
      setKnow(true);
    } else {
      goUpdateAccount();
    }
  };
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
    setIsFeeNotEnough(
      walletMap
        ? chargeFeeTokenList.findIndex((item) => {
            if (walletMap[item.belong] && walletMap[item.belong]?.count) {
              return sdk
                .toBig(walletMap[item.belong]?.count ?? 0)
                .gte(sdk.toBig(item.fee.toString().replace(",", "")));
            }
            return;
          }) === -1
        : false
    );
    setKnowDisable(false);
  }, [chargeFeeTokenList]);

  React.useEffect(() => {
    if (walletLayer2Callback && walletLayer2Status === SagaStatus.UNSET) {
      walletLayer2Callback();
      checkFeeIsEnough();
    }
  }, [walletLayer2Status]);

  const init = React.useCallback(async () => {
    setKnowDisable(true);
    const isContract = await sdk.isContract(
      connectProvides.usedWeb3,
      account.accAddress
    );
    setIsAddressContract(isContract);
    updateWalletLayer2();
  }, [account.accAddress, updateWalletLayer2]);

  React.useEffect(() => {
    if (
      isShowAccount.isShow &&
      isShowAccount.step === AccountStep.CheckingActive
    ) {
      init();
      setKnow(false);
    }
  }, [isShowAccount.step, isShowAccount.isShow]);

  const checkActiveStatusProps: CheckActiveStatusProps<C> = {
    know,
    knowDisable,
    onIKnowClick,
    isDepositing,
    goDisconnect: onDisconnect,
    account: { ...account, isContract: isAddressContract },
    chargeFeeTokenList,
    goSend: () => {
      setShowAccount({
        isShow: true,
        step: AccountStep.AddAssetGateway,
      });
    },
    walletMap,
    isFeeNotEnough,
  };
  return { checkActiveStatusProps };
};
