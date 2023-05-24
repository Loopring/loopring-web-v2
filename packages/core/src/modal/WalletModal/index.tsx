// @ts-nocheck
import { WithTranslation, withTranslation } from "react-i18next";
import {
  AccountStep,
  CommonConnectInProgress,
  ConfirmLinkCopy,
  ConnectFailed,
  ConnectSuccess,
  InformationForCoinBase,
  ModalWalletConnect,
  ProviderMenu,
  Toast,
  ToastType,
  useOpenModals,
  useSettings,
  WalletConnectConnectInProgress,
  WalletConnectQRCode,
  WalletConnectStep,
  WrongNetworkGuide,
} from "@loopring-web/component-lib";
import { ChainId } from "@loopring-web/loopring-sdk";
import React from "react";
import {
  AccountStatus,
  Bridge,
  copyToClipBoard,
  GatewayItem,
  gatewayList as DefaultGatewayList,
  globalSetup,
  myLog,
  SagaStatus,
  TOAST_TIME,
  SoursURL,
} from "@loopring-web/common-resources";
import { AvaiableNetwork, ConnectProviders } from "@loopring-web/web3-provider";
import { connectProvides, walletServices } from "@loopring-web/web3-provider";
import {
  accountReducer,
  useAccount,
  RootState,
  store,
} from "@loopring-web/core";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { updateSystem } from "../../stores/system/reducer";
const providerCallback = async () => {
  const { _chainId } = store.getState().system;
  // statusAccountUnset();
  if (connectProvides.usedProvide) {
    let chainId: ChainId = Number(
      await connectProvides.usedWeb3?.eth.getChainId()
    );
    if (!AvaiableNetwork.includes(chainId.toString())) {
      chainId = ChainId.MAINNET;
    }

    if (chainId !== _chainId) {
      store.dispatch(updateSystem({ chainId }));
    }
    return;
  }
};

