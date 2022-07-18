import React from "react";
import {
  DeFiChgType,
  DeFiWrapProps,
  TradeBtnStatus,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
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
  TradeDefi,
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
import { useDefiMap, useTradeDefi } from "../../stores";
import { useRouteMatch } from "react-router-dom";

export const useDefiTrade = <
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
  const match: any = useRouteMatch("/invest/:defi/:market/:isJoin");

  const {
    marketMap: defiMarketMap,
    updateDefiSyncMap,
    // status: defiMarketStatus,
  } = useDefiMap();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isStoB, setIsStoB] = React.useState(true);
  const [confirmShow, setConfirmShow] = React.useState<boolean>(false);

  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  // const {
  //   status: walletLayer2Status,
  // } = useWalletLayer2();
  const { exchangeInfo } = useSystem();
  const { tradeDefi, updateTradeDefi } = useTradeDefi();

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
      _tradeDefi = {},
    }: {
      type: DeFiChgType;
      tradeData: T;
      _tradeDefi?: Partial<TradeDefi<T>>;
    }) => {
      const marketInfo = defiMarketMap[market];
      const tradeDefi = store.getState()._router_tradeDefi.tradeDefi;
      let _deFiCalcData: DeFiCalcData<T> =
        tradeDefi.deFiCalcData as unknown as DeFiCalcData<T>;
      let calcValue;
      let _oldTradeDefi = {
        ...store.getState()._router_tradeDefi.tradeDefi,
        ..._tradeDefi,
      };
      //_.cloneDeep({ ...tradeDefi, ..._tradeDefi });
      myLog("defi handleOnchange", _oldTradeDefi.defiBalances, _oldTradeDefi);

      if (
        tradeData &&
        _oldTradeDefi.defiBalances &&
        coinBuySymbol &&
        _oldTradeDefi?.defiBalances[coinBuySymbol]
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
          _oldTradeDefi?.defiBalances[coinBuySymbol] ?? "";
        calcValue = sdk.calcDefi({
          isJoin,
          isInputSell: type === DeFiChgType.coinSell,
          ...inputValue,
          feeVol: _oldTradeDefi.feeRaw,
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
              );
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
                { floor: false }
              );

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
      updateTradeDefi({
        ..._oldTradeDefi,
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
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi;

    if (account.readyState === AccountStatus.ACTIVATED) {
      const sellExceed = sdk
        .toBig(tradeDefi.deFiCalcData?.coinSell.tradeValue ?? 0)
        .gt(tradeDefi.deFiCalcData?.coinSell?.balance ?? 0);
      myLog(
        "sellExceed",
        sellExceed,
        tradeDefi.sellVol,
        tradeDefi.buyVol,
        tradeDefi.feeRaw
      );
      if (
        tradeDefi?.sellVol === undefined ||
        sdk.toBig(tradeDefi?.sellVol).lte(0) ||
        tradeDefi?.buyVol === undefined ||
        sdk.toBig(tradeDefi?.buyVol).lte(0) ||
        tradeDefi?.maxFeeBips === undefined ||
        tradeDefi?.maxFeeBips === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (
        sdk.toBig(tradeDefi?.sellVol).lt(tradeDefi?.miniSellVol ?? 0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMin| ${getValuePrecisionThousand(
            sdk
              .toBig(tradeDefi?.miniSellVol ?? 0)
              .div("1e" + tokenMap[coinSellSymbol]?.decimals),
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            false,
            { floor: false }
          )} ${coinSellSymbol}`,
        };
      } else if (sellExceed) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelDefiNoEnough| ${coinSellSymbol}",
        };
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [tradeDefi.deFiCalcData, tokenMap, coinSellSymbol]);

  const resetDefault = React.useCallback(
    async (clearTrade: boolean = false, feeInfo: any) => {
      let walletMap: any = {};
      const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i) ?? [];
      const marketInfo = defiMarketMap[market];
      let deFiCalcDataInit: Partial<DeFiCalcData<any>> = {
        coinSell: {},
        coinBuy: {},
        ...tradeDefi.deFiCalcData,
      };
      if (account.readyState === AccountStatus.ACTIVATED) {
        if (clearTrade === true) {
          walletLayer2Service.sendUserUpdate();
        } else {
          walletMap = makeWalletLayer2(true).walletMap;
          deFiCalcDataInit.coinSell = {
            belong: coinSellSymbol,
            balance: walletMap[coinSellSymbol]?.count,
          };
          deFiCalcDataInit.coinBuy = {
            belong: coinBuySymbol,
            balance: walletMap[coinBuySymbol]?.count,
          };
        }
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
      myLog(
        "resetDefault defi clearTrade",
        deFiCalcDataInit.coinSell,
        tradeDefi.deFiCalcData?.coinSell?.tradeValue,
        clearTrade,
        feeInfo
      );
      if (
        tradeDefi.market !== market ||
        clearTrade ||
        tradeDefi.deFiCalcData?.coinSell?.tradeValue === undefined
      ) {
        deFiCalcDataInit.coinSell = {
          ...deFiCalcDataInit.coinSell,
          tradeValue: undefined,
        };
        deFiCalcDataInit.coinSell = {
          ...deFiCalcDataInit.coinSell,
          tradeValue: undefined,
        };
        const [AtoB, BtoA] = marketInfo
          ? isJoin
            ? [marketInfo.depositPrice, marketInfo.withdrawPrice]
            : [marketInfo.withdrawPrice, marketInfo.depositPrice]
          : ["0", "0"];
        updateTradeDefi({
          market:
            tradeDefi.market !== market ? (market as MarketType) : undefined,
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
          fee: feeInfo?.fee.toString(),
          feeRaw: feeInfo?.feeRaw.toString(),
          depositPrice: marketInfo?.depositPrice ?? "0",
          withdrawPrice: marketInfo?.withdrawPrice ?? "0",
        });
      } else {
        const type = tradeDefi.lastInput ?? DeFiChgType.coinSell;
        const _tradeDefi = {
          defiBalances: {
            [baseSymbol]: marketInfo?.baseVolume ?? "",
            [quoteSymbol]: marketInfo?.quoteVolume ?? "",
          } as any,
          fee: feeInfo?.fee.toString(),
          feeRaw: feeInfo?.feeRaw.toString(),
          depositPrice: marketInfo?.depositPrice ?? "0",
          withdrawPrice: marketInfo?.withdrawPrice ?? "0",
        };
        const tradeData = {
          ...deFiCalcDataInit[type],
          tradeValue: tradeDefi.deFiCalcData[type]?.tradeValue ?? undefined,
        };
        handleOnchange({ tradeData, type, _tradeDefi });
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
      tradeDefi.deFiCalcData,
      tradeDefi.lastInput,
      tradeDefi.market,
      updateTradeDefi,
    ]
  );

  const should15sRefresh = _.debounce(async (clearTrade: boolean = false) => {
    myLog("should15sRefresh", market, clearTrade);
    let _feeInfo;
    if (market && LoopringAPI.defiAPI) {
      // updateDepth()
      // getDefiMap();
      if (clearTrade) {
        setIsLoading(true);
      }
      const {
        markets: marketMap,
        tokenArr: marketCoins,
        marketArr: marketArray,
      } = await LoopringAPI.defiAPI?.getDefiMarkets();
      updateDefiSyncMap({
        defiMap: {
          marketMap,
          marketCoins,
          marketArray,
        },
      });
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        market !== tradeDefi.market
      ) {
        [_feeInfo] = await Promise.all([
          getFee(
            isJoin
              ? sdk.OffchainFeeReqType.DEFI_JOIN
              : sdk.OffchainFeeReqType.DEFI_EXIT
          ),
        ]);
        // setFeeInfo(feeInfo);
      }
      resetDefault(clearTrade, {
        fee: tradeDefi.fee,
        feeRaw: tradeDefi.feeRaw,
        ..._feeInfo,
      });
    }
  }, globalSetup.wait);

  const walletLayer2Callback = React.useCallback(async () => {
    const type = tradeDefi.lastInput ?? DeFiChgType.coinSell;
    let tradeValue: any = undefined;

    let deFiCalcDataInit: Partial<DeFiCalcData<any>> = {
      coinSell: {},
      coinBuy: {},
      ...(tradeDefi?.deFiCalcData ?? {}),
    };
    if (tradeDefi.deFiCalcData) {
      tradeValue = tradeDefi?.deFiCalcData[type]?.tradeValue ?? undefined;
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
      myLog("Defi walletLayer2Callback", tradeData);
      handleOnchange({ tradeData, type });
    }
  }, [handleOnchange, tradeDefi]);

  useWalletLayer2Socket({ walletLayer2Callback });
  const sendRequest = React.useCallback(async () => {
    try {
      setIsLoading(true);
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeDefi.sellToken?.symbol &&
        tradeDefi.maxFeeBips &&
        exchangeInfo
      ) {
        const req: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: tradeDefi.sellToken?.tokenId ?? 0,
        };
        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          req,
          account.apiKey
        );
        const request: sdk.DefiOrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: tradeDefi.sellToken?.tokenId ?? 0,
            volume: tradeDefi.sellVol,
          },
          buyToken: {
            tokenId: tradeDefi.buyToken?.tokenId ?? 0,
            volume: tradeDefi.buyVol,
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: tradeDefi.maxFeeBips,
          fillAmountBOrS: false,
          action: isJoin ? sdk.DefiAction.Deposit : sdk.DefiAction.Withdraw,
          fee: tradeDefi.feeRaw,
          type: tradeDefi.type,
          taker: "",
          eddsaSignature: "",
          // taker:
          // new BN(ethUtil.toBuffer(request.taker)).toString(),
        };
        myLog("DefiTrade request:", request);
        const response = await LoopringAPI.defiAPI.orderDefi(
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
          setToastOpen({
            open: true,
            type: "error",
            content:
              t("labelInvestFailed") +
              " error: " +
              (errorItem
                ? t(errorItem.messageKey, { ns: "error" })
                : (response as sdk.RESULT_INFO).message),
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
      sdk.dumpError400(reason);
      setToastOpen({
        open: true,
        type: "error",
        content: t("labelInvestFailed"),
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
    tradeDefi.buyToken?.tokenId,
    tradeDefi.buyVol,
    tradeDefi.feeRaw,
    tradeDefi.maxFeeBips,
    tradeDefi.sellToken?.symbol,
    tradeDefi.sellToken?.tokenId,
    tradeDefi.sellVol,
    tradeDefi.type,
  ]);

  const handleSubmit = React.useCallback(async () => {
    const { tradeDefi } = store.getState()._router_tradeDefi;
    if (
      (account.readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        account.eddsaKey?.sk,
      tradeDefi.buyVol)
    ) {
      try {
        sendRequest();
      } catch (e: any) {
        // const errorItem = sdk.dumpError400(e);
        setToastOpen({
          open: true,
          type: "error",
          content: t("labelExitAmmFailed") + ` error: ${e.message}`,
        });
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
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi;
    if (
      tradeDefi?.maxSellVol &&
      tradeDefi?.sellVol &&
      sdk.toBig(tradeDefi.sellVol).gte(tradeDefi?.maxSellVol)
    ) {
      setConfirmShow(true);
    } else {
      handleSubmit();
    }
  }, [handleSubmit]);

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
        if (!should15sRefresh.flush()) {
          myLog("should15sRefresh refreshRef.current call", market);
          should15sRefresh(true);
          // @ts-ignore
          refreshRef.current.firstElementChild.click();
        } else {
          myLog("should15sRefresh refreshRef.current click only", market);
          // @ts-ignore
          refreshRef.current.firstElementChild.click();
        }
      } else {
        should15sRefresh(true);
      }
    }
    return () => {
      should15sRefresh.cancel();
      handleOnchange.cancel();
    };
  }, [
    match?.param,
    // market,
    // match?.param?.defi,
    // market,
    // isJoin,
    // match?.param?.defi,
    // walletLayer2Status,
    // walletLayer2,
    // account.readyState,
  ]);
  // React.useEffect(() => {}, []);

  const deFiWrapProps = React.useMemo(() => {
    return {
      isStoB,
      refreshRef,
      onConfirm: sendRequest,
      disabled: !(account.readyState === AccountStatus.ACTIVATED
        ? tradeDefi?.maxFeeBips
        : true),
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
        ...tradeDefi.deFiCalcData,
      },
      tokenSell: tokenMap[coinSellSymbol],
      tokenBuy: tokenMap[coinBuySymbol],
      btnStatus,
      accStatus: account.readyState,
    };
  }, [
    isStoB,
    refreshRef,
    sendRequest,
    account.readyState,
    tradeDefi?.maxFeeBips,
    tradeDefi.deFiCalcData,
    tradeMarketI18nKey,
    isLoading,
    should15sRefresh,
    onBtnClick,
    handleOnchange,
    tokenMap,
    coinSellSymbol,
    coinBuySymbol,
    btnStatus,
  ]); // as ForceWithdrawProps<any, any>;
  return {
    deFiWrapProps: deFiWrapProps as unknown as DeFiWrapProps<T, I, ACD>,
    confirmShow,
    setConfirmShow,
  };
};
