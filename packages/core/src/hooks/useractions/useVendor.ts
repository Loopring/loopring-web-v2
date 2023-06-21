import {
  AccountStatus,
  myLog,
  TradeBtnStatus,
  VendorItem,
  VendorList,
} from "@loopring-web/common-resources";
import { store, useAccount, useModalData, useSystem } from "../../index";
import {
  RampInstantEventTypes,
  RampInstantSDK,
} from "@ramp-network/ramp-instant-sdk";
import { AccountStep, useOpenModals } from "@loopring-web/component-lib";
import React from "react";
import { useTranslation } from "react-i18next";
import { BanxaCheck, banxaService, OrderENDReason } from "../../services";
import _ from "lodash";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useLocation } from "react-use";

export enum RAMP_SELL_PANEL {
  LIST,
  RAMP_CONFIRM,
  BANXA_CONFIRM,
}

export const useVendor = () => {
  const { account } = useAccount();
  const { t } = useTranslation();
  const { setShowTradeIsFrozen } = useOpenModals();
  const match: any = useRouteMatch("/trade/fiat/:tab?");

  const banxaRef = React.useRef();
  const subject = React.useMemo(() => banxaService.onSocket(), []);

  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const legalShow = (raw_data as any)?.legal?.show;
  const { setShowAccount } = useOpenModals();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const history = useHistory();
  const { href } = useLocation();
  const search = href?.split("?")[1] ?? "";
  const searchParams = new URLSearchParams(search);
  const {
    // updateOffRampData,
    resetOffRampData,
    resetOffBanxaData,
  } = useModalData();

  const [sellPanel, setSellPanel] = React.useState<RAMP_SELL_PANEL>(
    RAMP_SELL_PANEL.LIST
    // RAMP_SELL_PANEL.BANXA_CONFIRM
  );
  const [banxaBtnStatus, setBanxaBtnStatus] = React.useState<TradeBtnStatus>(
    TradeBtnStatus.AVAILABLE
  );
  const _banxaClick = _.debounce(() => {
    resetOffBanxaData();
    banxaService.banxaStart();
  }, 500);

  const vendorListBuy: VendorItem[] = legalShow
    ? [
        {
          // key: VendorProviders.Ramp,
          // svgIcon: "RampIcon",
          ...VendorList.Ramp,
          handleSelect: () => {
            setShowAccount({ isShow: false });
            if (legalEnable) {
              let config: any = {
                hostAppName: "Loopring",
                hostLogoUrl: "https://static.loopring.io/assets/svg/logo.svg",
                userAddress: account.accAddress,
                defaultFlow: "ONRAMP",
                enabledFlows: ["ONRAMP"],
              };
              if (account && account.accountId && account.accountId !== -1) {
                config = {
                  ...config,
                  swapAsset: "LOOPRING_*",
                  // enabledFlows: ["ONRAMP"],
                  hostApiKey: "r6e232on45rt3ukdb7zbcvh3avdwbqpore5rbht7",
                };
              } else {
                config = {
                  ...config,
                  swapAsset: "LOOPRING_ETH,LOOPRING_USDC,LOOPRING_LRC",
                  hostApiKey: "xqh8ej6ye2rpoj528xd6rkghsgmyrk4hxb7kxarz",
                };
              }
              window.rampInstance = new RampInstantSDK({
                ...config,
              }).show();
              window.rampInstance.on(RampInstantEventTypes.WIDGET_CLOSE, () => {
                resetOffRampData();
                setSellPanel(RAMP_SELL_PANEL.LIST);
                if (window.rampInstance) {
                  window.rampInstance.unsubscribe("*", () => undefined);
                  window.rampInstance = undefined;
                }
                let dex = "labelAddAssetTitleCardDes";
                if (
                  account.readyState &&
                  [
                    AccountStatus.DEPOSITING,
                    AccountStatus.NOT_ACTIVE,
                    AccountStatus.NO_ACCOUNT,
                  ].includes(
                    // @ts-ignore
                    account?.readyState
                  )
                ) {
                  dex = "labelAddAssetTitleCardDesActive";
                }
                setShowAccount({
                  isShow: true,
                  step: AccountStep.ThirdPanelReturn,
                  info: {
                    title: t("labelAddAssetTitleCard"),
                    description: t(dex, {
                      loopringL2: "Loopring L2",
                      l2Symbol: "L2",
                      l1Symbol: "L1",
                      ethereumL1: "Ethereum L1",
                      loopringLayer2: "Loopring Layer 2",
                    }),
                  },
                });
              });
            }
          },
        },
        {
          ...VendorList.Banxa,
          handleSelect: () => {
            let dex = "labelAddAssetTitleCardDes";
            if (
              account.readyState &&
              [
                AccountStatus.DEPOSITING,
                AccountStatus.NOT_ACTIVE,
                AccountStatus.NO_ACCOUNT,
              ].includes(
                // @ts-ignore
                account?.readyState
              )
            ) {
              dex = "labelAddAssetTitleCardDesActive";
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.ThirdPanelReturn,
              info: {
                title: t("labelAddAssetTitleCard"),
                description: t(dex, {
                  loopringL2: "Loopring L2",
                  l2Symbol: "L2",
                  l1Symbol: "L1",
                  ethereumL1: "Ethereum L1",
                  loopringLayer2: "Loopring Layer 2",
                }),
              },
            });
            if (legalEnable) {
              window.open(
                "https://loopring.banxa.com/?code=1fe263e17175561954c6&buyMode&walletAddress=" +
                  account.accAddress,
                "_blank"
              );
              window.opener = null;
            }
          },
        },
      ]
    : [];

  const vendorListSell: VendorItem[] = legalShow
    ? [
        // {
        //   ...VendorList.Ramp,
        //   handleSelect: () => {
        //     setShowAccount({ isShow: false });
        //     if (legalEnable) {
        //       let config: any = {
        //         hostAppName: "Loopring",
        //         hostLogoUrl: "https://static.loopring.io/assets/svg/logo.svg",
        //         userAddress: account.accAddress,
        //         defaultFlow: "OFFRAMP",
        //         enabledFlows: ["OFFRAMP"],
        //         url: "https://ramp.network/sell-beta",
        //       };
        //       config = {
        //         ...config,
        //         hostApiKey: "qjkymvqp2q7uvvrf7x6fb93pxn4aqc5tb7xheg8u",
        //       };
        //       window.rampInstance = new RampInstantSDK({
        //         ...config,
        //       });
        //       window.rampInstance.onSendCrypto(
        //         (
        //           assetSymbol: string,
        //           amount: string,
        //           destinationAddress: string
        //         ) => {
        //           if (window.rampInstance) {
        //             try {
        //               updateOffRampData({
        //                 send: { assetSymbol, amount, destinationAddress },
        //               });
        //               setSellPanel(RAMP_SELL_PANEL.RAMP_CONFIRM);
        //               console.log(
        //                 "onSendCrypto",
        //                 assetSymbol,
        //                 destinationAddress
        //               );
        //               //@ts-ignore
        //               window.rampInstance.domNodes.overlay.style.display =
        //                 "none";
        //               console.log("RAMP WEIGHT hidden on send Crypto");
        //             } catch (e) {
        //               console.log("RAMP WEIGHT hidden failed");
        //             }
        //           } else {
        //             resetOffRampData();
        //             setSellPanel(RAMP_SELL_PANEL.LIST);
        //           }
        //           return new Promise(() => {});
        //         }
        //       );
        //       window.rampInstance.on(RampInstantEventTypes.WIDGET_CLOSE, () => {
        //         console.log("RAMP WEIGHT close");
        //         resetOffRampData();
        //         setSellPanel(RAMP_SELL_PANEL.LIST);
        //         if (window.rampInstance) {
        //           window.rampInstance.unsubscribe("*", () => undefined);
        //           window.rampInstance = undefined;
        //         }
        //       });
        //       console.log("RAMP WEIGHT display on send user selected");
        //       window.rampInstance.show();
        //     }
        //   },
        // },
        {
          ...VendorList.Banxa,
          btnStatus: banxaBtnStatus,
          handleSelect: async (_event) => {
            setBanxaBtnStatus(TradeBtnStatus.LOADING);
            setShowAccount({ isShow: false });
            _banxaClick();
            // @ts-ignore
          },
        },
      ]
    : [];

  const closeBanxa = () => {
    const parentsNode: any =
      window.document.querySelector("#iframeBanxaTarget");
    parentsNode.style.display = "none";
  };

  const enterCheck = React.useCallback(async () => {
    const data = await banxaService.banxaCheckHavePending();
    if (data?.order?.status === "waitingPayment") {
      myLog("banxa Check Have waitingPayment", data.order);
      banxaService.KYCDone();
      searchParams.set("orderId", data?.order.id);
      history.replace({
        pathname: "/trade/fiat/sell",
        search: searchParams.toString(),
      });
      store.dispatch(
        setShowAccount({
          isShow: true,
          step: AccountStep.ContinuousBanxaOrder,
          info: { orderId: data?.order.id },
        })
      );
      return;
    }
    setBanxaBtnStatus(TradeBtnStatus.AVAILABLE);
  }, []);
  React.useEffect(() => {
    const offBanxaValue = store.getState()._router_modalData.offBanxaValue;
    if (
      match?.params?.tab?.toLowerCase() === "sell".toLowerCase() &&
      searchParams.get("orderId") &&
      searchParams.get("orderId")?.toLowerCase() !==
        offBanxaValue?.id?.toLowerCase()
    ) {
      banxaService.banxaCheckHavePending();
    } else if (
      match?.params?.tab?.toLowerCase() === "sell".toLowerCase() &&
      !searchParams.has("orderId")
    ) {
      setBanxaBtnStatus(TradeBtnStatus.LOADING);
      setSellPanel(RAMP_SELL_PANEL.LIST);
      enterCheck();
    }
  }, [match?.params?.tab, searchParams?.get("orderId")]);
  const clickEvent = () =>
    banxaService.banxaEnd({
      reason: OrderENDReason.UserCancel,
      data: { resource: "on close" },
    });

  React.useEffect(() => {
    const close = window.document.querySelector("#iframeBanxaClose");
    const parentsNode = window.document.querySelector("#iframeBanxaTarget");
    if (close && parentsNode) {
      parentsNode.addEventListener("click", clickEvent);
    }
    const subscription = subject.subscribe((props) => {
      switch (props.status) {
        // case BanxaCheck.CheckOrderStatus:
        //   checkOrderStatus(props.data);
        //   break;
        case BanxaCheck.OrderHide:
          setBanxaBtnStatus(TradeBtnStatus.AVAILABLE);
          // hideBanxa();
          closeBanxa();
          break;
        case BanxaCheck.OrderShow:
          setBanxaBtnStatus(TradeBtnStatus.AVAILABLE);
          // showBanxa();
          break;
        case BanxaCheck.OrderEnd:
          // myLog("subscription Banxa", props.status, props.data);
          if (props?.data?.reason === OrderENDReason.BanxaNotReady) {
            setShowTradeIsFrozen({
              isShow: true,
              messageKey: "labelBanxaNotReady",
            });
          }
          if (props?.data?.reason === OrderENDReason.CreateOrderFailed) {
            setShowTradeIsFrozen({
              isShow: true,
              messageKey: "labelBanxaFailedForAPI",
            });
          }
          closeBanxa();
          setBanxaBtnStatus(TradeBtnStatus.AVAILABLE);

          // clearTimeout(nodeTimer.current as NodeJS.Timeout);
          break;
        default:
          break;
      }
    });
    return () => {
      if (close && parentsNode) {
        parentsNode?.removeEventListener("click", clickEvent);
      }
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
      subscription.unsubscribe();
      closeBanxa();
    };
  }, []);
  return {
    banxaRef,
    vendorListBuy,
    vendorListSell,
    vendorForce: undefined,
    sellPanel,
    setSellPanel,
    // setSellPanel,
  };
};
