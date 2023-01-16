import {
  AccountStatus,
  AssetsRawDataItem,
  Explorer,
  FeeInfo,
  getValuePrecisionThousand,
  LIVE_FEE_TIMES,
  myLog,
  SUBMIT_PANEL_QUICK_AUTO_CLOSE,
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
  F = FeeInfo
>({
  assetsRawData,
  isShow = false,
}: {
  assetsRawData: AssetsRawDataItem[];
  isShow?: boolean;
}): {
  createRedPacketProps: CreateRedPacketProps<T, I, F>;
  retryBtn: (isHardware?: boolean) => void;
} => {
  const { exchangeInfo, chainId } = useSystem();
  const { tokenMap, totalCoinMap } = useTokenMap();
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
  const { redPacketConfigs } = useRedPacketConfig();
  const { redPacketOrder, updateRedPacketOrder } = useModalData();
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
    } else if (walletMap && walletMap[redPacketOrder.belong]) {
      // const walletInfo = walletMap[redPacketOrder.belong];
      // myLog("update balance:", walletInfo?.count);
      // handleOnDataChange({
      //   balance: walletInfo?.count,
      // } as T);
    }
  }, [redPacketOrder, accountStatus]);
  const handleOnDataChange = React.useCallback(
    (tradeData: Partial<T>) => {
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
      // myLog("redPacketOrder handleOnDataChange", redPacketOrder, tradeData);
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
    return {
      tradeValue: redPacketOrder?.tradeValue,
      eachValue:
        (redPacketOrder?.tradeValue ?? 0) / Number(redPacketOrder.numbers ?? 1),
    };
  }, []);
  const history = useHistory();

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
      _tradeData.tradeValue &&
      redPacketOrder.memo &&
      redPacketOrder.memo?.trim().length > 0
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

      if (
        tradeValue &&
        !isExceedBalance &&
        !tooSmall &&
        !tooLarge &&
        redPacketConfigs?.luckTokenAgents
      ) {
        enableBtn();
        return;
      } else {
        disableBtn();
        if (!redPacketConfigs?.luckTokenAgents) {
          setLabelAndParams("labelRedPacketWaitingBlock", {});
        } else if (isExceedBalance && tradeValue.gt(balance)) {
          setLabelAndParams("labelRedPacketsInsufficient", {
            symbol: tradeToken.symbol as string,
          });
        } else if (isExceedBalance && feeToken.tokenId === tradeToken.tokenId) {
          setLabelAndParams("labelReserveFee", {
            symbol: tradeToken.symbol as string,
          });
        } else if (tooSmall) {
          if (tradeValue.lt(tradeToken.luckyTokenAmounts.minimum)) {
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
    redPacketOrder.memo,
    redPacketConfigs?.luckTokenAgents,
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
              hash:
                Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-transfer`,
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
          resetDefault();
          if (
            request.type.scope == sdk.LuckyTokenViewType.PRIVATE &&
            (response as sdk.TX_HASH_API)?.hash
          ) {
            const luckTokenInfo: sdk.LuckyTokenItemForReceive = (
              await LoopringAPI.luckTokenAPI.getLuckTokenLuckyTokens(
                {
                  senderId: account.accountId,
                  hash: (response as sdk.TX_HASH_API)?.hash,
                  partitions: request.type.partition,
                  modes: request.type.mode,
                  scopes: request.type.scope,
                  statuses: `0,1,2,3,4`,
                  official: false,
                } as any,
                account.apiKey
              )
            ).list?.[0];
            setShowAccount({ isShow: false });
            setShowRedPacket({
              isShow: true,
              info: {
                ...luckTokenInfo,
                hash: (luckTokenInfo as sdk.TX_HASH_API).hash,
              },
              step: RedPacketViewStep.QRCodePanel,
            });
          } else {
            await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE);
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
      resetDefault();
    } else {
      resetIntervalTime();
    }
    return () => {
      resetIntervalTime();
    };
  }, [isShow]);
  const onCreateRedPacketClick = React.useCallback(
    async (_redPacketOrder, isHardwareRetry: boolean = false) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
      const _tradeData = calcNumberAndAmount();
      if (
        readyState === AccountStatus.ACTIVATED &&
        LoopringAPI.userAPI &&
        tokenMap &&
        exchangeInfo &&
        chargeFeeTokenList.length &&
        !isFeeNotEnough.isFeeNotEnough &&
        redPacketOrder.belong &&
        tokenMap[redPacketOrder.belong] &&
        redPacketOrder.fee &&
        redPacketOrder.fee.belong &&
        redPacketOrder.fee?.__raw__ &&
        redPacketOrder.numbers &&
        redPacketOrder.numbers > 0 &&
        _tradeData.tradeValue &&
        redPacketOrder.type &&
        redPacketOrder.memo &&
        redPacketConfigs?.luckTokenAgents &&
        redPacketOrder.memo?.trim().length > 0 &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_WaitForAuth,
          });
          const tradeToken = tokenMap[redPacketOrder.belong];
          const feeToken = tokenMap[redPacketOrder.fee.belong];
          const feeRaw =
            redPacketOrder.fee.feeRaw ??
            redPacketOrder.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);
          const tradeValue = sdk
            .toBig(_tradeData.tradeValue ?? 0)
            .times("1e" + tradeToken.decimals);

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
            type: redPacketOrder.type,
            numbers: redPacketOrder.numbers,
            memo: redPacketOrder.memo ?? "",
            signerFlag: false as any,
            // @ts-ignore
            templateId: 0,
            validSince: Math.round(
              (redPacketOrder.validSince ?? Date.now()) / 1000
            ),
            validUntil: getTimestampDaysLater(DAYS - 1),
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

  return { createRedPacketProps, retryBtn };
};
