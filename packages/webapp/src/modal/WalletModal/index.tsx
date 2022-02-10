// @ts-nocheck

import { WithTranslation, withTranslation } from "react-i18next";
import {
  AccountStep,
  ConnectFailed,
  ConnectSuccess,
  InformationForCoinBase,
  MetaMaskConnectInProgress,
  ModalWalletConnect,
  ProviderMenu,
  Toast,
  useOpenModals,
  WalletConnectConnectInProgress,
  WalletConnectQRCode,
  WalletConnectStep,
} from "@loopring-web/component-lib";
import { ChainId } from "@loopring-web/loopring-sdk";
import React, { useEffect, useState } from "react";
import {
  ConnectProviders,
  copyToClipBoard,
  GatewayItem,
  gatewayList as DefaultGatewayList,
  globalSetup,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import { useAccount } from "stores/account";
import { connectProvides, walletServices } from "@loopring-web/web3-provider";
import { useSystem } from "stores/system";
import { TOAST_TIME } from "../../defs/common_defs";
import { useSelector } from "react-redux";
import { RootState } from "stores";

export const ModalWalletConnectPanel = withTranslation("common")(
  ({
    onClose,
    open,
    wait = globalSetup.wait,
    // step,
    t,
    ...rest
  }: {
    // step?:number,
    open: boolean;
    wait?: number;
    onClose?: (e: MouseEvent) => void;
  } & WithTranslation) => {
    // const [_step, setStep] = React.useState<number>(step === undefined? WalletConnectStep.Provider: step);
    const {
      account,
      updateAccount,
      setShouldShow,
      resetAccount,
      statusUnset: statusAccountUnset,
      status: accountStatus,
    } = useAccount();
    const { updateSystem, chainId: _chainId, exchangeInfo } = useSystem();
    const {
      modals: { isShowConnect },
      setShowConnect,
      setShowAccount,
    } = useOpenModals();

    const qrCodeUrl = useSelector(
      (state: RootState) => state.account.qrCodeUrl
    );

    const [stateCheck, setStateCheck] = React.useState<boolean>(false);
    const metaMaskCallback = React.useCallback(async () => {
      updateAccount({ connectName: ConnectProviders.MetaMask });
      await connectProvides.MetaMask();

      // statusAccountUnset();
      if (connectProvides.usedProvide) {
        let chainId: ChainId = Number(
          await connectProvides.usedWeb3?.eth.getChainId()
        );
        chainId =
          chainId && chainId === ChainId.GOERLI
            ? (chainId as ChainId)
            : ChainId.MAINNET;
        if (chainId !== _chainId) {
          updateSystem({ chainId });
        }
        return;
      }
    }, [_chainId]);
    const walletConnectCallback = React.useCallback(async () => {
      updateAccount({ connectName: ConnectProviders.WalletConnect });
      await connectProvides.WalletConnect();

      // statusAccountUnset();
      if (connectProvides.usedProvide) {
        let chainId: ChainId = Number(
          await connectProvides.usedWeb3?.eth.getChainId()
        );
        chainId =
          chainId && chainId === ChainId.GOERLI
            ? (chainId as ChainId)
            : ChainId.MAINNET;
        if (chainId !== _chainId) {
          updateSystem({ chainId });
        }
        return;
      }
    }, [_chainId]);
    const _onClose = React.useCallback(async (e: any) => {
      setShouldShow(false);
      setShowConnect({ isShow: false });
      if (account.readyState === "UN_CONNECT") {
        walletServices.sendDisconnect("", "should new provider");
      }
      if (onClose) {
        onClose(e);
      }
    }, []);
    const [isOpenUnknownProvider, setIsOpenUnknownProvider] =
      React.useState(false);
    const handleCloseDialog = React.useCallback(
      (_event: any, state?: boolean) => {
        setIsOpenUnknownProvider(false);
        localStorage.setItem(
          "useKnowCoinBaseWalletInstall",
          String(state ? true : false)
        );
      },
      []
    );
    const [processingCallback, setProcessingCallback] = React.useState<
      { callback: () => Promise<void> } | undefined
    >(undefined);
    useEffect(() => {
      if (
        stateCheck === true &&
        [SagaStatus.UNSET].findIndex((ele: string) => ele === accountStatus) !==
          -1
      ) {
        myLog("clear cache connect done");
        setStateCheck(false);
        if (processingCallback !== undefined) {
          processingCallback.callback();
        }
      }
    }, [accountStatus, stateCheck]);

    const gatewayList: GatewayItem[] = [
      {
        ...DefaultGatewayList[0],
        handleSelect: React.useCallback(
          async (event, flag?) => {
            if (!flag && account.connectName === DefaultGatewayList[0].key) {
              setShowConnect({ isShow: false });
            } else {
              const isKnow = localStorage.getItem(
                "useKnowCoinBaseWalletInstall"
              );

              if (
                !(isKnow === "true") &&
                !(
                  window?.ethereum?._metamask &&
                  window?.ethereum?._metamask.requestBatch
                )
              ) {
                setIsOpenUnknownProvider(true);
              }
              walletServices.sendDisconnect("", "should new provider");
              setShowConnect({
                isShow: true,
                step: WalletConnectStep.MetaMaskProcessing,
              });
              setProcessingCallback({ callback: metaMaskCallback });
              setStateCheck(true);
            }
          },
          [account]
        ),
      },
      {
        ...DefaultGatewayList[1],
        handleSelect: React.useCallback(
          async (event, flag?) => {
            walletServices.sendDisconnect("", "should new provider");
            setShowConnect({
              isShow: true,
              step: WalletConnectStep.WalletConnectProcessing,
            });
            setProcessingCallback({ callback: walletConnectCallback });
            setStateCheck(true);
          },
          [account]
        ),
      },
    ];

    const [copyToastOpen, setCopyToastOpen] = useState(false);
    const onRetry = React.useCallback(async () => {
      const index = gatewayList.findIndex((item) => {
        return item.key === account.connectName;
      });
      if (index !== -1 && gatewayList) {
        //@ts-ignore
        gatewayList[index].handleSelect(null, true);
      } else {
        walletServices.sendDisconnect("", "should new provider");
        setShowConnect({ isShow: true, step: WalletConnectStep.Provider });
      }
    }, [gatewayList, account]);
    // useConnectHook({handleProcessing});
    const providerBack = React.useMemo(() => {
      return ["UN_CONNECT", "ERROR_NETWORK"].includes(account.readyState)
        ? undefined
        : () => {
            setShowConnect({ isShow: false });
            switch (account.readyState) {
              case "ACTIVATED":
              case "LOCKED":
                setShowAccount({ isShow: true, step: AccountStep.HadAccount });
                break;
              case "DEPOSITING":
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Deposit_Submit,
                });
                break;
              case "NO_ACCOUNT":
                setShowAccount({ isShow: true, step: AccountStep.NoAccount });
                break;
            }
          };
    }, [account, setShowAccount]);
    const walletList = React.useMemo(() => {
      return Object.values({
        [WalletConnectStep.Provider]: {
          view: (
            <ProviderMenu
              termUrl={"https://www.iubenda.com/terms-and-conditions/74969935"}
              gatewayList={gatewayList}
              providerName={account.connectName}
              {...{ t, ...rest }}
            />
          ),
          onBack: providerBack,
        },
        [WalletConnectStep.MetaMaskProcessing]: {
          view: <MetaMaskConnectInProgress {...{ t, ...rest }} />,
        },
        [WalletConnectStep.WalletConnectProcessing]: {
          view: <WalletConnectConnectInProgress {...{ t, ...rest }} />,
        },
        [WalletConnectStep.WalletConnectQRCode]: {
          view: (
            <WalletConnectQRCode
              onCopy={() => {
                copyToClipBoard(qrCodeUrl);
                setCopyToastOpen(true);
              }}
              url={qrCodeUrl}
              {...{ t, ...rest }}
            />
          ),
          onBack: () => {
            setShowConnect({ isShow: true, step: WalletConnectStep.Provider });
          },
        },
        [WalletConnectStep.SuccessConnect]: {
          view: (
            <ConnectSuccess
              providerName={account.connectName}
              {...{ t, ...rest }}
            />
          ),
        },
        [WalletConnectStep.FailedConnect]: {
          view: (
            <ConnectFailed
              {...{
                t,
                error: isShowConnect.error,
                errorOptions: { name: connectProvider },
                ...rest,
              }}
              btnInfo={{ btnTxt: "labelRetry", callback: onRetry }}
            />
          ),
          onBack: () => {
            walletServices.sendDisconnect("", "should new provider");
            setShowConnect({ isShow: true, step: WalletConnectStep.Provider });
          },
        },
      });
    }, [qrCodeUrl, isShowConnect.error, account, t, rest, onClose]);
    return (
      <>
        <InformationForCoinBase
          open={isOpenUnknownProvider}
          handleClose={handleCloseDialog}
        />
        <ModalWalletConnect
          open={isShowConnect.isShow}
          onClose={_onClose}
          panelList={walletList}
          onBack={walletList[isShowConnect.step].onBack}
          step={isShowConnect.step}
        />
        <Toast
          alertText={t("labelCopyAddClip")}
          open={copyToastOpen}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            setCopyToastOpen(false);
          }}
          severity={"success"}
        />
      </>
    );
  }
);
