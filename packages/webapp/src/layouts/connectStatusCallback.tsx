import store from "../stores";
import {
  AccountStep,
  Button,
  setShowAccount,
  setShowConnect,
  useOpenModals,
  WalletConnectStep,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  fnType,
  i18n,
  LoadingIcon,
  SagaStatus,
} from "@loopring-web/common-resources";
import { changeShowModel, useAccount } from "stores/account";
import { accountServices } from "services/account/accountServices";
import { myLog } from "@loopring-web/common-resources";
import { unlockAccount } from "../services/account/unlockAccount";
import { withTranslation } from "react-i18next";
import React from "react";
import _ from "lodash";

export const accountStaticCallBack = (
  onclickMap: { [key: number]: [fn: (props: any) => any, args?: any[]] },
  deps?: any[]
) => {
  const { readyState } = store.getState().account;

  let fn, args;
  [fn, args] = onclickMap[readyState] ? onclickMap[readyState] : [];
  if (typeof fn === "function") {
    args = [...(args ?? []), ...(deps ?? [])] as [props: any];
    return fn.apply(this, args);
  }
};

export const btnLabel = {
  [fnType.UN_CONNECT]: [
    function () {
      return `labelConnectWallet`;
    },
  ],
  [fnType.ERROR_NETWORK]: [
    function () {
      return `labelWrongNetwork`;
    },
  ],
  [fnType.NO_ACCOUNT]: [
    function () {
      return `depositTitleAndActive`;
    },
  ],
  [fnType.DEFAULT]: [
    function () {
      return `depositTitleAndActive`;
    },
  ],
  [fnType.NOT_ACTIVE]: [
    function () {
      return `depositTitleActive`;
    },
  ],
  [fnType.ACTIVATED]: [
    function () {
      return undefined;
    },
  ],
  [fnType.LOCKED]: [
    function () {
      return `labelUnLockLayer2`;
    },
  ],
};

export const btnClickMap: {
  [key: string]: [fn: (props: any) => any, args?: any[]];
} = {
  [fnType.ERROR_NETWORK]: [
    function () {
      //TODO toast
      myLog("get error network!");
    },
  ],
  [fnType.UN_CONNECT]: [
    function () {
      myLog("UN_CONNECT!");
      store.dispatch(changeShowModel({ _userOnModel: true }));
      store.dispatch(
        setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
      );
    },
  ],
  [fnType.NO_ACCOUNT]: [
    function () {
      myLog("NO_ACCOUNT! sendCheckAcc");
      store.dispatch(changeShowModel({ _userOnModel: true }));
      accountServices.sendCheckAcc();
    },
  ],
  [fnType.DEPOSITING]: [
    function () {
      myLog("DEPOSITING! sendCheckAcc");
      store.dispatch(changeShowModel({ _userOnModel: true }));
      accountServices.sendCheckAcc();
    },
  ],
  [fnType.NOT_ACTIVE]: [
    function () {
      myLog("NOT_ACTIVE! sendCheckAcc");
      store.dispatch(changeShowModel({ _userOnModel: true }));
      accountServices.sendCheckAcc();
    },
  ],
  [fnType.LOCKED]: [
    function () {
      unlockAccount();
      store.dispatch(changeShowModel({ _userOnModel: true }));
      store.dispatch(
        setShowAccount({
          isShow: true,
          step: AccountStep.UnlockAccount_WaitForAuth,
        })
      );
    },
  ],
};

export const BtnConnect = withTranslation(["common"], { withRef: true })(
  ({ t }: any) => {
    const { status: accountStatus, account } = useAccount();
    const { setShowDeposit } = useOpenModals();

    // const {setShowAccount} = useOpenModals();
    const [label, setLabel] = React.useState(undefined);

    const _btnLabel = Object.assign(_.cloneDeep(btnLabel), {
      [fnType.NO_ACCOUNT]: [
        function () {
          return `depositTitleAndActive`;
        },
      ],
      [fnType.ERROR_NETWORK]: [
        function () {
          return `labelWrongNetwork`;
        },
      ],
    });

    React.useEffect(() => {
      if (accountStatus === SagaStatus.UNSET) {
        setLabel(accountStaticCallBack(_btnLabel));
      }
    }, [accountStatus, account.readyState, i18n.language]);

    const _btnClickMap = Object.assign(_.cloneDeep(btnClickMap), {});

    return (
      <Button
        variant={"contained"}
        size={"large"}
        color={"primary"}
        fullWidth={true}
        style={{ maxWidth: "280px" }}
        onClick={() => {
          // remove the middle account status panel
          // make deposite directly to create an account
          if (account.readyState === AccountStatus.NO_ACCOUNT) {
            myLog("DEPOSITING! sendCheckAcc");
            accountServices.sendCheckAcc();
            setShowDeposit({ isShow: true });
            return;
          }
          accountStaticCallBack(_btnClickMap, []);
        }}
      >
        {label !== "" ? (
          t(label)
        ) : (
          <LoadingIcon color={"primary"} style={{ width: 18, height: 18 }} />
        )}
      </Button>
    );
  }
) as typeof Button;
