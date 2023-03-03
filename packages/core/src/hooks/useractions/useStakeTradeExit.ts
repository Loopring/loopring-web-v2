import {
  AccountStatus,
  CustomErrorWithCode,
  DeFiSideRedeemCalcData,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  myLog,
  RedeemStack,
  SDK_ERROR_MAP_TO_UI,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import {
  DeFiStakeRedeemWrapProps,
  useOpenModals,
  useToggle,
} from "@loopring-web/component-lib";
import {
  store,
  useAccount,
  useRedeemStack,
  useSystem,
  useTokenMap,
} from "../../stores";
import React from "react";
import * as sdk from "@loopring-web/loopring-sdk";
import _ from "lodash";
import { calcRedeemStaking } from "../help";
import { LoopringAPI } from "../../api_wrapper";
import { useSubmitBtn } from "../common";

export const useStakeTradeExit = <
  T extends IBData<I>,
  I,
  ACD extends DeFiSideRedeemCalcData<T>
>({
  setToastOpen,
}: // symbol: coinSellSymbol,
{
  setToastOpen: (props: {
    open: boolean;
    content: JSX.Element | string;
    type: "success" | "error" | "warning" | "info";
  }) => void;
}) => {
  const { t } = useTranslation();
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const { redeemStack, updateRedeemStack } = useRedeemStack();
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, allowTrade } = useSystem();
  const { toggle } = useToggle();
  const coinSellSymbol = redeemStack?.sellToken?.symbol;
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const redeemStack = store.getState()._router_redeemStack.redeemStack;
    if (
      redeemStack?.sellToken &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      if (
        redeemStack?.sellVol === undefined ||
        sdk.toBig(redeemStack?.sellVol).lte(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (
        sdk
          .toBig(
            (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
              .remainAmount
          )
          .minus(redeemStack?.sellVol)
          .minus(
            (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
              ?.minSellVol ?? 0
          )
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelRemainingBtnAmount",
        };
      } else if (
        sdk
          .toBig(redeemStack?.sellVol)
          .gt(
            (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
              ?.remainAmount
          )
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelStakeNoEnough| ${coinSellSymbol}`,
        };
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [redeemStack?.deFiSideRedeemCalcData, tokenMap, coinSellSymbol]);
  const handleOnchange = _.debounce(
    ({
      tradeData,
      _redeemStack = {},
    }: {
      tradeData: T;
      _redeemStack?: Partial<RedeemStack<T>>;
    }) => {
      const redeemStack = store.getState()._router_redeemStack.redeemStack;
      let _deFiSideRedeemCalcData: DeFiSideRedeemCalcData<T> = {
        ...redeemStack.deFiSideRedeemCalcData,
      } as unknown as DeFiSideRedeemCalcData<T>;
      let _oldTradeStack = {
        ...redeemStack,
        ..._redeemStack,
      };
      //_.cloneDeep({ ...tradeStack, ..._tradeStack });
      myLog("defi handleOnchange", _oldTradeStack);

      if (tradeData && coinSellSymbol) {
        const inputValue = tradeData?.tradeValue?.toString() ?? "0";
        const tokenSell = tokenMap[coinSellSymbol];
        const { sellVol, deFiSideRedeemCalcData } = calcRedeemStaking({
          inputValue,
          isJoin: false,
          deFiSideRedeemCalcData: _deFiSideRedeemCalcData,
          tokenSell,
        });

        // @ts-ignore
        _deFiSideRedeemCalcData = {
          ...deFiSideRedeemCalcData,
          coinSell: {
            ...tradeData,
            tradeValue: tradeData?.tradeValue?.toString(),
          },
        };
        updateRedeemStack({
          sellToken: tokenSell,
          sellVol,
          deFiSideRedeemCalcData: {
            ..._deFiSideRedeemCalcData,
          },
        });
      }
    },
    globalSetup.wait
  );
  const sendRequest = React.useCallback(async () => {
    try {
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        redeemStack.sellToken?.symbol &&
        redeemStack.sellVol &&
        exchangeInfo
      ) {
        const request = {
          accountId: account.accountId,
          token: {
            tokenId: redeemStack.sellToken?.tokenId ?? 0,
            volume: redeemStack.sellVol,
          },
          hash: "",
        };
        myLog("DefiTrade request:", request);
        const response = await LoopringAPI.defiAPI.sendStakeRedeem(
          request,
          account.eddsaKey.sk,
          account.apiKey
        );
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          const errorItem =
            SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001];
          throw new CustomErrorWithCode(errorItem);
        } else {
          setToastOpen({
            open: true,
            type: "success",
            content: t("labelInvestSuccess"),
          });
        }
      } else {
        throw new Error("api not ready");
      }
    } catch (reason) {
      setToastOpen({
        open: true,
        type: "error",
        content:
          t("labelInvestFailed") +
            (reason as CustomErrorWithCode)?.messageKey ??
          ` error: ${t((reason as CustomErrorWithCode)?.messageKey)}`,
      });
    } finally {
      // resetDefault(true);
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    setToastOpen,
    t,
    redeemStack.sellToken?.symbol,
    redeemStack.sellToken?.tokenId,
    redeemStack.sellVol,
  ]);

  const handleSubmit = React.useCallback(async () => {
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      tokenMap &&
      exchangeInfo &&
      account.eddsaKey?.sk
    ) {
      if (allowTrade && !allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true });
      } else if (toggle && !toggle[`${coinSellSymbol}StackInvest`].enable) {
        setShowTradeIsFrozen({
          isShow: true,
          type: coinSellSymbol + "StakingRedeemInvest",
        });
      } else {
        sendRequest();
      }
    } else {
      return false;
    }
  }, [
    account.readyState,
    account.eddsaKey?.sk,
    tokenMap,
    redeemStack.sellToken?.symbol,
    exchangeInfo,
    sendRequest,
    setToastOpen,
    t,
  ]);
  const onSubmitBtnClick = React.useCallback(async () => {
    const tradeStack = store.getState()._router_tradeStack.tradeStack;
    if (
      tradeStack?.deFiSideCalcData?.stackViewInfo?.maxSellVol &&
      tradeStack?.sellVol &&
      sdk
        .toBig(tradeStack.sellVol)
        .gte(tradeStack?.deFiSideCalcData?.stackViewInfo?.maxSellVol)
    ) {
      if (
        sdk
          .toBig(tradeStack?.deFiSideCalcData?.stackViewInfo?.maxSellVol ?? 0)
          .minus(tradeStack?.deFiSideCalcData?.stackViewInfo?.minSellVol ?? 0)
          .toString()
          .startsWith("-")
      ) {
      } else {
        const tradeValue = getValuePrecisionThousand(
          sdk
            .toBig(tradeStack?.deFiSideCalcData?.stackViewInfo?.maxSellVol)
            .div("1e" + tokenMap[coinSellSymbol]?.decimals),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: true }
        ).replace(sdk.SEP, "");
        // @ts-ignore
        const oldTrade = (tradeStack?.deFiSideCalcData ?? {}) as unknown as T;
        handleOnchange({
          tradeData: {
            ...oldTrade,
            tradeValue,
          },
        });
        // handleOnchange()
      }
    } else {
      handleSubmit();
    }
  }, [tokenMap, coinSellSymbol, handleOnchange, handleSubmit]);
  const {
    btnStatus,
    onBtnClick,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: false,
    submitCallback: onSubmitBtnClick,
  });
  const stackWrapProps = React.useMemo(() => {
    return {
      isJoin: false,
      isFullTime:
        Date.now() >=
          (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
            ?.claimableTime ?? 0,
      disabled: account.readyState === AccountStatus.ACTIVATED,
      btnInfo: {
        label: tradeMarketI18nKey,
        params: {},
      },
      isLoading: false,
      minSellAmount: (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
        ?.miniSellAmount,
      maxSellAmount: (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
        ?.maxSellAmount,
      onSubmitClick: onBtnClick as () => void,
      switchStobEvent: (
        _isStoB: boolean | ((prevState: boolean) => boolean)
      ) => {},
      onChangeEvent: handleOnchange,
      deFiSideRedeemCalcData: redeemStack?.deFiSideRedeemCalcData as any,
      tokenSell: tokenMap[coinSellSymbol],
      btnStatus,
      accStatus: account.readyState,
    } as DeFiStakeRedeemWrapProps<T, I, ACD>;
  }, [
    sendRequest,
    redeemStack.deFiSideRedeemCalcData,
    (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)?.claimableTime,
    (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)?.maxSellVol,
    account.readyState,
    tradeMarketI18nKey,
    onBtnClick,
    handleOnchange,
    tokenMap,
    coinSellSymbol,
    btnStatus,
  ]); // as ForceWithdrawProps<any, any>;
  return {
    stackWrapProps: stackWrapProps as unknown as DeFiStakeRedeemWrapProps<
      T,
      I,
      ACD
    >,
  };
};
