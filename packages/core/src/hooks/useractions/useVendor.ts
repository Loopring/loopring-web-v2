import {
  AccountStatus,
  myLog,
  VendorItem,
  VendorList,
} from "@loopring-web/common-resources";
import { useAccount, useModalData, useSystem } from "../../index";
import {
  RampInstantEventTypes,
  RampInstantSDK,
} from "@ramp-network/ramp-instant-sdk";
import { AccountStep, useOpenModals } from "@loopring-web/component-lib";
import React from "react";
import { useTranslation } from "react-i18next";
import { BanxaCheck, banxaService, OrderENDReason } from "../../services/banxa";
import { useRouteMatch } from "react-router-dom";

export enum RAMP_SELL_PANEL {
  LIST,
  RAMP_CONFIRM,
  BANXA_CONFIRM,
}

export const useVendor = () => {
  const { account } = useAccount();
  const { t } = useTranslation();
  const { setShowTradeIsFrozen } = useOpenModals();

  const banxaRef = React.useRef();
  const subject = React.useMemo(() => banxaService.onSocket(), []);

  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const legalShow = (raw_data as any)?.legal?.show;
  const { setShowAccount } = useOpenModals();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const match: any = useRouteMatch("/trade/:fiat/:tab?");

  const {
    // updateOffRampData,
    resetOffRampData,
  } = useModalData();

  const [sellPanel, setSellPanel] = React.useState<RAMP_SELL_PANEL>(
    RAMP_SELL_PANEL.LIST
    // RAMP_SELL_PANEL.BANXA_CONFIRM
  );
  React.useEffect(() => {
    if (match?.params?.tab === "Sell") {
      setSellPanel(RAMP_SELL_PANEL.LIST);
    }
  }, [match?.params?.tab]);

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
                hostLogoUrl: "https://ramp.network/assets/images/Logo.svg",
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
                    description: t(dex),
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
                description: t(dex),
              },
            });
            if (legalEnable) {
              window.open(
                "https://loopring.banxa.com/iframe?code=1fe263e17175561954c6&buyMode&walletAddress=" +
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
        //         hostLogoUrl: "https://ramp.network/assets/images/Logo.svg",
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
        //               setSellPanel(RAMP_SELL_PANEL.CONFIRM);
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
          handleSelect: async (_event) => {
            setShowAccount({ isShow: false });
            banxaService.banxaStart();
            // @ts-ignore
          },
        },
      ]
    : [];

  const closeBanxa = () => {
    const parentsNode: any =
      window.document.querySelector("#iframeBanxaTarget");
    // const items = parentsNode.getElementsByTagName("iframe");
    // if (items && items[0]) {
    //   parentsNode.removeChild(items[0]);
    // }
    parentsNode.style.display = "none";
  };
  const hideBanxa = () => {
    const parentsNode: any =
      window.document.querySelector("#iframeBanxaTarget");

    parentsNode.style.display = "none";
  };
  const showBanxa = () => {
    const parentsNode: any =
      window.document.querySelector("#iframeBanxaTarget");
    parentsNode.style.display = "flex";
  };
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
      myLog("subscription Banxa", props.status, props.data);
      switch (props.status) {
        // case BanxaCheck.CheckOrderStatus:
        //   checkOrderStatus(props.data);
        //   break;
        case BanxaCheck.OrderHide:
          hideBanxa();
          break;
        case BanxaCheck.OrderShow:
          showBanxa();
          break;
        case BanxaCheck.OrderEnd:
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
