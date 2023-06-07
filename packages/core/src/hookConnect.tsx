import React from "react";
import {
  OutlineSelect,
  OutlineSelectItem,
  setShowAccount,
  useOpenModals,
  useSettings,
  WalletConnectStep,
} from "@loopring-web/component-lib";
import {
  AvaiableNetwork,
  connectProvides,
  ErrorType,
  ProcessingType,
} from "@loopring-web/web3-provider";
import {
  AccountStatus,
  DropDownIcon,
  myLog,
  NetworkMap,
  SagaStatus,
  SoursURL,
  ThemeType,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

import { accountReducer, useAccount } from "./stores/account";
import { useModalData, useSystem } from "./stores";
import {
  checkAccount,
  networkUpdate,
  resetLayer12Data,
  useConnectHook,
} from "./services";
import { REFRESH_RATE } from "./defs";
import { store, WalletConnectL2Btn } from "./index";
import { useTranslation } from "react-i18next";
import { Box, SelectChangeEvent, styled, Typography } from "@mui/material";
import { updateAccountStatus } from "./stores/account/reducer";

export const OutlineSelectStyle = styled(OutlineSelect)`
  &.test .MuiSelect-outlined span {
    background: var(--network-bg);
    display: inline-flex;
    padding: 3px 4px;
    border-radius: 4px;
    color: var(--network-text);
  }

  .MuiSelect-outlined {
    padding-right: 24px;
  }
` as typeof OutlineSelect;

export const useSelectNetwork = () => {
  const { t } = useTranslation();

  // const { gatewayList } = useGatewayList({});
  const { defaultNetwork, setDefaultNetwork, themeMode } = useSettings();
  const { setShowConnect } = useOpenModals();
  // const { account } = useAccount();
  React.useEffect(() => {
    const account = store.getState().account;
    if (account.readyState === AccountStatus.UN_CONNECT) {
      // const networkFlag =
      networkUpdate();
    }
  }, []);

  const handleOnNetworkSwitch = async (value: sdk.ChainId) => {
    const account = store.getState().account;
    if (value !== defaultNetwork) {
      setDefaultNetwork(value);
    }
    if (account.readyState !== AccountStatus.UN_CONNECT) {
      setShowConnect({
        isShow: true,
        step: WalletConnectStep.CommonProcessing,
      });
      myLog(connectProvides);
      await connectProvides.sendChainIdChange(
        value,
        themeMode === ThemeType.dark
      );
    } else {
      networkUpdate();
    }
  };

  const NetWorkItems = React.useMemo(() => {
    return (
      <>
        <OutlineSelectStyle
          aria-label={NetworkMap[defaultNetwork]?.label}
          IconComponent={DropDownIcon}
          labelId="network-selected"
          id="network-selected"
          className={
            /test/gi.test(
              NetworkMap[!defaultNetwork ? sdk.ChainId.MAINNET : defaultNetwork]
                ?.label ?? ""
            )
              ? "test"
              : ""
          }
          value={!defaultNetwork ? sdk.ChainId.MAINNET : defaultNetwork}
          autoWidth
          onChange={(event: SelectChangeEvent<any>) =>
            handleOnNetworkSwitch(event.target.value)
          }
        >
          {AvaiableNetwork.reduce((prew, id, index) => {
            if (NetworkMap[id]) {
              prew.push(
                <OutlineSelectItem
                  className={"viewNetwork" + NetworkMap[id]}
                  aria-label={NetworkMap[id].label}
                  value={id}
                  key={"viewNetwork" + NetworkMap[id] + index}
                >
                  <span>{t(NetworkMap[id].label)}</span>
                </OutlineSelectItem>
              );
            }
            return prew;
          }, [] as JSX.Element[])}
        </OutlineSelectStyle>
      </>
    );
  }, [defaultNetwork]);
  React.useEffect(() => {}, []);

  return {
    NetWorkItems,
    handleOnNetworkSwitch,
  };
};

export function useConnect(_props: { state: keyof typeof SagaStatus }) {
  const {
    account,
    shouldShow,
    resetAccount,
    statusUnset: statusAccountUnset,
    setShouldShow,
    status: accountStatus,
  } = useAccount();
  // const {updateWalletLayer2, resetLayer2} = useWalletLayer2()

  const { resetWithdrawData, resetTransferData, resetDepositData } =
    useModalData();

  const { updateSystem } = useSystem();
  const { setShowConnect } = useOpenModals();
  const [stateAccount, setStateAccount] =
    React.useState<keyof typeof SagaStatus>("DONE");
  React.useEffect(() => {
    if (
      stateAccount === SagaStatus.PENDING &&
      accountStatus === SagaStatus.DONE
    ) {
      setStateAccount("DONE");
      statusAccountUnset();
    }
  }, [stateAccount, accountStatus]);
  const handleConnect = React.useCallback(
    async ({
      accounts,
      chainId,
    }: {
      accounts: string;
      provider: any;
      chainId: sdk.ChainId | "unknown";
    }) => {
      const accAddress = accounts[0];
      myLog("After connect >>,network part start: step1 networkUpdate");
      store.dispatch(updateAccountStatus({ _chainId: chainId }));
      const networkFlag = networkUpdate();
      myLog("After connect >>,network part done: step2 check account");

      if (networkFlag) {
        resetLayer12Data();
        checkAccount(accAddress, chainId !== "unknown" ? chainId : undefined);
      }

      resetWithdrawData();
      resetTransferData();
      resetDepositData();

      setShouldShow(false);
      setShowConnect({
        isShow: !!shouldShow ?? false,
        step: WalletConnectStep.SuccessConnect,
      });
      await sdk.sleep(REFRESH_RATE);
      setShowConnect({ isShow: false, step: WalletConnectStep.SuccessConnect });
    },
    [
      resetWithdrawData,
      resetTransferData,
      resetDepositData,
      setShouldShow,
      setShowConnect,
      shouldShow,
    ]
  );

  const handleAccountDisconnect = React.useCallback(
    async ({ reason, code }: { reason?: string; code?: number }) => {
      // const {};

      myLog("handleAccountDisconnect:", account, reason, code);
      resetAccount({ shouldUpdateProvider: true });
      setStateAccount(SagaStatus.PENDING);
      resetLayer12Data();

      resetWithdrawData();
      resetTransferData();
      resetDepositData();
      // await sleep(REFRESH_RATE)
    },
    [
      account,
      resetAccount,
      resetDepositData,
      resetTransferData,
      resetWithdrawData,
    ]
  );

  const handleProcessing = React.useCallback(
    ({ opts }: { type: ProcessingType; opts: any }) => {
      const { qrCodeUrl } = opts;
      if (qrCodeUrl) {
        store.dispatch(accountReducer.updateAccountStatus({ qrCodeUrl }));
        setShowConnect({
          isShow: true,
          step: WalletConnectStep.WalletConnectQRCode,
        });
      }
    },
    [setShowConnect]
  );

  const handleError = React.useCallback(
    (props: { type: keyof typeof ErrorType; opts?: any }) => {
      const chainId =
        account._chainId === sdk.ChainId.MAINNET ||
        account._chainId === sdk.ChainId.GOERLI
          ? account._chainId
          : sdk.ChainId.MAINNET;

      myLog("---> shouldShow:", shouldShow);

      if (store.getState().system.chainId !== chainId) {
        myLog("try to updateSystem...");
        updateSystem({ chainId });
      }

      if (!!account.accAddress) {
        myLog("try to resetAccount...");
        resetAccount();
      }

      statusAccountUnset();

      setShowAccount({ isShow: false });
      setShowConnect({
        isShow: true,
        step: WalletConnectStep.FailedConnect,
        error: {
          ...props.opts.error,
          // code: UIERROR_CODE.PROVIDER_ERROR,
          // message: props.opts.error,
          // ...props.errorObj,
        } as sdk.RESULT_INFO,
      });
    },
    [
      account._chainId,
      account.accAddress,
      shouldShow,
      statusAccountUnset,
      setShowConnect,
      updateSystem,
      resetAccount,
    ]
  );

  useConnectHook({
    handleAccountDisconnect,
    handleProcessing,
    handleError,
    handleConnect,
  });
}

export const ViewAccountTemplate = React.memo(
  ({
    activeViewTemplate,
    unlockWording,
  }: {
    activeViewTemplate: JSX.Element;
    unlockWording?: string;
  }) => {
    const { account } = useAccount();
    const { t } = useTranslation(["common", "layout"]);
    const { isMobile } = useSettings();

    const viewTemplate = React.useMemo(() => {
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleConnectToWallet")}
              </Typography>
              <WalletConnectL2Btn />
            </Box>
          );
          break;
        case AccountStatus.LOCKED:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {unlockWording ?? t("describeTitleLocked")}
              </Typography>
              <WalletConnectL2Btn />
            </Box>
          );
          break;
        case AccountStatus.NO_ACCOUNT:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
                whiteSpace={"pre-line"}
                textAlign={"center"}
              >
                {t("describeTitleNoAccount")}
              </Typography>
              <WalletConnectL2Btn />
            </Box>
          );
          break;
        case AccountStatus.NOT_ACTIVE:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleNotActive")}
              </Typography>
              <WalletConnectL2Btn />
            </Box>
          );
          break;
        case AccountStatus.DEPOSITING:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <img
                className="loading-gif"
                alt={"loading"}
                width="60"
                src={`${SoursURL}images/loading-line.gif`}
              />
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleOpenAccounting")}
              </Typography>
            </Box>
          );
          break;
        case AccountStatus.ERROR_NETWORK:
          return (
            <Box
              flex={1}
              display={"flex"}
              justifyContent={"center"}
              flexDirection={"column"}
              alignItems={"center"}
            >
              <Typography
                marginY={3}
                variant={isMobile ? "h4" : "h1"}
                textAlign={"center"}
              >
                {t("describeTitleOnErrorNetwork", {
                  connectName: account.connectName,
                })}
              </Typography>
            </Box>
          );
          break;
        case AccountStatus.ACTIVATED:
          return activeViewTemplate;
        default:
          break;
      }
    }, [
      account.readyState,
      account.connectName,
      isMobile,
      t,
      activeViewTemplate,
    ]);

    return <>{viewTemplate}</>;
  }
);
