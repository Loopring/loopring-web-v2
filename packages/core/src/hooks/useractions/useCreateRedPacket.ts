import {
  AccountStatus,
  AssetsRawDataItem,
  Explorer,
  FeeInfo,
  getValuePrecisionThousand,
  LIVE_FEE_TIMES,
  myLog,
  NFTWholeINFO,
  REDPACKET_ORDER_LIMIT,
  REDPACKET_ORDER_NFT_LIMIT,
  RedPacketOrderData,
  SUBMIT_PANEL_AUTO_CLOSE,
  TOAST_TIME,
  TRADE_TYPE,
  UIERROR_CODE,
  WalletMap,
} from "@loopring-web/common-resources";
import {
  store,
  useAccount,
  useModalData,
  useSystem,
  useTokenMap,
} from "../../stores";
import {
  AccountStep,
  CreateRedPacketProps,
  RedPacketViewStep,
  SwitchData,
  useOpenModals,
} from "@loopring-web/component-lib";
import React, { useCallback } from "react";
import { makeWalletLayer2 } from "../help";
import {
  useChargeFees,
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../services";
import { useBtnStatus } from "../common";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import { getTimestampDaysLater } from "../../utils";
import { DAYS } from "../../defs";
import Web3 from "web3";
import { isAccActivated } from "./useCheckAccStatus";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import { useRedPacketConfig } from "../../stores/redPacket";
import { useHistory } from "react-router-dom";

export const useCreateRedPacket = <
  T extends RedPacketOrderData<I>,
  I,
  F = FeeInfo,
  NFT = NFTWholeINFO
>({
  assetsRawData,
  isShow = false,
}: {
  assetsRawData: AssetsRawDataItem[];
  isShow?: boolean;
}): {
  createRedPacketProps: CreateRedPacketProps<T, I, F, NFT>;
  retryBtn: (isHardware?: boolean) => void;
} => {
  const { exchangeInfo, chainId } = useSystem();
  const { tokenMap, totalCoinMap } = useTokenMap();
  // const tradeType
  const {
    allowTrade: { transfer: transferEnabale },
  } = useSystem();
  const {
    setShowAccount,
    setShowRedPacket,
    modals: {
      isShowAccount: { info },
    },
  } = useOpenModals();
  const [selectNFT, setSelectNFT] = React.useState<NFT | undefined>(undefined);

  const { redPacketConfigs } = useRedPacketConfig();
  const { redPacketOrder, updateRedPacketOrder, resetRedPacketOrder } =
    useModalData();
  const { account, status: accountStatus } = useAccount();
  const { checkHWAddr, updateHW } = useWalletInfo();
  const feeProps =
    redPacketOrder.tradeType === "TOKEN"
      ? {
          requestType: sdk.OffchainFeeReqType.EXTRA_TYPES,
          extraType: 1,
        }
      : {
          requestType: sdk.OffchainNFTFeeReqType.EXTRA_TYPES,
          tokenAddress: redPacketOrder?.tokenAddress,
          extraType: 1,
          isNFT: true,
        };

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
    // setIsFeeNotEnough,
  } = useChargeFees({
    ...feeProps,
    intervalTime: undefined,
    updateData: ({ fee }) => {
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
      if (redPacketOrder.tradeType === TRADE_TYPE.TOKEN && !feeProps.isNFT) {
        updateRedPacketOrder({
          ...(redPacketOrder as any),
          fee: fee,
        });
      } else if (
        redPacketOrder.tradeType === TRADE_TYPE.NFT &&
        feeProps.isNFT
      ) {
        updateRedPacketOrder({ ...redPacketOrder, fee: fee });
      }
    },
  });

  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<T>)
  );
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
    const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
    if (
      TRADE_TYPE.TOKEN === redPacketOrder.tradeType &&
      !redPacketOrder.belong &&
      walletMap
    ) {
      resetDefault(TRADE_TYPE.TOKEN);
    } else if (
      TRADE_TYPE.TOKEN === redPacketOrder.tradeType &&
      walletMap &&
      walletMap[redPacketOrder.belong]
    ) {
      handleOnDataChange({
        balance: walletMap[redPacketOrder.belong]?.count,
      } as T);
    }
  }, [redPacketOrder, accountStatus]);
  const handleOnDataChange = React.useCallback(
    (tradeData: Partial<T>) => {
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
      if (tradeData.tradeType) {
        resetDefault(tradeData.tradeType);
      } else {
        updateRedPacketOrder({ ...redPacketOrder, ...tradeData });
      }
    },
    [updateRedPacketOrder]
  );
  const resetDefault = React.useCallback(
    (value: TRADE_TYPE) => {
      if (info?.isRetry) {
        checkFeeIsEnough();
        return;
      }
      const walletMap = makeWalletLayer2(true).walletMap ?? {};
      if (TRADE_TYPE.TOKEN === value && !redPacketOrder.belong && walletMap) {
        const keys = Reflect.ownKeys(walletMap);
        for (let key in keys) {
          const keyVal = keys[key];
          const walletInfo = walletMap[keyVal.toString()];
          if (sdk.toBig(walletInfo?.count ?? "0").gt(0)) {
            updateRedPacketOrder({
              belong: keyVal as any,
              tradeValue: undefined,
              fee: feeInfo,
              balance: walletInfo?.count,
              memo: "",
              numbers: undefined,
              validUntil: undefined,
              validSince: Date.now(),
              tradeType: value,
            } as unknown as T);
            break;
          }
        }
      } else if (
        TRADE_TYPE.TOKEN === value &&
        redPacketOrder.belong &&
        walletMap
      ) {
        const walletInfo = walletMap[redPacketOrder.belong];
        updateRedPacketOrder({
          fee: feeInfo,
          belong: redPacketOrder.belong as any,
          tradeValue: undefined as any,
          balance: walletInfo?.count,
          memo: "",
          numbers: undefined,
          validSince: Date.now(),
          validUntil: undefined,
          tradeType: value,
        } as unknown as T);
      } else if (TRADE_TYPE.NFT === value) {
        resetRedPacketOrder(value);
      } else {
        updateRedPacketOrder({
          fee: feeInfo,
          belong: redPacketOrder.belong,
          tradeValue: undefined,
          balance: undefined,
          memo: "",
          numbers: undefined,
          validSince: Date.now(),
          validUntil: undefined,
          tradeType: "TOKEN",
        } as unknown as T);
      }
    },
    [
      checkFeeIsEnough,
      walletMap,
      handleOnDataChange,
      feeInfo,
      redPacketOrder.belong,
      info?.isRetry,
    ]
  );
  useWalletLayer2Socket({ walletLayer2Callback });

  const {
    btnStatus,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
    btnInfo,
  } = useBtnStatus();

  const calcNumberAndAmount = React.useCallback(() => {
    const redPacketOrder = store.getState()._router_modalData
      .redPacketOrder as T;
    if (redPacketOrder.type?.partition === sdk.LuckyTokenAmountType.RANDOM) {
      const eachValue = sdk
        .toBig(redPacketOrder?.tradeValue ?? 0)
        .div(redPacketOrder.numbers ?? 1);
      return {
        tradeValue: redPacketOrder?.tradeValue,
        eachValue:
          redPacketOrder.tradeType === TRADE_TYPE.TOKEN
            ? eachValue.toString()
            : eachValue.toFixed(),
      };
    } else {
      return {
        tradeValue: sdk
          .toBig(redPacketOrder?.tradeValue ?? 0)
          .times(redPacketOrder.numbers ?? 1),
        eachValue: redPacketOrder?.tradeValue,
      };
    }
  }, []);
  const history = useHistory();

  const checkBtnStatus = React.useCallback(() => {
    const _tradeData = calcNumberAndAmount();
    resetBtnInfo();
    if (
      tokenMap &&
      chargeFeeTokenList.length &&
      !isFeeNotEnough.isFeeNotEnough &&
      redPacketOrder.fee &&
      redPacketOrder.fee?.belong &&
      redPacketOrder.numbers &&
      redPacketOrder.numbers > 0 &&
      redPacketOrder.validUntil &&
      redPacketOrder.numbers <= REDPACKET_ORDER_LIMIT &&
      _tradeData.tradeValue &&
      redPacketOrder.memo &&
      redPacketOrder.memo?.trim().length > 0
    ) {
      let tradeToken: any = {},
        balance,
        tradeValue,
        isExceedBalance,
        tooSmall,
        tooLarge;
      const feeToken = tokenMap[redPacketOrder.fee.belong];
      const feeRaw =
        redPacketOrder.fee.feeRaw ?? redPacketOrder.fee.__raw__?.feeRaw ?? 0;
      const fee = sdk.toBig(feeRaw);
      const blindBoxGiftsLargerThanPackets =
        redPacketOrder.tradeType === TRADE_TYPE.NFT &&
        redPacketOrder.type?.mode === sdk.LuckyTokenClaimType.BLIND_BOX &&
        sdk.toBig(redPacketOrder.giftNumbers ?? "0").isGreaterThan(redPacketOrder.numbers)
      if (
        (redPacketOrder as T).tradeType === TRADE_TYPE.TOKEN &&
        redPacketOrder.belong &&
        tokenMap[(redPacketOrder as T).belong as any]
      ) {
        tradeToken = tokenMap[(redPacketOrder as T).belong as any];
        balance = sdk
          .toBig((redPacketOrder as T).balance ?? 0)
          .times("1e" + tradeToken.decimals);
        tradeValue = sdk
          .toBig(_tradeData.tradeValue ?? 0)
          .times("1e" + tradeToken.decimals);
        isExceedBalance = tradeValue
          .plus(feeToken.tokenId === tradeToken.tokenId ? fee : "0")
          .gt(balance);
        const eachValue = sdk
          .toBig(_tradeData.eachValue ?? 0)
          .times("1e" + tradeToken.decimals);
        tooSmall = eachValue.lt(tradeToken.luckyTokenAmounts.minimum);
        tooLarge = tradeValue.gt(tradeToken.luckyTokenAmounts.maximum);
      } else {
        balance = redPacketOrder.balance ?? 0;
        tradeValue = sdk.toBig(redPacketOrder.tradeValue);
        isExceedBalance = tradeValue.gt(balance);
        const eachValue = sdk.toBig(_tradeData.eachValue ?? 0);
        tooSmall = eachValue.lt(1);
        tooLarge = tradeValue
          // @ts-ignore
          .div(tradeValue?.numbers ?? 1)
          .gt(REDPACKET_ORDER_NFT_LIMIT);
      }

      if (
        tradeValue &&
        !isExceedBalance &&
        !tooSmall &&
        !tooLarge &&
        ((redPacketOrder.tradeType === TRADE_TYPE.NFT &&
          redPacketOrder.nftData) ||
          // @ts-ignore
          redPacketOrder.tradeType === TRADE_TYPE.TOKEN) &&
        redPacketConfigs?.luckTokenAgents &&
        !blindBoxGiftsLargerThanPackets
      ) {
        enableBtn();
        return;
      } else {
        disableBtn();
        if (!redPacketConfigs?.luckTokenAgents) {
          setLabelAndParams("labelRedPacketWaitingBlock", {});
        } else if (isExceedBalance && tradeValue.gt(balance)) {
          setLabelAndParams("labelRedPacketsInsufficient", {
            symbol:
              (redPacketOrder as T).tradeType === TRADE_TYPE.TOKEN
                ? (tradeToken.symbol as string)
                : "NFT",
          });
        } else if (
          isExceedBalance &&
          (redPacketOrder as T).tradeType === TRADE_TYPE.TOKEN &&
          feeToken.tokenId === tradeToken.tokenId
        ) {
          setLabelAndParams("labelReserveFee", {
            symbol: tradeToken.symbol as string,
          });
        } else if (isFeeNotEnough.isFeeNotEnough) {
          setLabelAndParams("labelRedPacketFee", {});
        } else if (tooSmall || redPacketOrder.numbers > REDPACKET_ORDER_LIMIT) {
          if (tooSmall) {
            setLabelAndParams(
              "labelRedPacketsMin",
              (redPacketOrder as T).tradeType === TRADE_TYPE.TOKEN && tradeToken
                ? {
                    value: getValuePrecisionThousand(
                      sdk
                        .toBig(tradeToken.luckyTokenAmounts.minimum ?? 0)
                        .div("1e" + tradeToken.decimals),
                      tradeToken.precision,
                      tradeToken.precision,
                      tradeToken.precision,
                      false,
                      { floor: false, isAbbreviate: true }
                    ),
                    symbol: tradeToken.symbol,
                  }
                : { value: 1, symbol: "NFT" }
            );
          } else {
            let value =
              (redPacketOrder as T).tradeType === TRADE_TYPE.TOKEN && tradeToken
                ? tradeValue
                    .div(tradeToken.luckyTokenAmounts.minimum)
                    .toFixed(0, 1)
                : tradeValue;
            const limit =
              (redPacketOrder as T).tradeType === TRADE_TYPE.TOKEN
                ? REDPACKET_ORDER_LIMIT
                : REDPACKET_ORDER_NFT_LIMIT;
            setLabelAndParams("labelRedPacketsSplitNumber", {
              value: (Number(value) <= limit ? balance : limit).toString(),
            });
          }
        } else if (tooLarge) {
          setLabelAndParams(
            "labelRedPacketsMax",
            (redPacketOrder as T).tradeType === TRADE_TYPE.TOKEN && tradeToken
              ? {
                  value: getValuePrecisionThousand(
                    sdk
                      .toBig(tradeToken.luckyTokenAmounts.maximum ?? 0)
                      .div("1e" + tradeToken.decimals),
                    tradeToken.precision,
                    tradeToken.precision,
                    tradeToken.precision,
                    false,
                    { floor: true, isAbbreviate: true }
                  ),
                  symbol: tradeToken.symbol,
                }
              : { value: REDPACKET_ORDER_NFT_LIMIT, symbol: "NFT" }
          );
        } else if (blindBoxGiftsLargerThanPackets) {
          setLabelAndParams("labelRedPacketsGiftsLargerThanPackets", {});
        }
      }
    }
    disableBtn();
  }, [
    chargeFeeTokenList.length,
    disableBtn,
    enableBtn,
    isFeeNotEnough.isFeeNotEnough,
    tokenMap,
    redPacketOrder.balance,
    redPacketOrder.belong,
    redPacketOrder.fee,
    redPacketOrder.tradeValue,
    redPacketOrder.numbers,
    redPacketOrder.memo,
    redPacketConfigs?.luckTokenAgents,
    redPacketOrder.giftNumbers,
    redPacketOrder.validSince,
    redPacketOrder.validUntil,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    chargeFeeTokenList,
    isFeeNotEnough.isFeeNotEnough,
    redPacketOrder?.numbers,
    redPacketOrder.balance,
    redPacketOrder.belong,
    redPacketOrder.fee,
    redPacketOrder.tradeValue,
    redPacketOrder.memo,
    redPacketConfigs?.luckTokenAgents,
    redPacketOrder.validSince,
    redPacketOrder.validUntil,
    redPacketOrder?.giftNumbers,
  ]);
  const processRequest = React.useCallback(
    async (
      request: sdk.LuckyTokenItemForSendV3,
      isNotHardwareWallet: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;

      try {
        if (
          connectProvides.usedWeb3 &&
          LoopringAPI.luckTokenAPI &&
          isAccActivated()
        ) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          updateRedPacketOrder({
            ...redPacketOrder,
            __request__: request,
          } as any);

          const response = await LoopringAPI.luckTokenAPI.sendLuckTokenSend(
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

          myLog("submit sendLuckTokenSend:", response);
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          }
          // setIsConfirmTransfer(false);
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_In_Progress,
          });
          await sdk.sleep(TOAST_TIME);

          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_Success,
            info: {
              scope: request.type.scope,
              hash:
                Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-transfer`,
              shared:
                request.type.scope == sdk.LuckyTokenViewType.PUBLIC
                  ? () => {
                      setShowAccount({ isShow: false });
                      setShowRedPacket({
                        isShow: true,
                        info: {
                          // ...luckTokenInfo,
                          sender: account.accountId,
                          hash: (response as sdk.TX_HASH_API).hash,
                        },
                        step: RedPacketViewStep.QRCodePanel,
                      });
                    }
                  : undefined,
            },
          });

          if (isHWAddr) {
            myLog("......try to set isHWAddr", isHWAddr);
            updateHW({ wallet: account.accAddress, isHWAddr });
          }
          walletLayer2Service.sendUserUpdate();
          history.push(
            `/redpacket?redPacketHash=${(response as sdk.TX_HASH_API)?.hash}`
          );
          resetDefault(TRADE_TYPE.TOKEN);
          if (
            request.type.scope == sdk.LuckyTokenViewType.PRIVATE &&
            (response as sdk.TX_HASH_API)?.hash
          ) {
            setShowAccount({ isShow: false });
            setShowRedPacket({
              isShow: true,
              info: {
                // ...luckTokenInfo,
                sender: account.accountId,
                hash: (response as sdk.TX_HASH_API).hash,
              },
              step: RedPacketViewStep.QRCodePanel,
            });
          } else {
            await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE);
            if (
              store.getState().modals.isShowAccount.isShow &&
              store.getState().modals.isShowAccount.step ==
                AccountStep.RedPacketSend_Success
            ) {
              setShowAccount({ isShow: false });
            }
          }
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet);
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setShowAccount({
              isShow: true,
              step: AccountStep.RedPacketSend_First_Method_Denied,
            });
            break;
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setShowAccount({
              isShow: true,
              step: AccountStep.RedPacketSend_User_Denied,
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
              step: AccountStep.RedPacketSend_Failed,
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

            break;
        }
      }
    },
    [
      account,
      checkHWAddr,
      chainId,
      setShowAccount,
      redPacketOrder.belong,
      checkFeeIsEnough,
      resetDefault,
      updateHW,
    ]
  );
  React.useEffect(() => {
    if (isShow) {
      resetDefault(TRADE_TYPE.TOKEN);
      walletLayer2Service.sendUserUpdate();
    }
  }, [isShow]);
  React.useEffect(() => {
    if (isShow) {
      checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES });
    } else {
      resetIntervalTime();
    }
    return () => {
      resetIntervalTime();
    };
  }, [isShow, redPacketOrder.tradeType]);

  const onCreateRedPacketClick = React.useCallback(
    async (_redPacketOrder, isHardwareRetry: boolean = false) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
      const redPacketOrder = store.getState()._router_modalData
        .redPacketOrder as T;
      const _tradeData = calcNumberAndAmount();

      if (
        readyState === AccountStatus.ACTIVATED &&
        LoopringAPI.userAPI &&
        tokenMap &&
        exchangeInfo &&
        chargeFeeTokenList.length &&
        !isFeeNotEnough.isFeeNotEnough &&
        redPacketOrder.belong &&
        (redPacketOrder.tradeType === TRADE_TYPE.NFT
          ? redPacketOrder.nftData
          : tokenMap[redPacketOrder.belong]) &&
        redPacketOrder.fee &&
        redPacketOrder.fee.belong &&
        redPacketOrder.fee?.__raw__ &&
        redPacketOrder.numbers &&
        redPacketOrder.numbers > 0 &&
        _tradeData.tradeValue &&
        redPacketOrder.type &&
        redPacketOrder.memo &&
        redPacketOrder?.validUntil &&
        redPacketConfigs?.luckTokenAgents &&
        redPacketOrder.memo?.trim().length > 0 &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_WaitForAuth,
          });
          let tradeToken, tradeValue;
          if (redPacketOrder.tradeType === TRADE_TYPE.NFT) {
            tradeToken = {
              tokenId: redPacketOrder.tokenId,
              nftDta: redPacketOrder.nftData,
            };
            tradeValue = sdk.toBig(_tradeData.tradeValue);
          } else {
            //@ts-ignore
            tradeToken = tokenMap[redPacketOrder.belong.toString()];
            tradeValue = sdk
              .toBig(_tradeData.tradeValue ?? 0)
              .times("1e" + tradeToken.decimals);
          }
          const feeToken = tokenMap[redPacketOrder.fee.belong];
          const feeRaw =
            redPacketOrder.fee.feeRaw ??
            redPacketOrder.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);

          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId,
              sellTokenId: Number(tradeToken.tokenId),
            },
            apiKey
          );
          // const { broker } = await LoopringAPI.userAPI.getAvailableBroker({
          //   type: 1,
          // });
          myLog("memo", redPacketOrder.memo);

          const req: sdk.LuckyTokenItemForSendV3 = {
            type: {
              ...redPacketOrder.type,
              mode:
                redPacketOrder.tradeType === TRADE_TYPE.NFT
                  ? (redPacketOrder.type.mode === sdk.LuckyTokenClaimType.BLIND_BOX) ? sdk.LuckyTokenClaimType.BLIND_BOX : sdk.LuckyTokenClaimType.COMMON
                  : // @ts-ignore
                    redPacketOrder.type?.mode ?? sdk.LuckyTokenClaimType.COMMON,
            },
            numbers: redPacketOrder.numbers,
            giftNumbers: redPacketOrder.giftNumbers!,
            memo: redPacketOrder.memo ?? "",
            signerFlag: false as any,
            nftData:
              redPacketOrder.tradeType === TRADE_TYPE.NFT
                ? redPacketOrder.nftData
                : undefined,
            // @ts-ignore
            templateId: 0,
            validSince: Math.round(
              (redPacketOrder.validSince ?? Date.now()) / 1000
            ),
            validUntil: Math.round(
              (redPacketOrder.validUntil ?? Date.now()) / 1000 
            ),
            luckyToken: {
              exchange: exchangeInfo.exchangeAddress,
              payerAddr: accAddress,
              payerId: accountId,
              payeeAddr: Reflect.ownKeys(
                redPacketConfigs.luckTokenAgents ?? {}
              )[0],
              storageId: storageId?.offchainId,
              token: tradeToken.tokenId,
              amount: tradeValue.toFixed(),
              feeToken: feeToken.tokenId,
              maxFeeAmount: fee.toFixed(),
              validUntil: getTimestampDaysLater(DAYS - 1),
            } as any,
          };

          myLog("transfer req:", req);

          processRequest(req, !isHardwareRetry);
        } catch (e: any) {
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_Failed,
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
      setShowAccount,
      processRequest,
      redPacketConfigs?.luckTokenAgents,
    ]
  );

  const handlePanelEvent = useCallback(
    async (data: SwitchData<Partial<T>>) => {
      return new Promise<void>((res: any) => {
        if (data.to === "button") {
          if (walletMap && data?.tradeData?.belong) {
            const walletInfo = walletMap[data?.tradeData?.belong as string];
            handleOnDataChange({
              belong: data.tradeData?.belong,
              tradeValue: data.tradeData?.tradeValue,
              balance: walletInfo ? walletInfo.count : 0,
            } as T);
          } else {
            handleOnDataChange({
              belong: undefined,
              tradeValue: undefined,
              balance: undefined,
            } as unknown as T);
          }
        }
        res();
      });
    },
    [walletMap]
  );
  const [minimum, maximum] = React.useMemo(() => {
    if (redPacketOrder.tradeType === TRADE_TYPE.NFT) {
      const minimum = sdk
        .toBig(redPacketOrder?.tradeValue ?? 0)
        .div(REDPACKET_ORDER_NFT_LIMIT)
        .toFixed(0, 1);

      const maximum =
        redPacketOrder?.balance &&
        // @ts-ignore
        sdk.toBig(redPacketOrder.balance ?? 0).lt(REDPACKET_ORDER_LIMIT)
          ? // @ts-ignore
            redPacketOrder?.tradeValue ?? redPacketOrder.balance
          : REDPACKET_ORDER_LIMIT;
      return [minimum ? 1 : minimum, maximum];
    } else {
      if (redPacketOrder.belong && tokenMap[redPacketOrder.belong]) {
        const { minimum, maximum } =
          tokenMap[redPacketOrder.belong].luckyTokenAmounts;
        const decimals = tokenMap[redPacketOrder.belong].decimals;
        return [
          sdk
            .toBig(minimum ?? 0)
            .div("1e" + decimals)
            .toString(),
          sdk
            .toBig(maximum ?? 0)
            .div("1e" + decimals)
            .toString(),
        ];
      } else {
        return [undefined, undefined];
      }
    }
  }, [redPacketOrder?.belong, tokenMap, redPacketOrder.tradeType]);
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.RedPacketSend_WaitForAuth,
      });
      onCreateRedPacketClick({}, isHardwareRetry);
    },
    [processRequest, setShowAccount]
  );
  const createRedPacketProps: CreateRedPacketProps<T, I, F> = {
    tradeType: redPacketOrder.tradeType,
    chargeFeeTokenList,
    onCreateRedPacketClick,
    btnStatus,
    btnInfo,
    disabled: transferEnabale?.enable == true,
    assetsData: assetsRawData,
    walletMap,
    coinMap: totalCoinMap,
    tokenMap,
    minimum,
    maximum,
    feeInfo: redPacketOrder.fee ?? feeInfo,
    handleFeeChange,
    tradeData: redPacketOrder as T,
    handleOnDataChange,
    handlePanelEvent,
    selectNFT,
    handleOnChoose: (_value: NFT) => {
      setSelectNFT(_value as NFT);
      if (_value) {
        const value = _value as any;
        handleOnDataChange({
          collectionInfo: value.collectionInfo,
          tokenId: value.tokenId,
          tradeValue: undefined,
          balance: value.nftBalance ?? value.total,
          nftData: value.nftData,
          belong: value.name,
          tokenAddress: value.tokenAddress,
          image: value?.metadata?.imageSize
            ? value?.metadata?.imageSize["240-240"]
            : value.image,
        } as T);
      }
    },
  } as unknown as CreateRedPacketProps<T, I, F, NFT>;

  return { createRedPacketProps, retryBtn };
};
