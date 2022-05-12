import React from "react";
import {
  useSystem,
  useAmmMap,
  useTokenMap,
  useAccount,
  useTokenPrices,
  useSocket,
  layer1Store,
} from "@loopring-web/core";
import { ChainId } from "@loopring-web/loopring-sdk";
import { SagaStatus, ThemeType } from "@loopring-web/common-resources";
import {
  ConnectProviders,
  ConnectProvides,
  connectProvides,
  walletServices,
} from "@loopring-web/web3-provider";
import { useAccountInit } from "./hookAccountInit";
import { useSettings } from "@loopring-web/component-lib";
import { useTheme } from "@emotion/react";

/**
 * @description
 * @step1 subscribe Connect hook
 * @step2 check the session storage ? choose the provider : none provider
 * @step3 decide china ID by step2
 * @step4 prepare the static date (tokenMap, ammMap, faitPrice, gasPrice, forex, Activities ...)
 * @step5 launch the page
 */

export function useInit() {
  const [, search] = window.location?.hash.split("?") ?? [];
  const query = new URLSearchParams(search);
  const [, pathname1] = window.location.hash.match(/#\/([\w\d\-]+)\??/) ?? [];
  const isNoServer: boolean =
    query.has("noheader") && ["notification", "document"].includes(pathname1);
  const [state, setState] = React.useState<keyof typeof SagaStatus>(() => {
    if (isNoServer) {
      return SagaStatus.DONE;
    } else {
      return SagaStatus.PENDING;
    }
  });
  const { isMobile } = useSettings();
  const theme = useTheme();

  const {
    account,
    updateAccount,
    resetAccount,
    status: accountStatus,
    statusUnset: accountStatusUnset,
  } = useAccount();
  const { status: tokenMapStatus, statusUnset: tokenMapStatusUnset } =
    useTokenMap();
  const { status: ammMapStatus, statusUnset: ammMapStatusUnset } = useAmmMap();
  const { status: tokenPricesStatus, statusUnset: tokenPricesUnset } =
    useTokenPrices();

  const {
    updateSystem,
    status: systemStatus,
    statusUnset: systemStatusUnset,
  } = useSystem();

  const { status: socketStatus, statusUnset: socketUnset } = useSocket();
  const { circleUpdateLayer1ActionHistory } = layer1Store.useLayer1Store();

  React.useEffect(() => {
    (async (account) => {
      if (
        account.accAddress !== "" &&
        account.connectName &&
        account.connectName !== ConnectProviders.Unknown
      ) {
        try {
          ConnectProvides.IsMobile = isMobile;
          await connectProvides[account.connectName]({
            account: account.accAddress,
            darkMode: theme.mode === ThemeType.dark,
          });
          updateAccount({});
          if (connectProvides.usedProvide && connectProvides.usedWeb3) {
            let chainId =
              // @ts-ignore
              Number(connectProvides.usedProvide?.connection?.chainId) ??
              Number(await connectProvides.usedWeb3.eth.getChainId());
            if (ChainId[chainId] === undefined) {
              chainId =
                account._chainId && account._chainId !== "unknown"
                  ? account._chainId
                  : ChainId.MAINNET;
            }
            circleUpdateLayer1ActionHistory({ chainId });

            if (!isNoServer) {
              updateSystem({ chainId: chainId as any });
            }
            return;
          }
        } catch (error: any) {
          walletServices.sendDisconnect(
            "",
            `error at init loading  ${error}, disconnect`
          );
          const chainId =
            account._chainId && account._chainId !== "unknown"
              ? account._chainId
              : ChainId.MAINNET;
          if (!isNoServer) {
            updateSystem({ chainId });
          }
        }
      } else {
        if (
          account.accAddress === "" ||
          account.connectName === ConnectProviders.Unknown
        ) {
          resetAccount();
        }
        const chainId =
          account._chainId && account._chainId !== "unknown"
            ? account._chainId
            : ChainId.MAINNET;
        if (!isNoServer) {
          updateSystem({ chainId });
        }
      }
    })(account);
  }, []);
  React.useEffect(() => {
    switch (accountStatus) {
      case SagaStatus.ERROR:
        accountStatusUnset();
        setState("ERROR");
        break;
      case SagaStatus.DONE:
        accountStatusUnset();
        break;
      default:
        break;
    }
  }, [accountStatus]);
  React.useEffect(() => {
    switch (systemStatus) {
      case SagaStatus.PENDING:
        if (!query.has("noheader") && state !== SagaStatus.PENDING) {
          setState(SagaStatus.PENDING);
        }
        break;
      case SagaStatus.ERROR:
        systemStatusUnset();
        setState("ERROR");
        break;
      case SagaStatus.DONE:
        systemStatusUnset();
        break;
      default:
        break;
    }
  }, [systemStatus]);
  React.useEffect(() => {
    if (
      tokenMapStatus === SagaStatus.UNSET &&
      ammMapStatus === SagaStatus.UNSET &&
      tokenPricesStatus === SagaStatus.UNSET
    ) {
      setState("DONE");
    }
  }, [tokenMapStatus, ammMapStatus, tokenPricesStatus]);
  React.useEffect(() => {
    switch (tokenMapStatus) {
      case SagaStatus.ERROR:
        tokenMapStatusUnset();
        setState("ERROR");
        break;
      case SagaStatus.DONE:
        tokenMapStatusUnset();
        break;
      default:
        break;
    }
  }, [tokenMapStatus]);
  React.useEffect(() => {
    switch (ammMapStatus) {
      case SagaStatus.ERROR:
        ammMapStatusUnset();
        setState("ERROR");
        break;
      case SagaStatus.DONE:
        ammMapStatusUnset();
        break;
      default:
        break;
    }
  }, [ammMapStatus]);
  React.useEffect(() => {
    switch (tokenPricesStatus) {
      case SagaStatus.ERROR:
        tokenPricesUnset();
        setState("ERROR");
        break;
      case SagaStatus.DONE:
        tokenPricesUnset();
        break;
      default:
        break;
    }
  }, [tokenPricesStatus]);
  React.useEffect(() => {
    switch (socketStatus) {
      case "ERROR":
        socketUnset();
        break;
      case "DONE":
        socketUnset();
        break;
      default:
        break;
    }
  }, [socketStatus]);

  useAccountInit({ state });
  return {
    state,
  };
}
