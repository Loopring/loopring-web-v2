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
  SUBMIT_PANEL_QUICK_AUTO_CLOSE,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import {
  AccountStep,
  DeFiStakeRedeemWrapProps,
  RawDataDefiSideStakingItem,
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
import { useHistory } from "react-router-dom";
import moment from "moment";

export const useStakeRedeemClick = () => {
  const { tokenMap, idIndex } = useTokenMap();
  const { updateRedeemStack } = useRedeemStack();
  const { setShowSideStakingRedeem } = useOpenModals();

  const redeemItemClick = (item: RawDataDefiSideStakingItem) => {
    const tokenInfo = tokenMap[idIndex[item.tokenId]];
    updateRedeemStack({
      sellToken: tokenInfo,
      deFiSideRedeemCalcData: {
        coinSell: {
          belong: tokenInfo.symbol,
          balance: sdk
            .toBig(item.remainAmount)
            .div("1e" + tokenInfo.decimals)
            .toString(),
          tradeValue: undefined,
        },
        stackViewInfo: { ...item } as never,
      },
    });
    setShowSideStakingRedeem({ isShow: true, symbol: tokenInfo.symbol });
  };
  return { redeemItemClick };
};

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

  const { setShowSupport, setShowTradeIsFrozen, setShowSideStakingRedeem } =
    useOpenModals();
  const history = useHistory();
  const { redeemStack, updateRedeemStack } = useRedeemStack();
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, allowTrade } = useSystem();
  const { toggle } = useToggle();
  const [isLoading, setIsLoading] = React.useState(false);
  const { setShowAccount } = useOpenModals();

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
          .toBig(redeemStack?.sellVol)
          .minus(
            (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
              ?.minSellVol ?? 0
          )
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMin| ${getValuePrecisionThousand(
            sdk.toBig(
              (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
                ?.minSellAmount ?? 0
            ),
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            false,
            { floor: false, isAbbreviate: true }
          )} ${coinSellSymbol}`,
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
          label: `labelStakeNoEnough| ${redeemStack?.sellToken.symbol}`,
        };
      } else if (
        !sdk
          .toBig(redeemStack?.sellVol)
          .eq(
            (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
              ?.remainAmount
          ) &&
        sdk
          .toBig(
            (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
              ?.remainAmount ?? 0
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
    const redeemStack = store.getState()._router_redeemStack.redeemStack;
    try {
      setIsLoading(true);
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
          hash: (redeemStack.deFiSideRedeemCalcData.stackViewInfo as any)?.hash,
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
          const searchParams = new URLSearchParams();
          searchParams.set(
            "refreshStake",
            (redeemStack.deFiSideRedeemCalcData.stackViewInfo as any).hash
          );
          history.replace({ search: searchParams.toString() });
          setShowSideStakingRedeem({ isShow: false });
          const remainAmount = sdk
            .toBig(redeemStack?.deFiSideRedeemCalcData?.coinSell?.balance)
            .minus(
              redeemStack?.deFiSideRedeemCalcData?.coinSell?.tradeValue ?? 0
            )
            .toString();
          setShowAccount({
            isShow: true,
            step: AccountStep.Staking_Redeem_Success,
            info: {
              productId:
                redeemStack?.deFiSideRedeemCalcData?.stackViewInfo?.productId,
              symbol: redeemStack.sellToken.symbol,
              amount: redeemStack?.deFiSideRedeemCalcData?.coinSell?.tradeValue,
              remainAmount,
            },
          });
          await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE);
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step ==
              AccountStep.Staking_Redeem_Success
          ) {
            setShowAccount({ isShow: false });
          }
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
      setIsLoading(false);
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    setToastOpen,
    t,
    redeemStack?.sellToken?.symbol,
    redeemStack?.sellToken?.tokenId,
    redeemStack?.sellVol,
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
    redeemStack?.sellToken?.symbol,
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
    isLoading,
    submitCallback: onSubmitBtnClick,
  });
  const stackWrapProps = React.useMemo(() => {
    const stackViewInfo = redeemStack?.deFiSideRedeemCalcData?.stackViewInfo;
    const requiredHoldDay =
      (stackViewInfo?.claimableTime - stackViewInfo?.stakeAt) / 86400000;
    const holdDay = moment(Date.now()).diff(
      moment(new Date(stackViewInfo?.stakeAt ?? ""))
        .utc()
        .startOf("days"),
      "days",
      false
    );
    return {
      isJoin: false,
      isFullTime: holdDay >= requiredHoldDay,
      disabled: account.readyState !== AccountStatus.ACTIVATED,
      btnInfo: {
        label: tradeMarketI18nKey,
        params: {},
      },
      isLoading,
      minSellAmount: (redeemStack?.deFiSideRedeemCalcData?.stackViewInfo as any)
        ?.minSellAmount,
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
    redeemStack?.deFiSideRedeemCalcData,
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
