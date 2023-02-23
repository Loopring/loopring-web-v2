import React from "react";
import {
  DeFiSideWrapProps,
  useOpenModals,
  useToggle,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CustomErrorWithCode,
  DeFiCalcData,
  DeFiChgType,
  DeFiSideCalcData,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  TradeBtnStatus,
  TradeStack,
} from "@loopring-web/common-resources";

import {
  makeWalletLayer2,
  useSubmitBtn,
  useWalletLayer2Socket,
} from "@loopring-web/core";
import _ from "lodash";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
  walletLayer2Service,
} from "../../index";
import { useTranslation } from "react-i18next";
import { useTradeStack } from "../../stores";

export const useStakeTrade = <
  T extends IBData<I>,
  I,
  ACD extends DeFiSideCalcData<T>
>({
  isJoin = true,
  setToastOpen,
}: // setServerUpdate,
// setConfirmShowNoBalance,
// confirmShowLimitBalance,
// setConfirmShowLimitBalance,
{
  isJoin: boolean;
  // setServerUpdate: (state: any) => void;
  // setConfirmShowLimitBalance: (state: boolean) => void;
  // setConfirmShowNoBalance: (state: boolean) => void;
  // confirmShowLimitBalance: boolean;
  setToastOpen: (props: {
    open: boolean;
    content: JSX.Element | string;
    type: "success" | "error" | "warning" | "info";
  }) => void;
}) => {
  const { t } = useTranslation(["common"]);
  const refreshRef = React.createRef();
  // const match: any = useRouteMatch("/invest/:defi?/:market?/:isJoin?");

  const [isLoading, setIsLoading] = React.useState(false);
  const [isStoB, setIsStoB] = React.useState(true);

  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  // const { status: walletLayer2Status } = useWalletLayer2();
  const { exchangeInfo, allowTrade } = useSystem();
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const { tradeStack, updateTradeStack, resetTradeStack } = useTradeStack();
  const coinSellSymbol = "LRC";
  const { toggle } = useToggle();

  const handleOnchange = _.debounce(
    ({
      tradeData,
      type,
      _tradeStack = {},
    }: {
      type: DeFiChgType;
      tradeData: T;
      _tradeStack?: Partial<TradeStack<T>>;
    }) => {
      const tradeStack = store.getState()._router_tradeStack.tradeStack;
      let _deFiSideCalcData: DeFiSideCalcData<T> =
        tradeStack.deFiSideCalcData as unknown as DeFiSideCalcData<T>;
      let _oldTradeStack = {
        ...store.getState()._router_tradeStack.tradeStack,
        ..._tradeStack,
      };
      //_.cloneDeep({ ...tradeStack, ..._tradeStack });
      myLog("defi handleOnchange", _oldTradeStack);

      if (tradeData) {
        // const inputValue = tradeData?.tradeValue?.toString() ?? "0";
        // calcValue = sdk.calcDefi({
        //   isJoin,
        //   isInputSell: type === DeFiChgType.coinSell,
        //   ...inputValue,
        //   feeVol: _oldTradeStack.feeRaw,
        //   marketInfo,
        //   tokenSell: tokenMap[coinSellSymbol],
        //   tokenBuy: tokenMap[coinBuySymbol],
        //   buyTokenBalanceVol,
        // });

        // const sellAmount =
        //   tradeData?.tradeValue === undefined
        //     ? undefined
        //     : getValuePrecisionThousand(
        //         sdk
        //           .toBig(calcValue?.sellVol ?? 0)
        //           .div("1e" + tokenMap[coinSellSymbol]?.decimals),
        //         tokenMap[coinSellSymbol].precision,
        //         tokenMap[coinSellSymbol].precision,
        //         tokenMap[coinSellSymbol].precision,
        //         false,
        //         { floor: false }
        //       ).replace(sdk.SEP, "");
        // const buyAmount =
        //   tradeData?.tradeValue === undefined
        //     ? undefined
        //     : getValuePrecisionThousand(
        //         sdk
        //           .toBig(calcValue?.buyVol ?? 0)
        //           .div("1e" + tokenMap[coinBuySymbol]?.decimals),
        //         tokenMap[coinBuySymbol].precision,
        //         tokenMap[coinBuySymbol].precision,
        //         tokenMap[coinBuySymbol].precision,
        //         true,
        //         { floor: true }
        //       ).replace(sdk.SEP, "");
        const sellAmount = "";
        // @ts-ignore
        _deFiSideCalcData = {
          ..._deFiSideCalcData,
          coinSell:
            type === DeFiChgType.coinSell
              ? tradeData
              : { ..._deFiSideCalcData?.coinSell, tradeValue: sellAmount },
        };
      }
      updateTradeStack({
        type: "",
        deFiSideCalcData: {
          ..._deFiSideCalcData,
        },
        // lastInput: type,
      });
    },
    globalSetup.wait
  );
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const tradeStack = store.getState()._router_tradeStack.tradeStack;

    if (account.readyState === AccountStatus.ACTIVATED) {
      const sellExceed = sdk
        .toBig(tradeStack.deFiSideCalcData?.coinSell?.tradeValue ?? 0)
        .gt(tradeStack.deFiSideCalcData?.coinSell?.balance ?? 0);
      myLog(
        "sellExceed",
        sellExceed,
        "sellVol",
        tradeStack.sellVol,
        "buyVol",
        "feeRaw",
        "buy market balance"
      );
      if (
        tradeStack?.sellVol === undefined ||
        sdk.toBig(tradeStack?.sellVol).lte(0) ||
        tradeStack?.maxFeeBips === undefined ||
        tradeStack?.maxFeeBips === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (
        sdk
          .toBig(tradeStack?.sellVol)
          .minus(tradeStack?.miniSellVol ?? 0)
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMin| ${getValuePrecisionThousand(
            sdk
              .toBig(tradeStack?.miniSellVol ?? 0)
              .div("1e" + tokenMap[coinSellSymbol]?.decimals),
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            false,
            { floor: false, isAbbreviate: true }
          )} ${coinSellSymbol}`,
        };
      } else if (sellExceed) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiNoEnough| ${coinSellSymbol}`,
        };
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [tradeStack.deFiSideCalcData, tokenMap, coinSellSymbol]);

  const resetDefault = React.useCallback(
    async (
      clearTrade: boolean = false,
      feeInfo: undefined | { fee: any; feeRaw: any }
    ) => {
      let walletMap: any = {};
      let deFiSideCalcDataInit: Partial<DeFiCalcData<any>> = {
        ...tradeStack.deFiSideCalcData,
        coinSell: {
          belong: coinSellSymbol,
          balance: undefined,
          tradeValue:
            tradeStack.deFiSideCalcData?.coinSell?.belong === coinSellSymbol
              ? tradeStack.deFiSideCalcData?.coinSell?.tradeValue
              : undefined,
        },
      };

      if (account.readyState === AccountStatus.ACTIVATED) {
        if (clearTrade === true) {
          walletLayer2Service.sendUserUpdate();
        }
        walletMap = makeWalletLayer2(true).walletMap ?? {};

        deFiSideCalcDataInit.coinSell.balance =
          walletMap[coinSellSymbol]?.count;
      }

      if (
        clearTrade ||
        tradeStack.deFiSideCalcData?.coinSell?.tradeValue === undefined
      ) {
        deFiSideCalcDataInit.coinSell.tradeValue = undefined;
        deFiSideCalcDataInit.coinBuy.tradeValue = undefined;

        updateTradeStack({
          sellVol: "0",
          sellToken: tokenMap[coinSellSymbol],
          deFiSideCalcData: {
            ...deFiSideCalcDataInit,
            fee: feeInfo?.fee?.toString() ?? "",
          } as DeFiCalcData<T>,
        });
        myLog("resetDefault defi clearTrade", deFiSideCalcDataInit);
      } else {
        const type = DeFiChgType.coinSell;

        const tradeData = {
          ...deFiSideCalcDataInit[type],
          tradeValue:
            tradeStack.deFiSideCalcData[type]?.tradeValue ?? undefined,
        };
        handleOnchange({ tradeData, type });
      }

      setIsLoading(false);
    },
    [
      account.readyState,
      coinSellSymbol,
      handleOnchange,
      isJoin,
      isStoB,
      tokenMap,
      tradeStack.deFiSideCalcData,

      updateTradeStack,
    ]
  );

  const should15sRefresh = _.debounce(async (clearTrade: boolean = false) => {
    if (LoopringAPI.defiAPI) {
      // updateDepth()
      // getDefiMap();
      if (clearTrade) {
        setIsLoading(true);
      }
      Promise.all([]).then(([]) => {
        resetDefault(clearTrade, undefined);
      });
      if (account.readyState === AccountStatus.ACTIVATED) {
        resetDefault(clearTrade, undefined);
      }
    }
  }, globalSetup.wait);

  const walletLayer2Callback = React.useCallback(async () => {
    const type = DeFiChgType.coinSell;
    let tradeValue: any = undefined;

    let deFiSideCalcDataInit: Partial<DeFiCalcData<any>> = {
      coinSell: {
        belong: coinSellSymbol,
        balance: undefined,
      },
      ...(tradeStack?.deFiSideCalcData ?? {}),
    };
    if (tradeStack.deFiSideCalcData) {
      tradeValue = tradeStack?.deFiSideCalcData[type]?.tradeValue ?? undefined;
    }
    if (deFiSideCalcDataInit[type]?.belong) {
      let walletMap: any;
      if (account.readyState === AccountStatus.ACTIVATED) {
        walletMap = makeWalletLayer2(true).walletMap;
        deFiSideCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: walletMap[coinSellSymbol]?.count,
        };
      } else {
        deFiSideCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: undefined,
        };
      }
      const tradeData = {
        ...deFiSideCalcDataInit[type],
        tradeValue,
      };
      myLog("resetDefault Defi walletLayer2Callback", tradeData);
      handleOnchange({ tradeData, type });
    }
  }, [
    account.readyState,
    coinSellSymbol,
    handleOnchange,
    tradeStack.deFiSideCalcData,
  ]);

  useWalletLayer2Socket({ walletLayer2Callback });
  const sendRequest = React.useCallback(async () => {
    try {
      setIsLoading(true);
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeStack.sellToken?.symbol &&
        tradeStack.maxFeeBips &&
        exchangeInfo
      ) {
        const request = {
          accountId: account.accountId,
          token: {
            tokenId: tradeStack.sellToken?.tokenId ?? 0,
            volume: tradeStack.sellVol,
          },
          hash: "",
        };
        myLog("DefiTrade request:", request);
        // @ts-ignore
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
      should15sRefresh(true);
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    isJoin,
    setToastOpen,
    should15sRefresh,
    t,
    tradeStack.sellToken?.symbol,
    tradeStack.sellToken?.tokenId,
    tradeStack.sellVol,
    tradeStack.type,
  ]);

  const handleSubmit = React.useCallback(async () => {
    // const marketInfo = defiMarketMap[market];

    if (
      account.readyState === AccountStatus.ACTIVATED &&
      tokenMap &&
      exchangeInfo &&
      account.eddsaKey?.sk
    ) {
      if (allowTrade && !allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true });
      } else if (toggle && !toggle[`${coinSellSymbol}StackInvest`].enable) {
        setShowTradeIsFrozen({ isShow: true, type: "DefiInvest" });
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
    exchangeInfo,
    sendRequest,
    setToastOpen,
    t,
  ]);
  const onSubmitBtnClick = React.useCallback(async () => {
    const tradeStack = store.getState()._router_tradeStack.tradeStack;
    if (
      tradeStack?.maxSellVol &&
      tradeStack?.sellVol &&
      sdk.toBig(tradeStack.sellVol).gte(tradeStack?.maxSellVol)
    ) {
      if (
        sdk
          .toBig(tradeStack?.maxSellVol ?? 0)
          .minus(tradeStack.miniSellVol ?? 0)
          .toString()
          .startsWith("-")
      ) {
      } else {
        const type = DeFiChgType.coinSell;
        const tradeValue = getValuePrecisionThousand(
          sdk
            .toBig(tradeStack?.maxSellVol)
            .div("1e" + tokenMap[coinSellSymbol]?.decimals),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: true }
        ).replace(sdk.SEP, "");
        // @ts-ignore
        const oldTrade = (tradeStack?.deFiSideCalcData[type] ??
          {}) as unknown as T;
        handleOnchange({
          tradeData: {
            ...oldTrade,
            tradeValue,
          },
          type,
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
  React.useEffect(() => {
    if (
      // walletLayer2Status === SagaStatus.UNSET &&
      isJoin !== undefined
    ) {
      if (refreshRef.current) {
        // @ts-ignore
        refreshRef.current.firstElementChild.click();
        should15sRefresh(true);
      } else {
        should15sRefresh(true);
      }
    }
    return () => {
      resetTradeStack();
      should15sRefresh.cancel();
      handleOnchange.cancel();
    };
  }, [isJoin]);
  myLog("isLoading", isLoading);
  const stackWrapProps = React.useMemo(() => {
    return {
      isStoB,
      refreshRef,
      onConfirm: sendRequest,
      disabled: account.readyState === AccountStatus.ACTIVATED,
      btnInfo: {
        label: tradeMarketI18nKey,
        params: {},
      },
      isLoading,
      switchStobEvent: (
        _isStoB: boolean | ((prevState: boolean) => boolean)
      ) => {
        setIsStoB(_isStoB);
      },
      onRefreshData: should15sRefresh,
      onSubmitClick: onBtnClick as () => void,
      onChangeEvent: handleOnchange,
      tokenAProps: {},
      tokenBProps: {},
      deFiSideCalcData: {
        ...tradeStack.deFiSideCalcData,
      },
      maxSellVol: tradeStack.maxSellVol,
      tokenSell: tokenMap[coinSellSymbol],
      btnStatus,
      accStatus: account.readyState,
    };
  }, [
    isStoB,
    refreshRef,
    sendRequest,
    tradeStack.deFiSideCalcData,
    tradeStack.maxSellVol,
    account.readyState,
    tradeMarketI18nKey,
    isLoading,
    should15sRefresh,
    onBtnClick,
    handleOnchange,
    tokenMap,
    coinSellSymbol,
    btnStatus,
  ]); // as ForceWithdrawProps<any, any>;
  return {
    stackWrapProps: stackWrapProps as unknown as DeFiSideWrapProps<T, I, ACD>,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    // serverUpdate,
    // setServerUpdate,
  };
};
