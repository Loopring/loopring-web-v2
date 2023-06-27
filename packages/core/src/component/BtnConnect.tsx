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
  useSettings,
  WalletConnectStep,
} from "@loopring-web/component-lib";
import React from "react";
import _ from "lodash";

import {
  fnType,
  i18n,
  L1L2_NAME_DEFINED,
  LoadingIcon,
  MapChainId,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import { changeShowModel } from "../stores/account/reducer";

export const WalletConnectL2Btn = withTranslation(["common"], {
  withRef: true,
})(({ t }: any) => {
  const { status: accountStatus, account } = useAccount();
  const { defaultNetwork } = useSettings();

  const network = MapChainId[defaultNetwork] ?? MapChainId[1];

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
        t(label, {
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        })
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
  const { defaultNetwork } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
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
          t(label, {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })
        ) : (
          <LoadingIcon color={"primary"} style={{ width: 18, height: 18 }} />
        )}
      </Button>
    </>
  );
}) as typeof Button;
