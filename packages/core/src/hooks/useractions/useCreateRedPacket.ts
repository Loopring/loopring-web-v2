import {
  AccountStatus,
  AssetsRawDataItem,
  Explorer,
  FeeInfo,
  getValuePrecisionThousand,
  LIVE_FEE_TIMES,
  myLog,
  TOAST_TIME,
  UIERROR_CODE,
  WalletMap,
} from "@loopring-web/common-resources";
import {
  RedPacketOrderData,
  store,
  useAccount,
  useModalData,
  useSystem,
  useTokenMap,
} from "../../stores";
import {
  AccountStep,
  CreateRedPacketProps,
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
import { useRouteMatch } from "react-router-dom";

export const useCreateRedPacket = <
  T extends RedPacketOrderData<I>,
  I,
  F = FeeInfo
>({
  assetsRawData,
}: {
  assetsRawData: AssetsRawDataItem[];
}): { createRedPacketProps: CreateRedPacketProps<T, I, F> } => {
  let match: any = useRouteMatch("/redpacket/:item");

  const { exchangeInfo, chainId } = useSystem();
  const { tokenMap, totalCoinMap } = useTokenMap();
  const {
    allowTrade: { transfer: transferEnabale },
  } = useSystem();
  const {
    setShowAccount,
    modals: {
      isShowAccount: { info },
    },
  } = useOpenModals();
  const { redPacketOrder, resetRedPacketOrder, updateRedPacketOrder } =
    useModalData();
  const { account, status: accountStatus } = useAccount();
  const { checkHWAddr, updateHW } = useWalletInfo();

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
    // setIsFeeNotEnough,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    updateData: ({ fee }) => {
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
      updateRedPacketOrder({ ...redPacketOrder, fee });
    },
  });

  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<T>)
  );
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
    if (!redPacketOrder.belong && walletMap) {
      resetDefault();
    }
  }, [redPacketOrder, accountStatus]);
  const handleOnDataChange = React.useCallback(
    (tradeData: Partial<T>) => {
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
      myLog("redPacketOrder handleOnDataChange", redPacketOrder, tradeData);
      updateRedPacketOrder({ ...redPacketOrder, ...tradeData });
    },
    [updateRedPacketOrder]
  );
  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough();
      return;
    }
    checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES });

    if (!redPacketOrder.belong && walletMap) {
      const keys = Reflect.ownKeys(walletMap);
      for (let key in keys) {
        const keyVal = keys[key];
        const walletInfo = walletMap[keyVal];
        if (sdk.toBig(walletInfo.count).gt(0)) {
          handleOnDataChange({
            belong: keyVal as any,
            tradeValue: undefined,
            fee: feeInfo,
            balance: walletInfo?.count,
            memo: "",
            numbers: undefined,
            validSince: Date.now(),
          } as T);
          break;
        }
      }
    } else if (redPacketOrder.belong && walletMap) {
      const walletInfo = walletMap[redPacketOrder.belong];
      handleOnDataChange({
        fee: feeInfo,
        belong: redPacketOrder.belong,
        tradeValue: undefined,
        balance: walletInfo?.count,
        memo: "",
        numbers: undefined,
        validSince: Date.now(),
      } as T);
    } else {
      handleOnDataChange({
        fee: feeInfo,
        belong: redPacketOrder.belong,
        tradeValue: undefined,
        balance: undefined,
        memo: "",
        numbers: undefined,
        validSince: Date.now(),
      } as unknown as T);
    }
  }, [
    checkFeeIsEnough,
    walletMap,
    handleOnDataChange,
    feeInfo,
    redPacketOrder.belong,
    info?.isRetry,
  ]);
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
    const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
    if (
      redPacketOrder?.type?.partition == sdk.LuckyTokenAmountType.AVERAGE &&
      redPacketOrder?.type?.mode === sdk.LuckyTokenClaimType.COMMON
    ) {
      // amount * numbers < max
      return {
        tradeValue:
          (redPacketOrder?.tradeValue ?? 0) * (redPacketOrder.numbers ?? 0),
        eachValue: redPacketOrder.tradeValue,
        isEach: true,
      };
    } else {
      return {
        tradeValue: redPacketOrder?.tradeValue,
        eachValue:
          (redPacketOrder?.tradeValue ?? 0) /
          Number(redPacketOrder.numbers ?? 1),
        isEach: false,
      };
    }
  }, []);

  const checkBtnStatus = React.useCallback(() => {
    const _tradeData = calcNumberAndAmount();
    resetBtnInfo();
    if (
      tokenMap &&
      chargeFeeTokenList.length &&
      !isFeeNotEnough.isFeeNotEnough &&
      redPacketOrder.belong &&
      tokenMap[redPacketOrder.belong] &&
      redPacketOrder.fee &&
      redPacketOrder.fee.belong &&
      redPacketOrder.numbers &&
      redPacketOrder.numbers > 0 &&
      _tradeData.tradeValue
    ) {
      const tradeToken = tokenMap[redPacketOrder.belong];
      const feeToken = tokenMap[redPacketOrder.fee.belong];
      const feeRaw =
        redPacketOrder.fee.feeRaw ?? redPacketOrder.fee.__raw__?.feeRaw ?? 0;
      const fee = sdk.toBig(feeRaw);
      const balance = sdk
        .toBig(redPacketOrder.balance ?? 0)
        .times("1e" + tradeToken.decimals);
      const tradeValue = sdk
        .toBig(_tradeData.tradeValue ?? 0)
        .times("1e" + tradeToken.decimals);
      const eachValue = sdk
        .toBig(_tradeData.eachValue ?? 0)
        .times("1e" + tradeToken.decimals);
      const isExceedBalance = tradeValue
        .plus(feeToken.tokenId === tradeToken.tokenId ? fee : "0")
        .gt(balance);
      const tooSmall = eachValue.lt(tradeToken.luckyTokenAmounts.minimum);
      const tooLarge = tradeValue.gt(tradeToken.luckyTokenAmounts.maximum);

      if (tradeValue && !isExceedBalance && !tooSmall && !tooLarge) {
        enableBtn();
        return;
      } else {
        disableBtn();
        if (isExceedBalance && feeToken.tokenId === tradeToken.tokenId) {
          setLabelAndParams("labelReserveFee", {
            symbol: tradeToken.symbol as string,
          });
        } else if (isExceedBalance) {
        } else if (tooSmall) {
          if (
            _tradeData.isEach ||
            tradeValue.lt(tradeToken.luckyTokenAmounts.minimum)
          ) {
            setLabelAndParams("labelRedPacketsMin", {
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
            });
          } else {
            setLabelAndParams("labelRedPacketsSplitNumber", {
              value: tradeValue
                .div(tradeToken.luckyTokenAmounts.minimum)
                .toFixed(0, 1),
            });
          }
        } else if (tooLarge) {
          setLabelAndParams("labelRedPacketsMax", {
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
          });
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
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    chargeFeeTokenList,
    isFeeNotEnough.isFeeNotEnough,
    // redPacketOrder?.type,
    // redPacketOrder?.type?.scope,
    // redPacketOrder?.type?.partition,
    // redPacketOrder?.type?.mode,
    redPacketOrder?.numbers,
    redPacketOrder.balance,
    redPacketOrder.belong,
    redPacketOrder.fee,
    redPacketOrder.tradeValue,
  ]);
  const processRequest = React.useCallback(
    async (
      request: sdk.LuckyTokenItemForSendV3,
      isNotHardwareWallet: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (
          connectProvides.usedWeb3 &&
          LoopringAPI.luckTokenAPI &&
          window.rampInstance &&
          isAccActivated()
        ) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          updateRedPacketOrder({ __request__: request } as any);
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
            step: AccountStep.RedPacketSend_In_Progress,
          });
          await sdk.sleep(TOAST_TIME);

          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_Success,
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
          resetRedPacketOrder();
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
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_Failed,
            });

            break;
        }
      }
    },
    [
      // account,
      // chainId,
      // checkHWAddr,
      // resetTransferRampData,
      // setShowAccount,
      // updateHW,
      // updateTransferRampData,
    ]
  );
  React.useEffect(() => {
    if (match?.params?.item?.toLowerCase() === "create") {
      resetDefault();
    } else {
      resetIntervalTime();
    }
    return () => {
      resetIntervalTime();
    };
  }, [match?.params?.item]);
  const onCreateRedPacketClick = React.useCallback(
    async (redPacketOrder, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        redPacketOrder.address !== "*" &&
        redPacketOrder?.fee &&
        redPacketOrder?.fee.belong &&
        redPacketOrder.fee?.__raw__ &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_WaitForAuth,
          });

          const token = tokenMap[redPacketOrder.belong as string];
          const feeToken = tokenMap[redPacketOrder.fee.belong];
          const feeRaw =
            redPacketOrder.fee.feeRaw ??
            redPacketOrder.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);

          const tradeValue = sdk
            .toBig(redPacketOrder.tradeValue ?? 0)
            .times("1e" + token.decimals);

          // const transferVol = finalVol.toFixed(0, 0);

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: Number(feeToken.tokenId),
            },
            apiKey
          );
          const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
            type: 1,
          });

          const req: sdk.LuckyTokenItemForSendV3 = {
            type: redPacketOrder.type,
            numbers: redPacketOrder.numbers,
            memo: redPacketOrder.memo,
            signerFlag: redPacketOrder.signerFlag,
            templateID: redPacketOrder.templateID,
            validSince: Math.round(redPacketOrder.validSince / 1000),
            validUntil: getTimestampDaysLater(DAYS),
            luckyToken: {
              exchange: exchangeInfo.exchangeAddress,
              payerAddr: accAddress,
              payerId: accountId,
              payeeAddr: broker,
              storageId: storageId.offchainId,
              token: {
                tokenId: token.tokenId,
                volume: tradeValue.toFixed(),
              },
              maxFee: {
                tokenId: feeToken.tokenId,
                volume: fee.toFixed(), // TEST: fee.toString(),
              },
              // token: {
              //   tokenId: feeToken.tokenId,
              //   volume: fee.toFixed(), // TEST: fee.toString(),
              // },
              validUntil: getTimestampDaysLater(DAYS),
            } as sdk.OriginTransferRequestV3,
          };

          myLog("transfer req:", req);

          processRequest(req, isFirstTime);
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
    [account, tokenMap, exchangeInfo, setShowAccount, processRequest]
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
  }, [redPacketOrder?.belong, tokenMap]);
  const createRedPacketProps: CreateRedPacketProps<T, I, F> = {
    type: "TOKEN",
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
  } as any;

  return { createRedPacketProps };
};
