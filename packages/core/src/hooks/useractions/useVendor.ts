import {
  AccountStatus,
  AddressError,
  CoinMap,
  Explorer,
  FeeInfo,
  IBData,
  myLog,
  UIERROR_CODE,
  VendorItem,
  VendorList,
  WALLET_TYPE,
  WalletMap,
  TOAST_TIME,
  BANXA_URLS,
} from "@loopring-web/common-resources";
import {
  DAYS,
  getTimestampDaysLater,
  isAccActivated,
  LoopringAPI,
  makeWalletLayer2,
  store,
  useAccount,
  useBtnStatus,
  useChargeFees,
  useModalData,
  useSystem,
  useTokenMap,
  useWalletLayer2Socket,
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
import moment from "moment";
import axios from "axios";
import { ChainId } from "@loopring-web/loopring-sdk";

export enum RAMP_SELL_PANEL {
  LIST,
  CONFIRM,
}

const banxaApiCall = async ({
  url,
  query,
  payload,
  method,
  chainId,
}: {
  url: string;
  query: URLSearchParams | string | string[][];
  payload: object;
  method: sdk.ReqMethod;
  chainId: ChainId;
}): Promise<{ [key: string]: any }> => {
  const querys = url + "?" + new URLSearchParams(query).toString();
  const apiKey = await LoopringAPI.globalAPI?.getBanxaAPI({
    method,
    query: querys,
    payload: JSON.stringify(payload),
  });
  const bearer: string = (apiKey?.result as string) ?? "";
  myLog("apiKey", bearer, query, new URLSearchParams(query).toString());
  const _axios = axios.create({
    baseURL: BANXA_URLS[chainId as number],
    timeout: 6000,
    headers: {
      // Accept: "application/json",
      Authorization: bearer,
      "Content-Type": "application/json",
    },
    validateStatus: function (status: any) {
      if ((status >= 200 && status < 300) || status === 400) {
        return true;
      }
      return false;
      // return true // always true, handle exception in each bussiness logic
    },
  });
  const result = await _axios.request({ method, url: querys, data: payload });
  return { ...result };
};
export const useVendor = () => {
  const { account } = useAccount();
  const banxaRef = React.useRef();
  const {
    allowTrade: { raw_data },
    chainId,
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const legalShow = (raw_data as any)?.legal?.show;
  const { setShowAccount } = useOpenModals();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const [banxaOrder, setBanxaOrder] = React.useState(undefined);

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
              });
            }
          },
        },
        {
          ...VendorList.Banxa,
          handleSelect: () => {
            setShowAccount({ isShow: false });
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

  const checkBanxaOrder = React.useCallback(
    async ({ url, query, payload, method }: any) => {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
      banxaApiCall({
        url,
        query,
        payload,
        method,
        chainId: chainId as ChainId,
      });

      // const result = await fetch(query, {
      //   method,
      //   // withCredentials: true,
      //   // credentials: "include",
      //   headers: {},
      // });

      // LoopringAPI.globalAPI.In;

      // myLog(result.request);
      // if (result && result.data && result.orders) {
      //   debugger;
      // }
      //   .then((result) => {
      //   if (result && result?.length) {
      //     debugger;
      //     setBanxaOrder(query);
      //   }
      // });
      // .then(({raw_data}) => {
      //   LoopringAPI.globalAPI.raw_data
      //   //
      //   setBanxaOrder;
      // });
      if (nodeTimer.current) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout);
      }
      nodeTimer.current = setTimeout(() => {
        checkBanxaOrder({ url, query, payload, method });
        // updateNFTRefreshHash(popItem.nftData);
      }, 90000);
      // if (
      //   // popItem.nftData &&
      //   // nftDataHashes &&
      //   // nftDataHashes[popItem.nftData.toLowerCase()]
      // ) {
      //
      //
      // }
      // else {
      //   setShowFresh("click");
      // }
      return () => {
        clearTimeout(nodeTimer.current as NodeJS.Timeout);
      };
    },
    [nodeTimer]
  );
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
          handleSelect: async (event) => {
            setShowAccount({ isShow: false });
            // @ts-ignore
            const banxa: any = new window.Banxa("loopring", "sandbox");
            // @ts-ignore
            const anchor: HTMLElement = (
              (event?.target as HTMLElement).ownerDocument || document
            ).querySelector("#iframeBanxaTarget");
            if (banxaRef && anchor) {
              // debugger;
              anchor.style.display = "flex";

              const { checkout_url } = await banxaApiCall({
                chainId: chainId as ChainId,
                method: sdk.ReqMethod.POST,
                url: "/api/orders",
                query: "",
                payload: {
                  source: "USD",
                  target: "USDC",
                  refund_address: account.accAddress,
                  return_url_on_success: "https://loopring.io/#/l2assets",
                  account_reference: account.accAddress,
                },
              });

              // @ts-ignore
              // const url = banxa.generateUrl({
              //   sellMode: true,
              //   blockchain: "LRC",
              //   fiatType: "AUD",
              //   coinType: "BTC",
              //   // fiatAmount: 200,
              //   // coinAmount: 0.5,
              //   // walletAddress: account.accAddress,
              //   account_reference: account.accAddress,
              //   refund_address: account.accAddress,
              //   return_url_on_success: "https://loopring.io/#/l2assets",
              // });
              // myLog("url", url);
              banxa.generateIframe(
                "#iframeBanxaTarget",
                checkout_url,
                false,
                false
                // "800px", //Optional width parameter – Pass false if not needed.
                // "400px" //Optional height parameter – Pass false if not needed.
              );
              const querys = {
                account_reference: account.accAddress,
                start_date: moment(Date.now())
                  .add(-1, "days")
                  .format("YYYY-MM-DD"),
                end_date: moment(Date.now()).format("YYYY-MM-DD"),
                status: "waitingPayment",
              };
              const method = sdk.ReqMethod.GET;

              const query = "/api/orders";
              const payload = "";
              checkBanxaOrder({
                method,
                url: query,
                query: querys,
                // new URLSearchParams(querys as any).toString(),
                payload,
              });

              // loopring.banxa.com
            }
          },
        },
      ]
    : [];
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
export const useRampConfirm = <T extends IBData<I>, I, _C extends FeeInfo>({
  sellPanel,
  setSellPanel,
}: {
  sellPanel: RAMP_SELL_PANEL;
  setSellPanel: (value: RAMP_SELL_PANEL) => void;
}) => {
  const { exchangeInfo } = useSystem();

  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const { tokenMap, totalCoinMap } = useTokenMap();
  const {
    setShowAccount,
    modals: {
      isShowAccount: { info },
    },
  } = useOpenModals();
  const { account } = useAccount();
  const [balanceNotEnough, setBalanceNotEnough] = React.useState(false);
  const { offRampValue } = useModalData();
  const {
    processRequestRampTransfer: processRequest,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useRampTransPost();
  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<T>)
  );
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
  }, []);

  useWalletLayer2Socket({ walletLayer2Callback });

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const { transferRampValue, updateTransferRampData, resetOffRampData } =
    useModalData();

  React.useEffect(() => {
    if (
      info?.transferRamp === AccountStep.Transfer_RAMP_Failed &&
      info?.trigger == "checkFeeIsEnough"
    ) {
      checkFeeIsEnough();
    }
  }, [info?.transferRamp]);

  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      chargeFeeTokenList.length &&
      !isFeeNotEnough.isFeeNotEnough &&
      transferRampValue.belong &&
      tokenMap[transferRampValue.belong] &&
      transferRampValue.fee &&
      transferRampValue.fee.belong &&
      transferRampValue.address
    ) {
      const sellToken = tokenMap[transferRampValue.belong];
      const feeToken = tokenMap[transferRampValue.fee.belong];
      const feeRaw =
        transferRampValue.fee.feeRaw ??
        transferRampValue.fee.__raw__?.feeRaw ??
        0;
      const fee = sdk.toBig(feeRaw);
      const balance = sdk
        .toBig(transferRampValue.balance ?? 0)
        .times("1e" + sellToken.decimals);
      const tradeValue = sdk
        .toBig(transferRampValue.tradeValue ?? 0)
        .times("1e" + sellToken.decimals);
      const isExceedBalance = tradeValue
        .plus(feeToken.tokenId === sellToken.tokenId ? fee : "0")
        .gt(balance);
      myLog(
        "isExceedBalance",
        isExceedBalance,
        fee.toString(),
        tradeValue.toString()
      );
      if (tradeValue && !isExceedBalance) {
        enableBtn();
        return;
      } else {
        disableBtn();
        // if (isExceedBalance && feeToken.tokenId === sellToken.tokenId) {
        //   // setIsFeeEnough(isFeeNotEnoughtrue);
        //   // setIsFeeNotEnough({
        //   //   isFeeNotEnough: true,
        //   //   isOnLoading: false,
        //   // });
        //   setBalanceNotEnough(true);
        // } else
        if (isExceedBalance) {
          setBalanceNotEnough(true);
        }
        // else {
        //
        // }
      }
    }
    disableBtn();
  }, [
    chargeFeeTokenList.length,
    disableBtn,
    enableBtn,
    isFeeNotEnough.isFeeNotEnough,
    tokenMap,
    transferRampValue.address,
    transferRampValue.balance,
    transferRampValue.belong,
    transferRampValue.fee,
    transferRampValue.tradeValue,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [chargeFeeTokenList, isFeeNotEnough.isFeeNotEnough, transferRampValue]);

  const onTransferClick = React.useCallback(
    async (transferRampValue, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        transferRampValue.address !== "*" &&
        transferRampValue?.fee &&
        transferRampValue?.fee.belong &&
        transferRampValue.fee?.__raw__ &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_RAMP_WaitForAuth,
          });

          const sellToken = tokenMap[transferRampValue.belong as string];
          const feeToken = tokenMap[transferRampValue.fee.belong];
          const feeRaw =
            transferRampValue.fee.feeRaw ??
            transferRampValue.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);
          // const balance = sdk
          //   .toBig(transferRampValue.balance ?? 0)
          //   .times("1e" + sellToken.decimals);
          const tradeValue = sdk
            .toBig(transferRampValue.tradeValue ?? 0)
            .times("1e" + sellToken.decimals);
          // const isExceedBalance =
          //   feeToken.tokenId === sellToken.tokenId &&
          //   tradeValue.plus(fee).gt(balance);
          const finalVol = tradeValue;
          const transferVol = finalVol.toFixed(0, 0);

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: sellToken.tokenId,
            },
            apiKey
          );
          const req: sdk.OriginTransferRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            payerAddr: accAddress,
            payerId: accountId,
            payeeAddr: transferRampValue.address,
            payeeId: 0,
            storageId: storageId?.offchainId,
            token: {
              tokenId: sellToken.tokenId,
              volume: transferVol,
            },
            maxFee: {
              tokenId: feeToken.tokenId,
              volume: fee.toString(), // TEST: fee.toString(),
            },
            validUntil: getTimestampDaysLater(DAYS),
            memo: transferRampValue.memo,
          };

          myLog("transfer req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_RAMP_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              message: e.message,
            } as sdk.RESULT_INFO,
          });
        }
      } else {
        return;
      }
    },
    [account, tokenMap, exchangeInfo, setShowAccount, processRequest]
  );

  // const [rampViewProps, setRampViewProps] =
  //   React.useState<RampViewProps<T, I, C> | undefined>(undefined);

  const initRampViewProps = React.useCallback(() => {
    if (offRampValue?.send && window.rampInstance) {
      const { amount, assetSymbol, destinationAddress } = offRampValue?.send;

      const memo = "OFF-RAMP Transfer";
      updateTransferRampData({
        belong: assetSymbol,
        tradeValue: Number(amount),
        balance: walletMap[assetSymbol]?.count,
        fee: feeInfo,
        memo,
        address: destinationAddress as string,
      });
      return;
    }
    if (window.rampInstance) {
      window.rampInstance.close();
    } else {
      setSellPanel(RAMP_SELL_PANEL.LIST);
      resetOffRampData();
    }
  }, [
    btnStatus,
    chargeFeeTokenList,
    feeInfo,
    handleFeeChange,
    isFeeNotEnough,
    legalEnable,
    onTransferClick,
    setSellPanel,
    totalCoinMap,
    updateTransferRampData,
  ]);
  React.useEffect(() => {
    if (RAMP_SELL_PANEL.CONFIRM) {
      initRampViewProps();
    } else {
      //TODO MOCK
      // resetTransferRampData();
    }
  }, [sellPanel, walletMap]);

  const rampViewProps = React.useMemo(() => {
    const { address, memo, fee, __request__, ...tradeData } = transferRampValue;
    return {
      type: "TOKEN",
      disabled: !legalEnable,
      addressDefault: address,
      realAddr: address,
      tradeData,
      coinMap: totalCoinMap as CoinMap<T>,
      transferBtnStatus: btnStatus,
      isLoopringAddress: true,
      isSameAddress: false,
      isAddressCheckLoading: WALLET_TYPE.Loopring,
      feeInfo,
      handleFeeChange,
      balanceNotEnough,
      chargeFeeTokenList,
      isFeeNotEnough,
      handleSureItsLayer2: () => undefined,
      sureItsLayer2: true,
      onTransferClick,
      handlePanelEvent: () => undefined,
      addrStatus: AddressError.NoError,
      memo,
      walletMap,
      handleOnMemoChange: () => undefined,
      handleOnAddressChange: () => undefined,
    } as any;
  }, [
    balanceNotEnough,
    btnStatus,
    chargeFeeTokenList,
    feeInfo,
    handleFeeChange,
    isFeeNotEnough,
    legalEnable,
    onTransferClick,
    totalCoinMap,
    transferRampValue,
    walletMap,
  ]);

  return { rampViewProps };
};
