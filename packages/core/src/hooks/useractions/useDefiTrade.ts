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
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
} from "@loopring-web/common-resources";

import {
  useSubmitBtn,
  makeWalletLayer2,
  useWalletLayer2Socket,
  useWalletLayer2,
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

  const { tokenMap, coinMap } = useTokenMap();
  const { account } = useAccount();
  const { walletLayer2, status: walletLayer2Status } = useWalletLayer2();
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

  const walletLayer2Callback = React.useCallback(async () => {}, []);

  useWalletLayer2Socket({ walletLayer2Callback });

  const handleOnchange = React.useCallback(
    ({ tradeData, type }: { type: DeFiChgType; tradeData: T }) => {
      const marketInfo = defiMarketMap[market];
      let _deFiCalcData: DeFiCalcData<T> | undefined =
        tradeDefi.deFiCalcData as DeFiCalcData<T>;
      let calcValue;
      if (
        tradeData &&
        tradeDefi.defiBalances &&
        coinBuySymbol &&
        tradeDefi?.defiBalances[coinBuySymbol]
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
          tradeDefi?.defiBalances[coinBuySymbol] ?? "";
        calcValue = sdk.calcDefi({
          isJoin,
          isInputSell: type === DeFiChgType.coinSell ? true : false,
          ...inputValue,
          feeVol: tradeDefi.feeRaw,
          marketInfo,
          tokenSell: tokenMap[coinSellSymbol],
          tokenBuy: tokenMap[coinBuySymbol],
          buyTokenBalanceVol,
        });

        const sellAmount = getValuePrecisionThousand(
          sdk
            .toBig(calcValue?.sellVol ?? 0)
            .div("1e" + tokenMap[coinSellSymbol]?.decimals),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: false }
        );
        const buyAmount = getValuePrecisionThousand(
          sdk
            .toBig(calcValue?.buyVol ?? 0)
            .div("1e" + tokenMap[coinBuySymbol]?.decimals),
          tokenMap[coinBuySymbol].precision,
          tokenMap[coinBuySymbol].precision,
          tokenMap[coinBuySymbol].precision,
          true,
          { floor: false }
        );
        myLog("calcValue", calcValue);

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
        // ...tradeDefi,
        ...calcValue,
        deFiCalcData: {
          ..._deFiCalcData,
        },
      });
    },
    [
      defiMarketMap,
      market,
      tradeDefi,
      coinBuySymbol,
      updateTradeDefi,
      isJoin,
      tokenMap,
      coinSellSymbol,
    ]
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
        tradeDefi?.feeRaw === undefined
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
    async (clearTrade: boolean = true, feeInfo: any) => {
      let walletMap: any = {};
      const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i) ?? [];
      const marketInfo = defiMarketMap[market];
      let deFiCalcDataInit: Partial<DeFiCalcData<any>> = {
        coinSell: {},
        coinBuy: {},
        ...tradeDefi.deFiCalcData,
      };
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
      deFiCalcDataInit.coinSell = {
        ...deFiCalcDataInit.coinSell,
        tradeValue: clearTrade
          ? undefined
          : deFiCalcDataInit.coinSell.tradeValue,
      };
      deFiCalcDataInit.coinBuy = {
        ...deFiCalcDataInit.coinBuy,
        tradeValue: clearTrade
          ? undefined
          : deFiCalcDataInit.coinBuy.tradeValue,
      };

      const [AtoB, BtoA] = marketInfo
        ? isJoin
          ? [marketInfo.depositPrice, marketInfo.withdrawPrice]
          : [marketInfo.withdrawPrice, marketInfo.depositPrice]
        : ["0", "0"];
      myLog();
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
    },
    [
      account.readyState,
      coinBuySymbol,
      coinMap,
      coinSellSymbol,
      defiMarketMap,
      isJoin,
      isStoB,
      market,
      tradeDefi?.deFiCalcData,
      updateTradeDefi,
    ]
  );

  const sendRequest = React.useCallback(async () => {
    try {
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeDefi.sellToken.symbol &&
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
          maxFeeBips: Math.ceil(
            sdk
              .toBig(tradeDefi.fee)
              .times(10000)
              .div(tradeDefi.buyVol)
              .toNumber()
          ),
          fillAmountBOrS: 0,
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
            content: t("labelInvestSuccess"),
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
      setIsLoading(false);
      should15sRefresh(true);
      // resetDefault(true);
      walletLayer2Service.sendUserUpdate();
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    resetDefault,
    setToastOpen,
    t,
    tokenMap,
    tradeDefi,
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
    setIsLoading(true);
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
  const should15sRefresh = _.debounce(async (clearTrade: boolean = false) => {
    // myLog('should15sRefresh', market);
    let _feeInfo;
    if (market && LoopringAPI.defiAPI) {
      // updateDepth()
      // getDefiMap();
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
      resetDefault(clearTrade, _feeInfo);
    }
  }, globalSetup.wait);
  React.useEffect(() => {
    if (
      market &&
      market !== "" &&
      walletLayer2Status === SagaStatus.UNSET &&
      isJoin !== undefined
    ) {
      should15sRefresh.cancel();
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
      }
      // else{
      //   should15sRefresh(true);
      // }

      //
    }
    return () => {
      return should15sRefresh.cancel();
    };
  }, [
    market,
    isJoin,
    match?.param?.defi,
    walletLayer2Status,
    walletLayer2,
    account.readyState,
  ]);
  // React.useEffect(() => {
  //   if (market) {
  //     //@ts-ignore
  //     if (refreshRef.current) {
  //       // @ts-ignore
  //
  //     }
  //     if (
  //       (tradeData && tradeData.sell.belong == undefined) ||
  //       tradeData === undefined
  //     ) {
  //       resetSwap(undefined, undefined);
  //     }
  //   }
  // }, [market]);

  const deFiWrapProps = React.useMemo(() => {
    return {
      isStoB,
      refreshRef,
      onConfirm: sendRequest,
      disabled: false,
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
    market,
    isJoin,
    sendRequest,
    refreshRef,
    tradeMarketI18nKey,
    isLoading,
    should15sRefresh,
    onBtnClick,
    handleOnchange,
    tradeDefi.deFiCalcData,
    tokenMap,
    coinSellSymbol,
    coinBuySymbol,
    btnStatus,
    account.readyState,
  ]); // as ForceWithdrawProps<any, any>;
  return {
    deFiWrapProps: deFiWrapProps as unknown as DeFiWrapProps<T, I, ACD>,
    confirmShow,
    setConfirmShow,
  };
};
