import {
  AccountStatus,
  AddressError,
  CoinMap,
  Explorer,
  FeeInfo,
  getValuePrecisionThousand,
  IBData,
  myLog,
  TradeStatus,
  UIERROR_CODE,
  VendorItem,
  VendorList,
  WALLET_TYPE,
  WalletMap,
} from "@loopring-web/common-resources";
import {
  checkErrorInfo,
  DAYS,
  getTimestampDaysLater,
  isAccActivated,
  LoopringAPI,
  makeWalletLayer2,
  TOAST_TIME,
  useAccount,
  useBtnStatus,
  useChargeFees,
  useModalData,
  useSystem,
  useTokenMap,
  walletLayer2Service,
} from "../../index";
import {
  RampInstantEventTypes,
  RampInstantSDK,
  RampInstantEvent,
} from "@ramp-network/ramp-instant-sdk";
import {
  AccountStep,
  RampViewProps,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import { IOfframpPurchase } from "@ramp-network/ramp-instant-sdk/dist/types/types";
import React, { useCallback } from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";

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
  const { isMobile } = useSettings();
  const { updateOffRampData } = useModalData();
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
                variant: isMobile ? "mobile" : "desktop",
                userAddress: account.accAddress,
                defaultFlow: "ONRAMP",
                enabledFlows: ["OFFRAMP", "ONRAMP"],
                url: "https://ri-widget-dev-5.web.app",
              };
              if (account && account.accountId && account.accountId !== -1) {
                config = {
                  ...config,
                  swapAsset: "LOOPRING_*",
                  hostApiKey: "3qncr4yvxfpro6endeaeu6npkh8qc23e9uadtazq",

                  // hostApiKey: "r6e232on45rt3ukdb7zbcvh3avdwbqpore5rbht7",
                };
              } else {
                config = {
                  ...config,
                  swapAsset: "LOOPRING_ETH,LOOPRING_USDC,LOOPRING_LRC",
                  hostApiKey: "3qncr4yvxfpro6endeaeu6npkh8qc23e9uadtazq",

                  // hostApiKey: "xqh8ej6ye2rpoj528xd6rkghsgmyrk4hxb7kxarz",
                };
              }
              return new RampInstantSDK({
                ...config,
              }).show();
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
                variant: isMobile ? "mobile" : "desktop",
                userAddress: account.accAddress,
                defaultFlow: "OFFRAMP",
                enabledFlows: ["OFFRAMP", "ONRAMP"],
                url: "https://ri-widget-dev-5.web.app",
              };
              if (account && account.accountId && account.accountId !== -1) {
                config = {
                  ...config,
                  swapAsset: "LOOPRING_*",
                  hostApiKey: "3qncr4yvxfpro6endeaeu6npkh8qc23e9uadtazq",

                  // hostApiKey: "r6e232on45rt3ukdb7zbcvh3avdwbqpore5rbht7",
                };
                config = {
                  ...config,
                  swapAsset: "LOOPRING_ETH,LOOPRING_USDC,LOOPRING_LRC",
                  hostApiKey: "3qncr4yvxfpro6endeaeu6npkh8qc23e9uadtazq",
                  // hostApiKey: "xqh8ej6ye2rpoj528xd6rkghsgmyrk4hxb7kxarz",
                };
              }
              return new RampInstantSDK({
                ...config,
              })
                .show()
                .on(
                  RampInstantEventTypes.OFFRAMP_PURCHASE_CREATED,
                  (event: RampInstantEvent) => {
                    // id: string;
                    // createdAt: string;
                    // crypto: {
                    //   amount: string;
                    //   assetInfo: {
                    //     address: string | null;
                    //     symbol: string;
                    //     chain: string;
                    //     type: string;
                    //     name: string;
                    //     decimals: number;
                    //   };
                    // };
                    // fiat: {
                    //   amount: number;
                    //   currencySymbol: string;
                    // };
                    const offrampPurchase = event.payload as IOfframpPurchase;
                    setSellPanel(RAMP_SELL_PANEL.CONFIRM);
                    updateOffRampData(offrampPurchase);
                  }
                );
            }
          },
        },
        // {
        //   ...VendorList.Banxa,
        //   handleSelect: () => {
        //     setShowAccount({ isShow: false });
        //     if (legalEnable) {
        //       window.open(
        //         "https://loopring.banxa.com/iframe?code=1fe263e17175561954c6&buyMode&walletAddress=" +
        //         account.accAddress,
        //         "_blank"
        //       );
        //       window.opener = null;
        //     }
        //   },
        // },
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