export const metaMaskCallback = async () => {
  const { _chainId } = store.getState().system;
  store.dispatch(
    accountReducer.updateAccountStatus({
      connectName: ConnectProviders.MetaMask,
    })
  );
  await connectProvides.MetaMask();
  providerCallback();
};
const CoinbaseCallback = async () => {
  store.dispatch(
    accountReducer.updateAccountStatus({
      connectName: ConnectProviders.Coinbase,
    })
  );
  await connectProvides.Coinbase();

  providerCallback();
};
const gameStopCallback = async () => {
  store.dispatch(
    accountReducer.updateAccountStatus({
      connectName: ConnectProviders.GameStop,
    })
  );
  await connectProvides.GameStop();
  // statusAccountUnset();
  providerCallback();
};
const walletConnectCallback = async () => {
  // updateAccount({ connectName: ConnectProviders.WalletConnect });
  store.dispatch(
    accountReducer.updateAccountStatus({
      connectName: ConnectProviders.WalletConnect,
    })
  );
  await connectProvides.WalletConnect();
  providerCallback();
};
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
    const { account, setShouldShow, status: accountStatus } = useAccount();
    const { isMobile } = useSettings();
    const {
      modals: { isShowConnect, isWrongNetworkGuide },
      setShowConnect,
      setShowAccount,
      setShowWrongNetworkGuide,
    } = useOpenModals();
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const qrCodeUrl = useSelector(
      (state: RootState) => state.account.qrCodeUrl
    );

    const [stateCheck, setStateCheck] = React.useState<boolean>(false);
    const [connectProvider, setConnectProvider] =
      React.useState<boolean>(false);

    const _onClose = React.useCallback(
      async (e: any) => {
        setShouldShow(false);
        setShowConnect({ isShow: false });
        if (account.readyState === "UN_CONNECT") {
          walletServices.sendDisconnect("", "should new provider");
        }
        if (onClose) {
          onClose(e);
        }
      },
      [account.readyState, onClose, setShouldShow, setShowConnect]
    );
    const [isOpenUnknownProvider, setIsOpenUnknownProvider] =
      React.useState(false);
    const [isConfirmLinkCopy, setIsConfirmLinkCopy] = React.useState(false);
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

    const [processingCallback, setProcessingCallback] =
      React.useState<{ callback: () => Promise<void> } | undefined>(undefined);
    React.useEffect(() => {
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

    const gatewayList: GatewayItem[] = !isMobile
      ? [
          {
            ...DefaultGatewayList[0],
            handleSelect: React.useCallback(
              async (event, flag?) => {
                if (
                  !flag &&
                  account.connectName === DefaultGatewayList[0].key
                ) {
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
                  setConnectProvider(DefaultGatewayList[0].key);
                  setShowConnect({
                    isShow: true,
                    step: WalletConnectStep.CommonProcessing,
                  });
                  setProcessingCallback({ callback: metaMaskCallback });
                  setStateCheck(true);
                }
              },
              [account.connectName, setShowConnect]
            ),
          },
          {
            ...DefaultGatewayList[1],
            handleSelect: React.useCallback(
              async (event, flag?) => {
                if (
                  !flag &&
                  account.connectName === DefaultGatewayList[1].key
                ) {
                  setShowConnect({ isShow: false });
                } else {
                  walletServices.sendDisconnect("", "should new provider");
                  setConnectProvider(DefaultGatewayList[1].key);
                  setShowConnect({
                    isShow: true,
                    step: WalletConnectStep.CommonProcessing,
                  });
                  setProcessingCallback({ callback: walletConnectCallback });
                  setStateCheck(true);
                }
              },
              [account.connectName, setShowConnect]
            ),
          },
          {
            ...DefaultGatewayList[2],
            // imgSrc: SoursURL + `svg/gs-${theme.mode}.svg`,
            handleSelect: React.useCallback(
              async (event, flag?) => {
                walletServices.sendDisconnect("", "should new provider");
                setShowConnect({
                  isShow: true,
                  step: WalletConnectStep.CommonProcessing,
                });
                setConnectProvider(DefaultGatewayList[2].key);
                setProcessingCallback({ callback: gameStopCallback });
                setStateCheck(true);
              },
              [setShowConnect]
            ),
          },
          {
            ...DefaultGatewayList[3],
            handleSelect: React.useCallback(
              async (event, flag?) => {
                walletServices.sendDisconnect("", "should new provider");
                setShowConnect({
                  isShow: true,
                  step: WalletConnectStep.WalletConnectProcessing,
                });
                setConnectProvider(DefaultGatewayList[3].key);
                setProcessingCallback({ callback: CoinbaseCallback });
                setStateCheck(true);
              },
              [setShowConnect]
            ),
          },
        ]
      : [
          ...(window.ethereum
            ? [
                {
                  ...DefaultGatewayList[0],
                  key: t("labelConnectWithDapp"),
                  imgSrc: SoursURL + "svg/loopring.svg",
                  handleSelect: React.useCallback(
                    async (event, flag?) => {
                      if (
                        !flag &&
                        account.connectName === DefaultGatewayList[0].key
                      ) {
                        setShowConnect({ isShow: false });
                      } else {
                        walletServices.sendDisconnect(
                          "",
                          "should new provider"
                        );
                        setConnectProvider(DefaultGatewayList[0].key);
                        setShowConnect({
                          isShow: true,
                          step: WalletConnectStep.CommonProcessing,
                        });
                        setProcessingCallback({ callback: metaMaskCallback });
                        setStateCheck(true);
                      }
                    },
                    [account.connectName, setShowConnect]
                  ),
                },
              ]
            : [
                {
                  key: t("labelOpenInWalletApp"),
                  keyi18n: "labelOpenInWalletApp",
                  imgSrc: SoursURL + "svg/loopring.svg",
                  handleSelect: React.useCallback(
                    async (event, flag?) => {
                      // setShowConnect({ isShow: false });
                      const token = searchParams.get("token");
                      const l2account =
                        searchParams.get("l2account") ||
                        searchParams.get("owner");
                      copyToClipBoard(
                        Bridge +
                          `?${l2account ? `l2account=` + l2account : ""}&${
                            token ? `token=` + token : ""
                          }`
                      );
                      setIsConfirmLinkCopy(true);
                    },
                    [searchParams]
                  ),
                },
              ]),
          {
            ...DefaultGatewayList[1],
            handleSelect: React.useCallback(
              async (event, flag?) => {
                if (
                  !flag &&
                  account.connectName === DefaultGatewayList[1].key
                ) {
                  setShowConnect({ isShow: false });
                } else {
                  walletServices.sendDisconnect("", "should new provider");
                  setConnectProvider(DefaultGatewayList[1].key);
                  setShowConnect({
                    isShow: true,
                    step: WalletConnectStep.CommonProcessing,
                  });
                  setProcessingCallback({ callback: walletConnectCallback });
                  setStateCheck(true);
                }
              },
              [account.connectName, setShowConnect]
            ),
          },
          {
            ...DefaultGatewayList[3],
            handleSelect: React.useCallback(
              async (event, flag?) => {
                walletServices.sendDisconnect("", "should new provider");
                setShowConnect({
                  isShow: true,
                  step: WalletConnectStep.WalletConnectProcessing,
                });
                setConnectProvider(DefaultGatewayList[3].key);
                setProcessingCallback({ callback: CoinbaseCallback });
                setStateCheck(true);
              },
              [setShowConnect]
            ),
          },
        ];

    const [copyToastOpen, setCopyToastOpen] = React.useState(false);
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
    }, [gatewayList, account.connectName, setShowConnect]);
    // useConnectHook({handleProcessing});
    const providerBack = React.useMemo(() => {
      return ["UN_CONNECT", "ERROR_NETWORK"].includes(account.readyState)
        ? undefined
        : () => {
            setShowConnect({ isShow: false });
            switch (account.readyState) {
              case AccountStatus.ACTIVATED:
              case AccountStatus.LOCKED:
                setShowAccount({ isShow: true, step: AccountStep.HadAccount });
                break;
              case AccountStatus.DEPOSITING:
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Deposit_Submit,
                });
                break;
              case AccountStatus.NO_ACCOUNT:
                setShowAccount({ isShow: true, step: AccountStep.NoAccount });
                break;
            }
          };
    }, [account.readyState, setShowAccount, setShowConnect]);
    const walletList = React.useMemo(() => {
      return Object.values({
        [WalletConnectStep.Provider]: {
          view: (
            <ProviderMenu
              termUrl={"https://www.iubenda.com/terms-and-conditions/74969935"}
              gatewayList={gatewayList}
              providerName={account.connectName as ConnectProviders}
              {...{ t, ...rest }}
            />
          ),
          onBack: providerBack,
        },
        [WalletConnectStep.CommonProcessing]: {
          view: (
            <CommonConnectInProgress
              {...{ t, ...rest, providerName: connectProvider }}
            />
          ),
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
              providerName={account.connectName as ConnectProviders}
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
    }, [
      gatewayList,
      account.connectName,
      t,
      rest,
      providerBack,
      connectProvider,
      qrCodeUrl,
      isShowConnect.error,
      onRetry,
      setShowConnect,
    ]);
    return (
      <>
        <InformationForCoinBase
          open={isOpenUnknownProvider}
          handleClose={handleCloseDialog}
        />
        <ConfirmLinkCopy
          open={isConfirmLinkCopy}
          setCopyToastOpen={setCopyToastOpen}
          handleClose={() => setIsConfirmLinkCopy(false)}
        />
        <WrongNetworkGuide
          open={isWrongNetworkGuide.isShow}
          handleClose={() => {
            setShowWrongNetworkGuide({ isShow: false });
          }}
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
          severity={ToastType.success}
        />
      </>
    );
  }
);
