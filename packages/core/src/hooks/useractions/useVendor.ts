import {
  AccountStatus,
  Explorer,
  myLog,
  UIERROR_CODE,
  VendorItem,
  VendorList,
  TOAST_TIME,
} from "@loopring-web/common-resources";
import {
  isAccActivated,
  LoopringAPI,
  store,
  useAccount,
  useChargeFees,
  useModalData,
  useSystem,
  walletLayer2Service,
} from "../../index";
import {
  RampInstantEventTypes,
  RampInstantSDK,
} from "@ramp-network/ramp-instant-sdk";
import { AccountStep, useOpenModals } from "@loopring-web/component-lib";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import Web3 from "web3";
import { useTranslation } from "react-i18next";
import { BanxaCheck, banxaService, OrderENDReason } from "../../services/banxa";

export enum RAMP_SELL_PANEL {
  LIST,
  RAMP_CONFIRM,
  BANXA_CONFIRM,
}

export const useVendor = () => {
  const { account } = useAccount();
  const { t } = useTranslation();
  const banxaRef = React.useRef();
  const subject = React.useMemo(() => banxaService.onSocket(), []);

  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const legalShow = (raw_data as any)?.legal?.show;
  const { setShowAccount } = useOpenModals();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  // const [banxaOrder, setBanxaOrder] = React.useState(undefined);
  // const { isMobile } = useSettings();
  const {
    // updateOffRampData,
    resetOffRampData,
  } = useModalData();

  const [sellPanel, setSellPanel] = React.useState<RAMP_SELL_PANEL>(
    RAMP_SELL_PANEL.LIST
  );

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

  // const checkBanxaOrder = React.useCallback(
  //   async ({ url, query, payload, method }: any) => {
  //     clearTimeout(nodeTimer.current as NodeJS.Timeout);
  //
  //     banxaApiCall({
  //       url,
  //       query,
  //       payload,
  //       method,
  //       chainId: chainId as ChainId,
  //     });
  //
  //     // const result = await fetch(query, {
  //     //   method,
  //     //   // withCredentials: true,
  //     //   // credentials: "include",
  //     //   headers: {},
  //     // });
  //
  //     // LoopringAPI.globalAPI.In;
  //
  //     // myLog(result.request);
  //     // if (result && result.data && result.orders) {
  //     //   debugger;
  //     // }
  //     //   .then((result) => {
  //     //   if (result && result?.length) {
  //     //     debugger;
  //     //     setBanxaOrder(query);
  //     //   }
  //     // });
  //     // .then(({raw_data}) => {
  //     //   LoopringAPI.globalAPI.raw_data
  //     //   //
  //     //   setBanxaOrder;
  //     // });
  //     if (nodeTimer.current) {
  //       clearTimeout(nodeTimer.current as NodeJS.Timeout);
  //     }
  //     nodeTimer.current = setTimeout(() => {
  //       checkBanxaOrder({ url, query, payload, method });
  //       // updateNFTRefreshHash(popItem.nftData);
  //     }, 90000);
  //     // if (
  //     //   // popItem.nftData &&
  //     //   // nftDataHashes &&
  //     //   // nftDataHashes[popItem.nftData.toLowerCase()]
  //     // ) {
  //     //
  //     //
  //     // }
  //     // else {
  //     //   setShowFresh("click");
  //     // }
  //     return () => {
  //       clearTimeout(nodeTimer.current as NodeJS.Timeout);
  //     };
  //   },
  //   [nodeTimer]
  // );
  const vendorListSell: VendorItem[] = legalShow
    ? [
        // {
        //   // key: VendorProviders.Ramp,
        //   // svgIcon: "RampIcon",
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
        //loopring.banxa-sandbox.com/?sellMode&expires=1669311302&id=30090bbc-0fb4-4263-be91-c18d25de95ff&nested=1&oid=4b69ea208975f05c0e7b7c9a0515438c&signature=ae07724179d41f5766973dbc375c2acf18643c3756e7b0a40ad996ead3c6d535
        //loopring.banxa-sandbox.com/?sellMode&expires=1669311133&id=700a332c-ec77-4816-8a2e-9f16b6219b36&nested=1&oid=f4724af852c6fdf54feed58f36f64f2c&signature=0faf71c7751b84ed3b995db77d41bf5a851083baa5a7c556eb2d28a10289533c
        // @ts-ignore
        // const url = banxa.generateUrl({
        //   sellMode: true,
        //           blockchain: "LRC",
        //   fiatType: "AUD",
        //   coinType: "BTC",
        //   // fiatAmount: 200,
        //   // coinAmount: 0.5,
        //   // walletAddress: account.accAddress,
        //           account_reference: account.accAddress,
        //           refund_address: account.accAddress,
        //         }),
        //         false,
        //         false
        //         // "800px", //Optional width parameter – Pass false if not needed.
        //         // "400px" //Optional height parameter – Pass false if not needed.
        //       );
        //     }
        //   },
        // },
      ]
    : [];
  // React.useEffect(() => {
  //
  //
  //
  //   return () => {
  //
  //
  //   };
  // }, []);
  const closeBanax = () => {
    const parentsNode: any =
      window.document.querySelector("#iframeBanxaTarget");
    const items = parentsNode.getElementsByTagName("iframe");
    if (items && items[0]) {
      parentsNode.removeChild(items[0]);
    }
    parentsNode.style.display = "none";
  };
  const hideBanax = () => {
    const parentsNode: any =
      window.document.querySelector("#iframeBanxaTarget");

    parentsNode.style.display = "none";
  };
  const showBanax = () => {
    const parentsNode: any =
      window.document.querySelector("#iframeBanxaTarget");
    parentsNode.style.display = "flex";
  };
  React.useEffect(() => {
    const close = window.document.querySelector("#iframeBanxaClose");
    const parentsNode = window.document.querySelector("#iframeBanxaTarget");
    const clickEvent = () =>
      banxaService.banxaEnd({
        reason: OrderENDReason.UserCancel,
        data: undefined,
      });
    if (close && parentsNode) {
      parentsNode.addEventListener("click", clickEvent);
    }
    const subscription = subject.subscribe((props) => {
      myLog("subscription Deposit DepsitERC20");

      switch (props.status) {
        // case BanxaCheck.CheckOrderStatus:
        //   checkOrderStatus(props.data);
        //   break;
        case BanxaCheck.OrderHide:
          hideBanax();
          break;
        case BanxaCheck.OrderShow:
          showBanax();
          break;
        case BanxaCheck.OrderEnd:
          closeBanax();
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
      closeBanax();
    };
  }, [subject]);
  return {
    banxaRef,
    vendorListBuy,
    vendorListSell,
    vendorForce: undefined,
    sellPanel,
    setSellPanel,
  };
};
export const useRampTransPost = () => {
  const { account } = useAccount();
  const { chainId } = useSystem();
  const { checkHWAddr, updateHW } = useWalletInfo();
  const { setShowAccount } = useOpenModals();
  const { updateTransferRampData, resetTransferRampData } = useModalData();
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    // setIsFeeNotEnough,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    updateData: ({ fee }) => {
      const { transferRampValue } = store.getState()._router_modalData;
      updateTransferRampData({ ...transferRampValue, fee });
    },
  });
  const processRequestRampTransfer = React.useCallback(
    async (
      request: sdk.OriginTransferRequestV3,
      isNotHardwareWallet: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (
          connectProvides.usedWeb3 &&
          LoopringAPI.userAPI &&
          window.rampInstance &&
          isAccActivated()
        ) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          updateTransferRampData({ __request__: request });
          const response = await LoopringAPI.userAPI.submitInternalTransfer(
            {
              request,
              web3: connectProvides.usedWeb3 as unknown as Web3,
              chainId:
                chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
              walletType: (ConnectProvidersSignMap[connectName] ??
                connectName) as unknown as sdk.ConnectorNames,
              eddsaKey: eddsaKey.sk,
              apiKey,
              isHWAddr,
            },
            {
              accountId: account.accountId,
              counterFactualInfo: eddsaKey.counterFactualInfo,
            }
          );

          myLog("submitInternalTransfer:", response);
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          }
          // setIsConfirmTransfer(false);
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_RAMP_In_Progress,
          });
          await sdk.sleep(TOAST_TIME);

          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_RAMP_Success,
            info: {
              hash:
                Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-transfer`,
            },
          });
          if (window.rampInstance) {
            try {
              console.log("RAMP WEIGHT display on transfer done");
              // @ts-ignore
              window.rampInstance.domNodes.overlay.style.display = "";
            } catch (e) {
              console.log("RAMP WEIGHT hidden failed");
            }
          }
          if (isHWAddr) {
            myLog("......try to set isHWAddr", isHWAddr);
            updateHW({ wallet: account.accAddress, isHWAddr });
          }
          walletLayer2Service.sendUserUpdate();
          resetTransferRampData();
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet);
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_RAMP_First_Method_Denied,
            });
            break;
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_RAMP_User_Denied,
            });
            break;
          default:
            if (
              [102024, 102025, 114001, 114002].includes(
                (e as sdk.RESULT_INFO)?.code || 0
              )
            ) {
              checkFeeIsEnough({ isRequiredAPI: true });
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_RAMP_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: e?.message,
                ...(e instanceof Error
                  ? {
                      message: e?.message,
                      stack: e?.stack,
                    }
                  : e ?? {}),
              },
            });
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_Failed,
            });

            break;
        }
      }
    },
    [
      account,
      chainId,
      checkHWAddr,
      resetTransferRampData,
      setShowAccount,
      updateHW,
      updateTransferRampData,
    ]
  );
  return {
    processRequestRampTransfer,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  };
};
