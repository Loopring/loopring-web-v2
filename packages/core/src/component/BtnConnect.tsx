import { withTranslation } from "react-i18next";
import {
  accountStaticCallBack,
  btnClickMap,
  btnLabel,
  store,
  useAccount,
} from "../index";
import {
  Button,
  setShowConnect,
  WalletConnectStep,
} from "@loopring-web/component-lib";
import React from "react";
import _ from "lodash";

import {
  fnType,
  i18n,
  LoadingIcon,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import { changeShowModel } from "../stores/account/reducer";

export const WalletConnectL2Btn = withTranslation(["common"], {
  withRef: true,
})(({ t }: any) => {
  const { status: accountStatus, account } = useAccount();
  // const { setShowAccount } = useOpenModals();

  // const {setShowAccount} = useOpenModals();
  const [label, setLabel] = React.useState(undefined);

  const _btnLabel = Object.assign(_.cloneDeep(btnLabel), {
    // [fnType.NO_ACCOUNT]: [
    //   function () {
    //     return `depositAndActiveBtn`;
    //   },
    // ],
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
}) as typeof Button;

export const BtnConnectL1 = withTranslation(["common", "layout"], {
  withRef: true,
})(({ t }: any) => {
  const {
    status: accountStatus,
    account: { readyState },
  } = useAccount();
  const [label, setLabel] = React.useState("labelConnectWallet");
  const _btnLabel = Object.assign(_.cloneDeep(btnLabel));

  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      myLog("readyState", readyState);
      setLabel(accountStaticCallBack(_btnLabel));
    }
  }, [accountStatus]);

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