export const useRampConfirm = <T extends IBData<I>, I, C extends FeeInfo>({
  sellPanel,
  setSellPanel,
}: {
  sellPanel: RAMP_SELL_PANEL;
  setSellPanel: (value: RAMP_SELL_PANEL) => void;
}) => {
  const { offRampValue } = useModalData();
  const { tokenMap, totalCoinMap } = useTokenMap();
  const walletMap = makeWalletLayer2(true).walletMap ?? ({} as WalletMap<T>);
  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const { transferValue, updateTransferData, resetTransferData } =
    useModalData();
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    updateData: React.useCallback(
      ({ fee }) => {
        updateTransferData({ ...transferValue, fee });
      },
      [transferValue]
    ),
  });
  const processRequest = React.useCallback(
    async (
      request: sdk.OriginTransferRequestV3,
      isNotHardwareWallet: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          setLastRequest({ request });
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
                step: AccountStep.Transfer_User_Denied,
              });
              // setIsConfirmTransfer(false);
            } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
              setShowAccount({
                isShow: true,
                step: AccountStep.Transfer_First_Method_Denied,
              });
            } else {
              if (
                [102024, 102025, 114001, 114002].includes(
                  (response as sdk.RESULT_INFO)?.code || 0
                )
              ) {
                checkFeeIsEnough(true);
              }
              setShowAccount({
                isShow: true,
                step: AccountStep.Transfer_Failed,
                error: response as sdk.RESULT_INFO,
              });
              // setIsConfirmTransfer(false);
            }
          } else if ((response as sdk.TX_HASH_API)?.hash) {
            // setIsConfirmTransfer(false);
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_In_Progress,
            });
            await sdk.sleep(TOAST_TIME);
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_Success,
              info: {
                hash:
                  Explorer +
                  `tx/${(response as sdk.TX_HASH_API)?.hash}-transfer`,
              },
            });
            if (isHWAddr) {
              myLog("......try to set isHWAddr", isHWAddr);
              updateHW({ wallet: account.accAddress, isHWAddr });
            }
            walletLayer2Service.sendUserUpdate();
            resetTransferData();
          } else {
            resetTransferData();
          }
        }
      } catch (reason: any) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_User_Denied,
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_First_Method_Denied,
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: reason?.message,
              },
            });
          }
        }
      }
    },
    [
      account,
      checkHWAddr,
      chainId,
      setShowAccount,
      resetTransferData,
      updateHW,
      checkFeeIsEnough,
    ]
  );

  const onTransferClick = useCallback(
    async (transferValue, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        transferValue.address !== "*" &&
        transferValue?.fee &&
        transferValue?.fee.belong &&
        transferValue.fee?.__raw__ &&
        eddsaKey?.sk
      ) {
        try {
          setShowTransfer({ isShow: false });
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_WaitForAuth,
          });

          const sellToken = tokenMap[transferValue.belong as string];
          const feeToken = tokenMap[transferValue.fee.belong];
          const feeRaw =
            transferValue.fee.feeRaw ?? transferValue.fee.__raw__?.feeRaw ?? 0;
          const fee = sdk.toBig(feeRaw);
          const balance = sdk
            .toBig(transferValue.balance ?? 0)
            .times("1e" + sellToken.decimals);
          const tradeValue = sdk
            .toBig(transferValue.tradeValue ?? 0)
            .times("1e" + sellToken.decimals);
          const isExceedBalance =
            feeToken.tokenId === sellToken.tokenId &&
            tradeValue.plus(fee).gt(balance);
          const finalVol = isExceedBalance ? balance.minus(fee) : tradeValue;
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
            payeeAddr: realAddr ? realAddr : address,
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
            memo: transferValue.memo,
          };

          myLog("transfer req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_Failed,
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
    [
      account,
      tokenMap,
      exchangeInfo,
      setShowTransfer,
      setShowAccount,
      realAddr,
      address,
      processRequest,
    ]
  );

  const [rampViewProps, setRampViewProps] = React.useState<
    RampViewProps<T, I, C> | undefined
  >(() => {
    if (offRampValue !== {}) {
      if (
        "Ethereum" === (offRampValue as IOfframpPurchase).crypto.assetInfo.chain
      ) {
        const {
          crypto: {
            amount,
            assetInfo: { address, symbol },
          },
        } = offRampValue as IOfframpPurchase;
        const tradeData = {
          belong: symbol,
          tradeValue: amount,
          balance: walletMap[symbol]?.count,
        };
        const memo = "OFF-RAMP Transfer";
        updateTransferData({
          ...tradeData,
          fee: feeInfo,
          memo,
          address: address as string,
        });
        return {
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
          chargeFeeTokenList,
          isFeeNotEnough,
          handleSureItsLayer2: () => undefined,
          sureItsLayer2: true,
          onTransferClick,
          handlePanelEvent: () => undefined,
          addrStatus: AddressError.NoError,
          memo,
          handleOnMemoChange: () => undefined,
          handleOnAddressChange: () => undefined,
          // sureItsLayer2:true,
          // handleConfirm: (),
          // tradeData,
          // onTransferClick,
          // realAddr,
          // isFeeNotEnough,
          // handleFeeChange,
          // chargeFeeTokenList,
          // feeInfo,
          // memo,

          // }
        };
      } else {
        return undefined;
        setSellPanel(RAMP_SELL_PANEL.LIST);
      }
    } else {
      return undefined;
      setSellPanel(RAMP_SELL_PANEL.LIST);
    }
  });
  React.useEffect(() => {}, [sellPanel]);

  return { vendorList, vendorForce: undefined };
};
