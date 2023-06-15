import React from "react";

import {
  ButtonComponentsMap,
  fnType,
  headerMenuData,
  headerMenuLandingData,
  headerToolBarData as _initHeaderToolBarData,
  SagaStatus,
} from "@loopring-web/common-resources";

import {
  accountReducer,
  useAccount,
  store,
  useNotify,
  accountStaticCallBack,
  btnClickMap,
} from "@loopring-web/core";

import { AccountStep, useOpenModals } from "@loopring-web/component-lib";
import { myLog } from "@loopring-web/common-resources";

import _ from "lodash";

export const useHeader = () => {
  const accountTotal = useAccount();
  const { account, setShouldShow, status: accountStatus } = accountTotal;
  const { setShowAccount } = useOpenModals();
  // const accountState = React.useMemo(() => {
  //   return { account };
  // }, [account]);

  const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.NO_ACCOUNT]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }));
        setShowAccount({ isShow: true, step: AccountStep.NoAccount });
      },
    ],
    [fnType.DEPOSITING]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }));
        setShowAccount({ isShow: true, step: AccountStep.NoAccount });
      },
    ],
    [fnType.NOT_ACTIVE]: [
      function () {
        store.dispatch(accountReducer.changeShowModel({ _userOnModel: true }));
        setShowAccount({ isShow: true, step: AccountStep.NoAccount });
      },
    ],
    [fnType.ACTIVATED]: [
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

  const onWalletBtnConnect = React.useCallback(async () => {
    myLog(`onWalletBtnConnect click: ${account.readyState}`);
    accountStaticCallBack(_btnClickMap, []);
  }, [account, setShouldShow, _btnClickMap]);

  const [headerToolBarData, setHeaderToolBarData] = React.useState<
    typeof _initHeaderToolBarData
  >({ ..._initHeaderToolBarData });

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      const account = store.getState().account;
      setHeaderToolBarData((headerToolBarData) => {
        headerToolBarData[ButtonComponentsMap.WalletConnect] = {
          ...headerToolBarData[ButtonComponentsMap.WalletConnect],
          handleClick: onWalletBtnConnect,
          accountState: { account },
        };
        headerToolBarData[ButtonComponentsMap.ProfileMenu] = {
          ...headerToolBarData[ButtonComponentsMap.ProfileMenu],
          readyState: account.readyState,
        };
        return headerToolBarData;
      });
    }
    // forceUpdate()
  }, [accountStatus, account.readyState]);
  const { notifyMap } = useNotify();
  return {
    headerToolBarData,
    headerMenuData,
    headerMenuLandingData,
    account,
    notifyMap,
  };
};
