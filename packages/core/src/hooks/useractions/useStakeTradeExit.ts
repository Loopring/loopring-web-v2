import {
  AccountStatus,
  CustomErrorWithCode,
  DeFiSideRedeemCalcData,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  myLog,
  RedeemStake,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_QUICK_AUTO_CLOSE,
  TradeBtnStatus,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import {
  AccountStep,
  DeFiStakeRedeemWrapProps,
  RawDataDefiSideStakingItem,
  ToastType,
  useOpenModals,
  useToggle,
} from "@loopring-web/component-lib";
import {
  store,
  useAccount,
  useRedeemStake,
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
import { walletLayer2Service } from "../../services";

export const useStakeRedeemClick = () => {
  const { tokenMap, idIndex } = useTokenMap();
  const { updateRedeemStake } = useRedeemStake();
  const { setShowSideStakingRedeem } = useOpenModals();

  const redeemItemClick = (item: RawDataDefiSideStakingItem) => {
    const tokenInfo = tokenMap[idIndex[item.tokenId]];
    updateRedeemStake({
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
        stakeViewInfo: { ...item } as never,
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
    type: ToastType;
  }) => void;
}) => {
  const { t } = useTranslation();
  const { setShowSupport, setShowTradeIsFrozen, setShowSideStakingRedeem } =
    useOpenModals();
  const history = useHistory();
  const { redeemStake, updateRedeemStake } = useRedeemStake();
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, allowTrade } = useSystem();
  const { toggle } = useToggle();
  const [isLoading, setIsLoading] = React.useState(false);
  const { setShowAccount } = useOpenModals();

  const coinSellSymbol = redeemStake?.sellToken?.symbol;
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const redeemStake = store.getState()._router_redeemStake.redeemStake;
    if (
      redeemStake?.sellToken &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      if (
        redeemStake?.sellVol === undefined ||
        sdk.toBig(redeemStake?.sellVol).lte(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (
        sdk
          .toBig(redeemStake?.sellVol)
          .minus(
            (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)
              ?.minSellVol ?? 0
          )
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMin| ${getValuePrecisionThousand(
            sdk.toBig(
              (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)
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
          .toBig(redeemStake?.sellVol)
          .gt(
            (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)
              ?.remainAmount
          )
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelStakeNoEnough| ${redeemStake?.sellToken.symbol}`,
        };
      } else if (
        !sdk
          .toBig(redeemStake?.sellVol)
          .eq(
            (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)
              ?.remainAmount
          ) &&
        sdk
          .toBig(
            (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)
              ?.remainAmount ?? 0
          )
          .minus(redeemStake?.sellVol)
          .minus(
            (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)
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
  }, [redeemStake?.deFiSideRedeemCalcData, tokenMap, coinSellSymbol]);
  const handleOnchange = _.debounce(
    ({
      tradeData,
      _redeemStake = {},
    }: {
      tradeData: T;
      _redeemStake?: Partial<RedeemStake<T>>;
    }) => {
      const redeemStake = store.getState()._router_redeemStake.redeemStake;
      let _deFiSideRedeemCalcData: DeFiSideRedeemCalcData<T> = {
        ...redeemStake.deFiSideRedeemCalcData,
      } as unknown as DeFiSideRedeemCalcData<T>;
      let _oldTradeStake = {
        ...redeemStake,
        ..._redeemStake,
      };
      //_.cloneDeep({ ...tradeStake, ..._tradeStake });
      myLog("defi handleOnchange", _oldTradeStake);

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
        updateRedeemStake({
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
    const redeemStake = store.getState()._router_redeemStake.redeemStake;
    try {
      setIsLoading(true);
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        redeemStake.sellToken?.symbol &&
        redeemStake.sellVol &&
        exchangeInfo
      ) {
        const request = {
          accountId: account.accountId,
          token: {
            tokenId: redeemStake.sellToken?.tokenId ?? 0,
            volume: redeemStake.sellVol,
          },
          hash: (redeemStake.deFiSideRedeemCalcData.stakeViewInfo as any)?.hash,
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
            (redeemStake.deFiSideRedeemCalcData.stakeViewInfo as any).hash
          );
          history.replace({ search: searchParams.toString() });
          setShowSideStakingRedeem({ isShow: false });
          const remainAmount = sdk
            .toBig(redeemStake?.deFiSideRedeemCalcData?.coinSell?.balance)
            .minus(
              redeemStake?.deFiSideRedeemCalcData?.coinSell?.tradeValue ?? 0
            )
            .toString();
          setShowAccount({
            isShow: true,
            step: AccountStep.Staking_Redeem_Success,
            info: {
              productId:
                redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo?.productId,
              symbol: redeemStake.sellToken.symbol,
              amount: redeemStake?.deFiSideRedeemCalcData?.coinSell?.tradeValue,
              remainAmount,
            },
          });
          await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE);
          walletLayer2Service.sendUserUpdate();
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
        type: ToastType.error,
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
    redeemStake?.sellToken?.symbol,
    redeemStake?.sellToken?.tokenId,
    redeemStake?.sellVol,
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
    redeemStake?.sellToken?.symbol,
    exchangeInfo,
    sendRequest,
    setToastOpen,
    t,
  ]);
  const onSubmitBtnClick = React.useCallback(async () => {
    const tradeStake = store.getState()._router_tradeStake.tradeStake;
    if (
      tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellVol &&
      tradeStake?.sellVol &&
      sdk
        .toBig(tradeStake.sellVol)
        .gte(tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellVol)
    ) {
      if (
        sdk
          .toBig(tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellVol ?? 0)
          .minus(tradeStake?.deFiSideCalcData?.stakeViewInfo?.minSellVol ?? 0)
          .toString()
          .startsWith("-")
      ) {
      } else {
        const tradeValue = getValuePrecisionThousand(
          sdk
            .toBig(tradeStake?.deFiSideCalcData?.stakeViewInfo?.maxSellVol)
            .div("1e" + tokenMap[coinSellSymbol]?.decimals),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: true }
        ).replaceAll(sdk.SEP, "");
        // @ts-ignore
        const oldTrade = (tradeStake?.deFiSideCalcData ?? {}) as unknown as T;
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
  const stakeWrapProps = React.useMemo(() => {
    const stakeViewInfo = redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo;
    const requiredHoldDay =
      (stakeViewInfo?.claimableTime - stakeViewInfo?.stakeAt) / 86400000;
    const holdDay = moment(Date.now()).diff(
      moment(new Date(stakeViewInfo?.stakeAt ?? ""))
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
      minSellAmount: (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)
        ?.minSellAmount,
      maxSellAmount: (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)
        ?.maxSellAmount,
      onSubmitClick: onBtnClick as () => void,
      switchStobEvent: (
        _isStoB: boolean | ((prevState: boolean) => boolean)
      ) => {},
      onChangeEvent: handleOnchange,
      deFiSideRedeemCalcData: redeemStake?.deFiSideRedeemCalcData as any,
      tokenSell: tokenMap[coinSellSymbol],
      btnStatus,
      accStatus: account.readyState,
    } as DeFiStakeRedeemWrapProps<T, I, ACD>;
  }, [
    sendRequest,
    redeemStake?.deFiSideRedeemCalcData,
    (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)?.claimableTime,
    (redeemStake?.deFiSideRedeemCalcData?.stakeViewInfo as any)?.maxSellVol,
    account.readyState,
    tradeMarketI18nKey,
    onBtnClick,
    handleOnchange,
    tokenMap,
    coinSellSymbol,
    btnStatus,
  ]); // as ForceWithdrawProps<any, any>;
  return {
    stakeWrapProps: stakeWrapProps as unknown as DeFiStakeRedeemWrapProps<
      T,
      I,
      ACD
    >,
  };
};
