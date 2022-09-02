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
} from "@loopring-web/common-resources";
import {
  checkErrorInfo,
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
import React, { useCallback } from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import { useWalletInfo } from "../../stores/localStore/walletInfo";

export enum RAMP_SELL_PANEL {
  LIST,
  CONFIRM,
}

export const useVendor = () => {
  const { account } = useAccount();
  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const legalShow = (raw_data as any)?.legal?.show;
  const { setShowAccount } = useOpenModals();
  // const { isMobile } = useSettings();
  const { updateOffRampData, resetOffRampData } = useModalData();

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
  const vendorListSell: VendorItem[] = legalShow
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
                defaultFlow: "OFFRAMP",
                enabledFlows: ["OFFRAMP"],
                url: "https://ri-widget-dev-5.web.app", //"https://ri-widget-dev-5.firebaseapp.com",
              };
              config = {
                ...config,
                hostApiKey: "3qncr4yvxfpro6endeaeu6npkh8qc23e9uadtazq",
              };
              window.rampInstance = new RampInstantSDK({
                ...config,
              });
              window.rampInstance.onSendCrypto(
                (
                  assetSymbol: string,
                  amount: string,
                  destinationAddress: string
                ) => {
                  if (window.rampInstance) {
                    try {
                      updateOffRampData({
                        send: { assetSymbol, amount, destinationAddress },
                      });
                      setSellPanel(RAMP_SELL_PANEL.CONFIRM);
                      console.log(
                        "onSendCrypto",
                        assetSymbol,
                        destinationAddress
                      );
                      //@ts-ignore
                      window.rampInstance.domNodes.overlay.style.display =
                        "none";
                      console.log("RAMP WEIGHT hidden on send Crypto");
                    } catch (e) {
                      console.log("RAMP WEIGHT hidden failed");
                    }
                  } else {
                    resetOffRampData();
                    setSellPanel(RAMP_SELL_PANEL.LIST);
                  }
                  return new Promise(() => {});
                }
              );
              window.rampInstance.on(RampInstantEventTypes.WIDGET_CLOSE, () => {
                console.log("RAMP WEIGHT close");
                resetOffRampData();
                setSellPanel(RAMP_SELL_PANEL.LIST);
                if (window.rampInstance) {
                  window.rampInstance.unsubscribe("*", () => undefined);
                  window.rampInstance = undefined;
                }
              });
              console.log("RAMP WEIGHT display on send user selected");
              window.rampInstance.show();
            }
          },
        },
      ]
    : [];
  return {
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
          window.rampInstance
        ) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          updateTransferRampData({ __request__: request });
          const response = await LoopringAPI.userAPI.submitInternalTransfer(
            {
              request,
              web3: connectProvides.usedWeb3,
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
            const code = checkErrorInfo(
              response as sdk.RESULT_INFO,
              isNotHardwareWallet
            );
            if (code === sdk.ConnectorError.USER_DENIED) {
              setShowAccount({
                isShow: true,
                step: AccountStep.Transfer_RAMP_User_Denied,
              });
              // setIsConfirmTransfer(false);
            } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
              setShowAccount({
                isShow: true,
                step: AccountStep.Transfer_RAMP_First_Method_Denied,
              });
            } else {
              let info = {};
              if (
                [102024, 102025, 114001, 114002].includes(
                  (response as sdk.RESULT_INFO)?.code || 0
                )
              ) {
                info = {
                  transferRamp: AccountStep.Transfer_RAMP_Failed,
                  trigger: "checkFeeIsEnough",
                };
              }
              setShowAccount({
                isShow: true,
                step: AccountStep.Transfer_RAMP_Failed,
                error: response as sdk.RESULT_INFO,
                ...info,
              });
              // setIsConfirmTransfer(false);
            }
          } else if ((response as sdk.TX_HASH_API)?.hash) {
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
                  Explorer +
                  `tx/${(response as sdk.TX_HASH_API)?.hash}-transfer`,
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
          } else {
            resetTransferRampData();
          }
        } else {
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_RAMP_Failed,
            error: {
              code: UIERROR_CODE.ERROR_RAMP_NO_INSTANCE,
            },
          });
        }
      } catch (reason: any) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_RAMP_User_Denied,
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_RAMP_First_Method_Denied,
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_RAMP_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: reason?.message,
              },
            });
          }
        }
      }
    },
    []
  );
  return { processRequestRampTransfer };
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
  const { processRequestRampTransfer: processRequest } = useRampTransPost();
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
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    setIsFeeNotEnough,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    updateData: ({ fee }) => {
      const { transferRampValue } = store.getState()._router_modalData;
      updateTransferRampData({ ...transferRampValue, fee });
    },
  });
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
        if (isExceedBalance && feeToken.tokenId === sellToken.tokenId) {
          setIsFeeNotEnough({
            isFeeNotEnough: true,
            isOnLoading: false,
          });
        } else if (isExceedBalance) {
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
    transferRampValue.balance,
    transferRampValue.belong,
    transferRampValue.fee,
    transferRampValue.tradeValue,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [chargeFeeTokenList, isFeeNotEnough.isFeeNotEnough, transferRampValue]);

  const onTransferClick = useCallback(
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
