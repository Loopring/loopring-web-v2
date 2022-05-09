import { withTranslation } from "react-i18next";
import { changeShowModel, useAccount } from "../stores/account";
import {
  AccountStep,
  Button,
  setShowAccount,
  setShowConnect,
  WalletConnectL1Btn,
  WalletConnectStep,
} from "@loopring-web/component-lib";
import React from "react";
import _ from "lodash";
import {
  accountStaticCallBack,
  btnClickMap,
  btnLabel,
} from "./connectStatusCallback";
import {
  fnType,
  i18n,
  LoadingIcon,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import store from "../stores";

export const BtnConnect = withTranslation(["common", "layout"], {
  withRef: true,
})(({ t }: any) => {
  const { status: accountStatus } = useAccount();
  const [label, setLabel] = React.useState("labelConnectWallet");
  const _btnLabel = Object.assign(_.cloneDeep(btnLabel));

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      setLabel(accountStaticCallBack(_btnLabel));
    }
  }, [accountStatus, i18n.language]);

  return (
    <>
      <Button
        variant={"contained"}
        size={"large"}
        color={"primary"}
        fullWidth={true}
        style={{ maxWidth: "280px" }}
        onClick={() => {
          myLog("UN_CONNECT!");
          store.dispatch(changeShowModel({ _userOnModel: true }));
          store.dispatch(
            setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
          );
        }}
      >
        {label !== "" ? (
          t(label)
        ) : (
          <LoadingIcon color={"primary"} style={{ width: 18, height: 18 }} />
        )}
      </Button>
    </>
  );
}) as typeof Button;

export const WalletConnectBtnL1 = ({
  isShowOnUnConnect,
}: {
  isShowOnUnConnect: Boolean;
}) => {
  const accountState = useAccount();

  const btnLabel = {
    [fnType.UN_CONNECT]: [
      function () {
        return isShowOnUnConnect ? (
          <WalletConnectL1Btn
            handleClick={btnClickMap[fnType.UN_CONNECT][0]}
            accountState={accountState}
          />
        ) : (
          <></>
        );
      },
    ],
    [fnType.ERROR_NETWORK]: [
      function () {
        return (
          <WalletConnectL1Btn
            accountState={accountState}
            handleClick={() => {
              myLog("get error network!");
            }}
          />
        );
      },
    ],
    [fnType.NO_ACCOUNT]: [
      function () {
        return (
          <WalletConnectL1Btn
            accountState={accountState}
            handleClick={() => {
              store.dispatch(changeShowModel({ _userOnModel: true }));
              store.dispatch(
                setShowAccount({ isShow: true, step: AccountStep.HadAccount })
              );
            }}
          />
        );
      },
    ],
    [fnType.DEFAULT]: [
      function () {
        return (
          <WalletConnectL1Btn
            accountState={accountState}
            handleClick={() => {
              store.dispatch(changeShowModel({ _userOnModel: true }));
              store.dispatch(
                setShowAccount({ isShow: true, step: AccountStep.HadAccount })
              );
            }}
          />
        );
      },
    ],
    [fnType.NOT_ACTIVE]: [
      function () {
        return (
          <WalletConnectL1Btn
            accountState={accountState}
            handleClick={() => {
              store.dispatch(changeShowModel({ _userOnModel: true }));
              store.dispatch(
                setShowAccount({ isShow: true, step: AccountStep.HadAccount })
              );
            }}
          />
        );
      },
    ],
    [fnType.ACTIVATED]: [
      function () {
        return (
          <WalletConnectL1Btn
            handleClick={() => {
              store.dispatch(changeShowModel({ _userOnModel: true }));
              store.dispatch(
                setShowAccount({ isShow: true, step: AccountStep.HadAccount })
              );
            }}
          />
        );
      },
    ],
    [fnType.LOCKED]: [
      function () {
        return (
          <WalletConnectL1Btn
            accountState={accountState}
            handleClick={() => {
              store.dispatch(changeShowModel({ _userOnModel: true }));
              store.dispatch(
                setShowAccount({ isShow: true, step: AccountStep.HadAccount })
              );
            }}
          />
        );
      },
    ],
  };
  const view = React.useMemo(() => {
    return accountStaticCallBack(btnLabel);
  }, [btnLabel, isShowOnUnConnect]);
  return <>{view}</>;
};
