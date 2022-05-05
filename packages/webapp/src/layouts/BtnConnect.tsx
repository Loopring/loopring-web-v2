import { withTranslation } from "react-i18next";
import { changeShowModel, useAccount } from "../stores/account";
import {
  Button,
  setShowConnect,
  useOpenModals,
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
  AccountStatus,
  fnType,
  i18n,
  LoadingIcon,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import { accountServices } from "../services/account/accountServices";
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
