import React from "react";
import {
  DeFiChgType,
  DeFiWrapProps,
  TradeBtnStatus,
  useOpenModals,
  useToggle,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CustomErrorWithCode,
  DeFiCalcData,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  MarketType,
  myLog,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";

import {
  useSubmitBtn,
  makeWalletLayer2,
  useWalletLayer2Socket,
  TradeDual,
} from "@loopring-web/core";
import _ from "lodash";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  useTokenMap,
  useAccount,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  walletLayer2Service,
  useSystem,
} from "../../index";
import { useTranslation } from "react-i18next";
import { useDualMap, useTradeDual } from "../../stores";

export const useDualTrade = <
  T extends IBData<I>,
  I,
  ACD extends DeFiCalcData<T>
>({
  isJoin = true,
  setToastOpen,
  market = "",
}: {
  market: string;
  isJoin: boolean;
  setToastOpen: (props: {
    open: boolean;
    content: JSX.Element | string;
    type: "success" | "error" | "warning" | "info";
  }) => void;
}) => {
  const { t } = useTranslation(["common"]);
  const refreshRef = React.createRef();
  // const match: any = useRouteMatch("/invest/:defi?/:market?/:isJoin?");

  const {
    marketMap: defiMarketMap,
    updateDualSyncMap,
    // status: defiMarketStatus,
  } = useDualMap();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStoB, setIsStoB] = React.useState(true);
  const [confirmShowNoBalance, setConfirmShowNoBalance] =
    React.useState<boolean>(false);
  const [confirmShowLimitBalance, setConfirmShowLimitBalance] =
    React.useState<boolean>(false);

  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  // const { status: walletLayer2Status } = useWalletLayer2();
  const { exchangeInfo, allowTrade } = useSystem();
  const { tradeDual, updateTradeDual, resetTradeDual } = useTradeDual();
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const [serverUpdate, setServerUpdate] = React.useState(false);

  const {
    toggle: { defiInvest },
  } = useToggle();
  const [{ coinSellSymbol, coinBuySymbol }, setSymbol] = React.useState(() => {
    if (isJoin) {
      const [, coinBuySymbol, coinSellSymbol] =
        market.match(/(\w+)-(\w+)/i) ?? [];
      return { coinBuySymbol, coinSellSymbol };
    } else {
      const [, coinSellSymbol, coinBuySymbol] =
        market.match(/(\w+)-(\w+)/i) ?? [];
      return { coinBuySymbol, coinSellSymbol };
    }
  });

  const getFee = React.useCallback(
    async (
      requestType:
        | sdk.OffchainFeeReqType.DEFI_JOIN
        | sdk.OffchainFeeReqType.DEFI_EXIT
    ): Promise<{ fee: string; feeRaw: string } | undefined> => {
      if (
        LoopringAPI.userAPI &&
        coinSellSymbol &&
        account.readyState === AccountStatus.ACTIVATED &&
        tokenMap
      ) {
        const feeToken: sdk.TokenInfo = tokenMap[coinBuySymbol];

        const request: sdk.GetOffchainFeeAmtRequest = {
          accountId: account.accountId,
          requestType,
          market,
        };

        const { fees } = await LoopringAPI.userAPI.getOffchainFeeAmt(
          request,
          account.apiKey
        );

        const feeRaw = fees[coinBuySymbol] ? fees[coinBuySymbol].fee : "0";
        const fee = sdk
          .toBig(feeRaw)
          .div("1e" + feeToken.decimals)
          .toString();

        myLog("new fee:", fee.toString());
        return {
          fee: fee,
          feeRaw: feeRaw,
          // fees,
        };
      }
    },
    [
      coinSellSymbol,
      account.readyState,
      account.accountId,
      account.apiKey,
      tokenMap,
      coinBuySymbol,
      market,
    ]
  );

  const handleOnchange = _.debounce(
    ({
      tradeData,
      type,
      _tradeDual = {},
    }: {
      type: DeFiChgType;
      tradeData: T;
      _tradeDual?: Partial<TradeDual<T>>;
    }) => {
      const marketInfo = defiMarketMap[market];
      const tradeDual = store.getState()._router_tradeDual.tradeDual;
      let _deFiCalcData: DeFiCalcData<T> =
        tradeDual.deFiCalcData as unknown as DeFiCalcData<T>;
      let calcValue;
      let _oldTradeDual = {
        ...store.getState()._router_tradeDual.tradeDual,
        ..._tradeDual,
      };
      //_.cloneDeep({ ...tradeDual, ..._tradeDual });
      myLog("defi handleOnchange", _oldTradeDual.defiBalances, _oldTradeDual);

      if (
        tradeData &&
        _oldTradeDual.defiBalances &&
        coinBuySymbol &&
        _oldTradeDual?.defiBalances[coinBuySymbol]
      ) {
        const inputValue =
          type === DeFiChgType.coinSell
            ? {
                sellAmount: tradeData?.tradeValue?.toString() ?? "0",
              }
            : {
                buyAmount: tradeData?.tradeValue?.toString() ?? "0",
              };
        const buyTokenBalanceVol: string =
          _oldTradeDual?.defiBalances[coinBuySymbol] ?? "";
        calcValue = sdk.calcDual({
          isJoin,
          isInputSell: type === DeFiChgType.coinSell,
          ...inputValue,
          feeVol: _oldTradeDual.feeRaw,
          marketInfo,
          tokenSell: tokenMap[coinSellSymbol],
          tokenBuy: tokenMap[coinBuySymbol],
          buyTokenBalanceVol,
        });

        const sellAmount =
          tradeData?.tradeValue === undefined
            ? undefined
            : getValuePrecisionThousand(
                sdk
                  .toBig(calcValue?.sellVol ?? 0)
                  .div("1e" + tokenMap[coinSellSymbol]?.decimals),
                tokenMap[coinSellSymbol].precision,
                tokenMap[coinSellSymbol].precision,
                tokenMap[coinSellSymbol].precision,
                false,
                { floor: false }
              ).replace(",", "");
        const buyAmount =
          tradeData?.tradeValue === undefined
            ? undefined
            : getValuePrecisionThousand(
                sdk
                  .toBig(calcValue?.buyVol ?? 0)
                  .div("1e" + tokenMap[coinBuySymbol]?.decimals),
                tokenMap[coinBuySymbol].precision,
                tokenMap[coinBuySymbol].precision,
                tokenMap[coinBuySymbol].precision,
                true,
                { floor: true }
              ).replace(",", "");

        // @ts-ignore
        _deFiCalcData = {
          ..._deFiCalcData,
          coinSell:
            type === DeFiChgType.coinSell
              ? tradeData
              : { ..._deFiCalcData?.coinSell, tradeValue: sellAmount },
          coinBuy:
            type === DeFiChgType.coinBuy
              ? tradeData
              : { ..._deFiCalcData?.coinBuy, tradeValue: buyAmount },
        };
      }
      updateTradeDual({
        market:
          _oldTradeDual.market !== market ? (market as MarketType) : undefined,
        ..._oldTradeDual,
        ...calcValue,
        deFiCalcData: {
          ..._deFiCalcData,
        },
        lastInput: type,
      });
    },
    globalSetup.wait
  );
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const tradeDual = store.getState()._router_tradeDual.tradeDual;

    if (account.readyState === AccountStatus.ACTIVATED) {
      const sellExceed = sdk
        .toBig(tradeDual.deFiCalcData?.coinSell?.tradeValue ?? 0)
        .gt(tradeDual.deFiCalcData?.coinSell?.balance ?? 0);
      myLog(
        "sellExceed",
        sellExceed,
        "sellVol",
        tradeDual.sellVol,
        "buyVol",
        tradeDual.buyVol,
        "feeRaw",
        tradeDual.feeRaw,
        "buy market balance",
        //@ts-ignore
        defiMarketMap && defiMarketMap[market]?.baseVolume
      );
      if (
        tradeDual?.sellVol === undefined ||
        sdk.toBig(tradeDual?.sellVol).lte(0) ||
        tradeDual?.buyVol === undefined ||
        sdk.toBig(tradeDual?.buyVol).lte(0) ||
        tradeDual?.maxFeeBips === undefined ||
        tradeDual?.maxFeeBips === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (
        sdk
          .toBig(tradeDual?.sellVol)
          .minus(tradeDual?.miniSellVol ?? 0)
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDualMin| ${getValuePrecisionThousand(
            sdk
              .toBig(tradeDual?.miniSellVol ?? 0)
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
          label: `labelDualNoEnough| ${coinSellSymbol}`,
        };
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [defiMarketMap, market, tradeDual.deFiCalcData, tokenMap, coinSellSymbol]);

  const resetDefault = React.useCallback(
    async (
      clearTrade: boolean = false,
      feeInfo: undefined | { fee: any; feeRaw: any }
    ) => {
      let walletMap: any = {};
      const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i) ?? [];
      const defiMarketMap = store.getState().invest.defiMap?.marketMap;
      const marketInfo = defiMarketMap[market];
      let deFiCalcDataInit: Partial<DeFiCalcData<any>> = {
        ...tradeDual.deFiCalcData,
        coinSell: {
          belong: coinSellSymbol,
          balance: undefined,
          tradeValue:
            tradeDual.deFiCalcData?.coinSell?.belong === coinSellSymbol
              ? tradeDual.deFiCalcData?.coinSell?.tradeValue
              : undefined,
        },
        coinBuy: {
          belong: coinBuySymbol,
          balance: undefined,
          tradeValue:
            tradeDual.deFiCalcData?.coinBuy?.belong === coinBuySymbol
              ? tradeDual.deFiCalcData?.coinBuy?.tradeValue
              : undefined,
        },
      };
      let _feeInfo = feeInfo
        ? feeInfo
        : {
            fee: tradeDual.fee,
            feeRaw: tradeDual.feeRaw,
          };

      if (account.readyState === AccountStatus.ACTIVATED) {
        if (clearTrade === true) {
          walletLayer2Service.sendUserUpdate();
        }
        walletMap = makeWalletLayer2(true).walletMap;
        deFiCalcDataInit.coinSell.balance = walletMap[coinSellSymbol]?.count;
        deFiCalcDataInit.coinBuy.balance = walletMap[coinBuySymbol]?.count;
      }

      myLog(
        "resetDefault defi clearTrade",
        deFiCalcDataInit.coinSell,
        tradeDual.deFiCalcData?.coinSell?.tradeValue,
        clearTrade,
        feeInfo
      );
      if (
        tradeDual.market !== market ||
        clearTrade ||
        tradeDual.deFiCalcData?.coinSell?.tradeValue === undefined
      ) {
        deFiCalcDataInit.coinSell.tradeValue = undefined;
        deFiCalcDataInit.coinBuy.tradeValue = undefined;
        const [AtoB, BtoA] = marketInfo
          ? isJoin
            ? [marketInfo.depositPrice, marketInfo.withdrawPrice]
            : [marketInfo.withdrawPrice, marketInfo.depositPrice]
          : ["0", "0"];
        updateTradeDual({
          market:
            tradeDual.market !== market ? (market as MarketType) : undefined,
          isStoB,
          sellVol: "0",
          buyVol: "0",
          sellToken: tokenMap[coinSellSymbol],
          buyToken: tokenMap[coinBuySymbol],
          deFiCalcData: {
            ...deFiCalcDataInit,
            AtoB,
            BtoA,
            fee: feeInfo?.fee?.toString() ?? "",
          } as DeFiCalcData<T>,
          defiBalances: {
            [baseSymbol]: marketInfo?.baseVolume ?? "",
            [quoteSymbol]: marketInfo?.quoteVolume ?? "",
          } as any,
          fee: _feeInfo?.fee.toString(),
          feeRaw: _feeInfo?.feeRaw.toString(),
          depositPrice: marketInfo?.depositPrice ?? "0",
          withdrawPrice: marketInfo?.withdrawPrice ?? "0",
        });
        myLog("resetDefault defi clearTrade", deFiCalcDataInit, marketInfo);
      } else {
        const type = tradeDual.lastInput ?? DeFiChgType.coinSell;
        const _tradeDual = {
          defiBalances: {
            [baseSymbol]: marketInfo?.baseVolume ?? "",
            [quoteSymbol]: marketInfo?.quoteVolume ?? "",
          } as any,
          fee: _feeInfo?.fee.toString(),
          feeRaw: _feeInfo?.feeRaw.toString(),
          depositPrice: marketInfo?.depositPrice ?? "0",
          withdrawPrice: marketInfo?.withdrawPrice ?? "0",
        };
        const tradeData = {
          ...deFiCalcDataInit[type],
          tradeValue: tradeDual.deFiCalcData[type]?.tradeValue ?? undefined,
        };
        handleOnchange({ tradeData, type, _tradeDual });
      }

      setIsLoading(false);
    },
    [
      account.readyState,
      coinBuySymbol,
      coinSellSymbol,
      defiMarketMap,
      handleOnchange,
      isJoin,
      isStoB,
      market,
      tokenMap,
      tradeDual.deFiCalcData,
      tradeDual.fee,
      tradeDual.feeRaw,
      tradeDual.lastInput,
      tradeDual.market,
      updateTradeDual,
    ]
  );

  const should15sRefresh = _.debounce(async (clearTrade: boolean = false) => {
    myLog("should15sRefresh", market, clearTrade);
    if (market && LoopringAPI.defiAPI) {
      // updateDepth()
      // getDualMap();
      if (clearTrade) {
        setIsLoading(true);
      }
      Promise.all([
        LoopringAPI.defiAPI?.getDualMarkets({ defiType: "" }),
        account.readyState === AccountStatus.ACTIVATED
          ? getFee(
              isJoin
                ? sdk.OffchainFeeReqType.DEFI_JOIN
                : sdk.OffchainFeeReqType.DEFI_EXIT
            )
          : Promise.resolve(undefined),
      ]).then(([defiMapInfo, _feeInfo]) => {
        if (
          (defiMapInfo as sdk.RESULT_INFO).code ||
          (defiMapInfo as sdk.RESULT_INFO).message
        ) {
          setServerUpdate(true);
        } else {
          let status: any = defiMapInfo.markets[market]?.status ?? 0;
          status = ("00000000" + status.toString(2)).split("");
          if (
            !(isJoin
              ? status[status.length - 2] === "1"
              : status[status.length - 4] === "1")
          ) {
            setServerUpdate(true);
          } else {
            updateDualSyncMap({
              defiMap: {
                marketMap: defiMapInfo.markets,
                marketCoins: defiMapInfo.tokenArr,
                marketArray: defiMapInfo.marketArr,
              },
            });
          }
        }
        resetDefault(clearTrade, {
          fee: tradeDual.fee,
          feeRaw: tradeDual.feeRaw,
          ..._feeInfo,
        });
      });
      if (account.readyState === AccountStatus.ACTIVATED) {
        resetDefault(clearTrade, undefined);
      }
    }
  }, globalSetup.wait);

  const walletLayer2Callback = React.useCallback(async () => {
    const type = tradeDual.lastInput ?? DeFiChgType.coinSell;
    let tradeValue: any = undefined;

    let deFiCalcDataInit: Partial<DeFiCalcData<any>> = {
      coinSell: {
        belong: coinSellSymbol,
        balance: undefined,
      },
      coinBuy: {
        belong: coinBuySymbol,
        balance: undefined,
      },
      ...(tradeDual?.deFiCalcData ?? {}),
    };
    if (tradeDual.deFiCalcData) {
      tradeValue = tradeDual?.deFiCalcData[type]?.tradeValue ?? undefined;
    }
    if (deFiCalcDataInit[type]?.belong) {
      let walletMap: any;
      if (account.readyState === AccountStatus.ACTIVATED) {
        walletMap = makeWalletLayer2(true).walletMap;
        deFiCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: walletMap[coinSellSymbol]?.count,
        };
        deFiCalcDataInit.coinBuy = {
          belong: coinBuySymbol,
          balance: walletMap[coinBuySymbol]?.count,
        };
      } else {
        deFiCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: undefined,
        };
        deFiCalcDataInit.coinBuy = {
          belong: coinBuySymbol,
          balance: undefined,
        };
      }
      const tradeData = {
        ...deFiCalcDataInit[type],
        tradeValue,
      };
      myLog("resetDefault Dual walletLayer2Callback", tradeData);
      handleOnchange({ tradeData, type });
    }
  }, [
    account.readyState,
    coinBuySymbol,
    coinSellSymbol,
    handleOnchange,
    tradeDual.deFiCalcData,
    tradeDual.lastInput,
  ]);

  useWalletLayer2Socket({ walletLayer2Callback });
  const sendRequest = React.useCallback(async () => {
    try {
      setIsLoading(true);
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeDual.sellToken?.symbol &&
        tradeDual.maxFeeBips &&
        exchangeInfo
      ) {
        const req: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: tradeDual.sellToken?.tokenId ?? 0,
        };
        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          req,
          account.apiKey
        );
        const request: sdk.DualOrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: tradeDual.sellToken?.tokenId ?? 0,
            volume: tradeDual.sellVol,
          },
          buyToken: {
            tokenId: tradeDual.buyToken?.tokenId ?? 0,
            volume: tradeDual.buyVol,
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: tradeDual.maxFeeBips <= 5 ? 5 : tradeDual.maxFeeBips,
          fillAmountBOrS: false,
          action: isJoin ? sdk.DualAction.Deposit : sdk.DualAction.Withdraw,
          fee: tradeDual.feeRaw,
          type: tradeDual.type,
          taker: "",
          eddsaSignature: "",
          // taker:
          // new BN(ethUtil.toBuffer(request.taker)).toString(),
        };
        myLog("DualTrade request:", request);
        const response = await LoopringAPI.defiAPI.orderDual(
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
          throw new CustomErrorWithCode({
            id: ((response as sdk.RESULT_INFO)?.code ?? 700001).toString(),
            code: (response as sdk.RESULT_INFO)?.code ?? 700001,
            message:
              (response as sdk.RESULT_INFO)?.message ?? errorItem.message,
          });
        } else {
          setToastOpen({
            open: true,
            type: "success",
            content: t("labelInvestSuccess", {
              type: isJoin
                ? t("labelInvestDefDeposit")
                : t("labelInvestDefWithdraw"),
              symbol: coinBuySymbol,
            }),
          });
        }
      } else {
        throw new Error("api not ready");
      }
    } catch (reason) {
      setToastOpen({
        open: true,
        type: "error",
        content: t("labelInvestFailed"), //+ ` error: ${(reason as any)?.message}`,
      });
    } finally {
      setConfirmShowLimitBalance(false);
      should15sRefresh(true);
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    coinBuySymbol,
    exchangeInfo,
    isJoin,
    setToastOpen,
    should15sRefresh,
    t,
    tradeDual.buyToken?.tokenId,
    tradeDual.buyVol,
    tradeDual.feeRaw,
    tradeDual.maxFeeBips,
    tradeDual.sellToken?.symbol,
    tradeDual.sellToken?.tokenId,
    tradeDual.sellVol,
    tradeDual.type,
  ]);

  const handleSubmit = React.useCallback(async () => {
    const { tradeDual } = store.getState()._router_tradeDual;

    if (
      (account.readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        account.eddsaKey?.sk,
      tradeDual.buyVol)
    ) {
      if (!allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true });
      } else if (!defiInvest.enable) {
        setShowTradeIsFrozen({ isShow: true, type: "DualInvest" });
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
  // const isNoBalance = ;
  const onSubmitBtnClick = React.useCallback(async () => {
    const tradeDual = store.getState()._router_tradeDual.tradeDual;
    if (
      tradeDual?.maxSellVol &&
      tradeDual?.sellVol &&
      sdk.toBig(tradeDual.sellVol).gte(tradeDual?.maxSellVol)
    ) {
      if (
        sdk
          .toBig(tradeDual?.maxSellVol ?? 0)
          .minus(tradeDual.miniSellVol ?? 0)
          .toString()
          .startsWith("-")
      ) {
        setConfirmShowNoBalance(true);
      } else {
        setConfirmShowLimitBalance(true);
        const type = DeFiChgType.coinSell;
        const tradeValue = getValuePrecisionThousand(
          sdk
            .toBig(tradeDual?.maxSellVol)
            .div("1e" + tokenMap[coinSellSymbol]?.decimals),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: true }
        ).replace(",", "");
        // @ts-ignore
        const oldTrade = (tradeDual?.deFiCalcData[type] ?? {}) as unknown as T;
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

  // useWalletLayer2Socket({ walletLayer2Callback });

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
      market &&
      market !== "" &&
      // walletLayer2Status === SagaStatus.UNSET &&
      isJoin !== undefined
    ) {
      setSymbol(() => {
        if (isJoin) {
          const [, coinBuySymbol, coinSellSymbol] =
            market.match(/(\w+)-(\w+)/i) ?? [];
          return { coinBuySymbol, coinSellSymbol };
        } else {
          const [, coinSellSymbol, coinBuySymbol] =
            market.match(/(\w+)-(\w+)/i) ?? [];
          return { coinBuySymbol, coinSellSymbol };
        }
      });
      if (refreshRef.current) {
        // @ts-ignore
        refreshRef.current.firstElementChild.click();
        should15sRefresh(true);
        myLog("should15sRefresh refreshRef.current click only", market);
      } else {
        should15sRefresh(true);
      }
    }
    return () => {
      myLog("should15sRefresh cancel", market);
      resetTradeDual();
      should15sRefresh.cancel();
      handleOnchange.cancel();
    };
  }, [isJoin, market]);
  myLog("isLoading", isLoading);
  const deFiWrapProps = React.useMemo(() => {
    return {
      isStoB,
      refreshRef,
      onConfirm: sendRequest,
      disabled:
        !tradeDual.deFiCalcData?.AtoB ||
        (account.readyState === AccountStatus.ACTIVATED && !tradeDual?.feeRaw),
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
      deFiCalcData: {
        ...tradeDual.deFiCalcData,
      },
      maxBuyVol: tradeDual.defiBalances
        ? tradeDual.defiBalances[coinBuySymbol]
        : undefined,
      maxSellVol: tradeDual.maxSellVol,
      confirmShowLimitBalance,
      tokenSell: tokenMap[coinSellSymbol],
      tokenBuy: tokenMap[coinBuySymbol],
      btnStatus,
      accStatus: account.readyState,
    };
  }, [
    isStoB,
    refreshRef,
    sendRequest,
    tradeDual.balances,
    tradeDual.dualCalcData,
    tradeDual?.feeRaw,
    tradeDual.maxSellVol,
    account.readyState,
    tradeMarketI18nKey,
    isLoading,
    should15sRefresh,
    onBtnClick,
    handleOnchange,
    confirmShowLimitBalance,
    tokenMap,
    coinSellSymbol,
    coinBuySymbol,
    btnStatus,
  ]); // as ForceWithdrawProps<any, any>;
  return {
    deFiWrapProps: deFiWrapProps as unknown as DeFiWrapProps<T, I, ACD>,
    confirmShowNoBalance,
    setConfirmShowNoBalance,
    serverUpdate,
    setServerUpdate,
  };
};
