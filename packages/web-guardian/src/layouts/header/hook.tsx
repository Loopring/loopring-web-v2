import React from "react";

import {
  GuardianToolBarComponentsMap,
  fnType,
  headerGuardianToolBarData,
  headerMenuLandingData,
  myLog,
  NetworkMap,
} from "@loopring-web/common-resources";

import {
  accountReducer,
  accountStaticCallBack,
  btnClickMap,
  store,
  useAccount,
  useNotify,
  useSystem,
} from "@loopring-web/core";

import {
  AccountStep,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";

import _ from "lodash";

export const useHeader = () => {
  const accountTotal = useAccount();
  const { account, setShouldShow, status: accountStatus } = accountTotal;
  const { chainId, updateSystem } = useSystem();
  // const { isTaikoTest, isShowTestToggle, setIsShowTestToggle } = useSettings();

  const { setShowAccount } = useOpenModals();
  const accountState = React.useMemo(() => {
    return { account };
  }, [account]);

  const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.ACTIVATED]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }));
        store.dispatch(
          setShowAccount({ isShow: true, step: AccountStep.HadAccount })
        );
      },
    ],
    [fnType.NO_ACCOUNT]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }));
        store.dispatch(
          setShowAccount({ isShow: true, step: AccountStep.HadAccount })
        );
      },
    ],
    [fnType.DEPOSITING]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }));
        store.dispatch(
          setShowAccount({ isShow: true, step: AccountStep.HadAccount })
        );
      },
    ],
    [fnType.NOT_ACTIVE]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }));
        store.dispatch(
          setShowAccount({ isShow: true, step: AccountStep.HadAccount })
        );
      },
    ],
    [fnType.LOCKED]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }));
        store.dispatch(
          setShowAccount({ isShow: true, step: AccountStep.HadAccount })
        );
      },
    ],
  });
  const onkeypress = (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && e.code == "KeyX") {
      console.log(e.altKey && e.shiftKey && e.code && e.timeStamp);
    }
  };
  const onWalletBtnConnect = React.useCallback(async () => {
    myLog(`onWalletBtnConnect click: ${account.readyState}`);
    accountStaticCallBack(_btnClickMap, []);
  }, [account, setShouldShow, _btnClickMap]);
  const [headerToolBarData, setHeaderToolBarData] = React.useState<
    typeof headerGuardianToolBarData
  >(() => {
    headerGuardianToolBarData[GuardianToolBarComponentsMap.Notification] = {
      ...headerGuardianToolBarData[GuardianToolBarComponentsMap.Notification],
    };
    // headerGuardianToolBarData[GuardianToolBarComponentsMap.TestNet] = {
    //   ...headerGuardianToolBarData[GuardianToolBarComponentsMap.TestNet],
    //   onTestOpen: (isTestNet: boolean) => {
    //     const chainId = store.getState().system.chainId;
    //     updateSystem({ chainId });
    //   },
    //   isShow: (chainId as any) === ChainIdExtends["TAIKO"],
    // };
    headerGuardianToolBarData[GuardianToolBarComponentsMap.WalletConnect] = {
      ...headerGuardianToolBarData[GuardianToolBarComponentsMap.WalletConnect],
      accountState,
      isLayer1Only: true,
      handleClick: onWalletBtnConnect,
    };
    return headerGuardianToolBarData;
  });
  React.useEffect(() => {
    setHeaderToolBarData((headerToolBarData) => {
      // myLog("isTestNet", isTaikoTest, chainId);
      // headerToolBarData[GuardianToolBarComponentsMap.TestNet] = {
      //   ...headerToolBarData[GuardianToolBarComponentsMap.TestNet],
      //   // isShow: (chainId as any) == ChainIdExtends["TAIKO"],
      // };
      return headerToolBarData;
    });
  }, [chainId]);

  React.useEffect(() => {
    if (accountStatus && accountStatus === "UNSET") {
      setHeaderToolBarData((headerToolBarData) => {
        headerToolBarData[GuardianToolBarComponentsMap.WalletConnect] = {
          ...headerToolBarData[GuardianToolBarComponentsMap.WalletConnect],
          isLayer1Only: true,
          accountState,
        };
        return headerToolBarData;
      });
    }
    // forceUpdate()
  }, [accountStatus, account.readyState]);
  const { notifyMap } = useNotify();

  return {
    headerToolBarData,
    headerMenuLandingData,
    account,
    notifyMap,
    onkeypress,
  };
};
