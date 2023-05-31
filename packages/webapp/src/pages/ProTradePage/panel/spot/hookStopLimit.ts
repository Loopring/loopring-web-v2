import React from "react";
import {
  BIGO,
  getPriceImpactInfo,
  LoopringAPI,
  PriceLevel,
  store,
  useAccount,
  usePageTradePro,
  usePlaceOrder,
  useSubmitBtn,
  useSystem,
  useTicker,
  useToast,
  useTokenMap,
  useTokenPrices,
  walletLayer2Service,
} from "@loopring-web/core";
import {
  AccountStatus,
  getValuePrecisionThousand,
  IBData,
  MarketType,
  myLog,
  TradeBtnStatus,
  TradeBaseType,
  TradeProType,
} from "@loopring-web/common-resources";
import {
  StopLimitTradeData,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import * as sdk from "@loopring-web/loopring-sdk";
import * as _ from "lodash";

export const useStopLimit = <
  C extends { [key: string]: any },
  T extends StopLimitTradeData<I>,
  I extends IBData<any>
>({
  market,
  setConfirmed,
}: { market: MarketType } & any) => {
  const { pageTradePro, updatePageTradePro, __SUBMIT_LOCK_TIMER__ } =
    usePageTradePro();
  const { marketMap, tokenMap } = useTokenMap();
  const { tokenPrices } = useTokenPrices();
  const { forexMap, allowTrade } = useSystem();
  const { account } = useAccount();
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const { tickerMap } = useTicker();
  const {
    toggle: { StopLimit },
  } = useToggle();
  const { currency, isMobile } = useSettings();

  const { t } = useTranslation("common");

  const [alertOpen, setAlertOpen] = React.useState<boolean>(false);

  // @ts-ignore
  const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
  const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {};
  const marketPrecision = marketMap[market].precisionForPrice;
  const tradePrice =
    pageTradePro.market === market && pageTradePro.ticker
      ? pageTradePro.ticker.close
        ? pageTradePro.ticker.close.toFixed(marketPrecision)
        : pageTradePro?.depth?.mid_price.toFixed(marketPrecision)
      : 0;
  let balance =
    tradePrice &&
    tokenPrices &&
    forexMap &&
    Number(tradePrice) *
      tokenPrices[quoteSymbol as string] *
      (forexMap[currency] ?? 0);

  const [stopLimitTradeData, setStopLimitTradeData] = React.useState<T>({
    base: {
      belong: baseSymbol,
      balance: walletMap ? walletMap[baseSymbol as string]?.count : 0,
    } as I,
    quote: {
      belong: quoteSymbol,
      balance: walletMap ? walletMap[quoteSymbol as string]?.count : 0,
    } as I,
    price: {
      belong: pageTradePro.tradeCalcProData.coinQuote,
      tradeValue: undefined,
      balance,
    } as I,
    stopPrice: {
      belong: pageTradePro.tradeCalcProData.coinQuote,
      tradeValue: undefined,
      balance,
    } as I,
    type: pageTradePro.tradeType ?? TradeProType.buy,
  } as T);
  const [isLimitLoading, setIsLimitLoading] = React.useState(false);

  const { toastOpen, setToastOpen, closeToast } = useToast();

  React.useEffect(() => {
    resetTradeData();
  }, [pageTradePro.tradeCalcProData.walletMap, pageTradePro.market, currency]);
  React.useEffect(() => {
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
    if (
      pageTradePro?.depth?.symbol === pageTradePro.market &&
      pageTradePro?.ticker?.close
    ) {
      const midStopPrice = pageTradePro.ticker.close;
      const [, , _quoteSymbol] = market.match(/(\w+)-(\w+)/i);
      const quoteTokenInfo = tokenMap[_quoteSymbol];

      updatePageTradePro({
        ...pageTradePro,
        tradeCalcProData: {
          ...pageTradePro.tradeCalcProData,
          stopRange: [
            getValuePrecisionThousand(
              sdk.toBig(midStopPrice).div(10).toString(),
              quoteTokenInfo.precision,
              quoteTokenInfo.precision,
              undefined,
              false
            ),
            getValuePrecisionThousand(
              sdk.toBig(midStopPrice).times(10).toString(),
              quoteTokenInfo.precision,
              quoteTokenInfo.precision,
              undefined,
              false
            ),
          ],
        },
      });
    } else {
      setToastOpen({
        open: true,
        type: ToastType.error,
        content: t("labelLimitMarket"),
      });
    }
  }, [pageTradePro?.ticker?.close]);

  const resetTradeData = React.useCallback(
    (type?: TradeProType) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
      const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {};
      // @ts-ignore
      const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
      setStopLimitTradeData((state) => {
        return {
          ...state,
          type: type ?? pageTradePro.tradeType,
          base: {
            belong: baseSymbol,
            balance: walletMap ? walletMap[baseSymbol as string]?.count : 0,
          } as IBData<any>,
          quote: {
            belong: quoteSymbol,
            balance: walletMap ? walletMap[quoteSymbol as string]?.count : 0,
          } as IBData<any>,
          price: {
            belong: quoteSymbol,
            tradeValue: undefined,
            balance: 0,
          } as IBData<any>,
          stopPrice: {
            belong: quoteSymbol,
            tradeValue: undefined,
            balance: 0,
          } as IBData<any>,
        };
      });
      updatePageTradePro({
        market,
        tradeType: type ?? pageTradePro.tradeType,
        minOrderInfo: null,
        sellUserOrderInfo: null,
        buyUserOrderInfo: null,
        request: null,
        calcTradeParams: null,
        stopLimitCalcTradeParams: null,
        chooseDepth: null,
        tradeCalcProData: {
          ...pageTradePro.tradeCalcProData,
          // walletMap:walletMap as any,
          fee: undefined,
          minimumReceived: undefined,
          priceImpact: undefined,
          priceImpactColor: "inherit",
        },
      });
    },
    [market, marketPrecision, tokenPrices, forexMap, currency]
  );

  const limitSubmit = React.useCallback(
    async (event: MouseEvent, isAgree?: boolean) => {
      myLog("limitSubmit:", event, isAgree);

      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
      const { limitCalcTradeParams, request, tradeCalcProData } = pageTradePro;

      setAlertOpen(false);

      if (isAgree && LoopringAPI.userAPI && request) {
        try {
          myLog("try to submit order", limitCalcTradeParams, tradeCalcProData);

          const account = store.getState().account;

          const req: sdk.GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: request.sellToken.tokenId as number,
          };

          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            req,
            account.apiKey
          );

          const requestClone = _.cloneDeep(request);
          requestClone.storageId = storageId.orderId;

          myLog(requestClone);

          const response: { hash: string } | any =
            await LoopringAPI.userAPI.submitStopOrder(
              requestClone as any,
              account.eddsaKey.sk,
              account.apiKey
            );

          myLog(response);
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            setToastOpen({
              open: true,
              type: ToastType.error,
              content: t("labelLimitFailed") + " : " + response.message,
            });
          } else {
            await sdk.sleep(__SUBMIT_LOCK_TIMER__);

            const resp = await LoopringAPI.userAPI.getOrderDetails(
              {
                accountId: account.accountId,
                orderHash: response?.hash,
              },
              account.apiKey
            );

            myLog("-----> resp:", resp);

            if (resp.orderDetail?.status !== undefined) {
              myLog("resp.orderDetail:", resp.orderDetail);
              switch (resp.orderDetail?.status) {
                case sdk.OrderStatus.cancelled:
                  const baseAmount = sdk.toBig(
                    resp.orderDetail.volumes.baseAmount
                  );
                  const baseFilled = sdk.toBig(
                    resp.orderDetail.volumes.baseFilled
                  );
                  const quoteAmount = sdk.toBig(
                    resp.orderDetail.volumes.quoteAmount
                  );
                  const quoteFilled = sdk.toBig(
                    resp.orderDetail.volumes.quoteFilled
                  );
                  const percentage1 = baseAmount.eq(BIGO)
                    ? 0
                    : baseFilled.div(baseAmount).toNumber();
                  const percentage2 = quoteAmount.eq(BIGO)
                    ? 0
                    : quoteFilled.div(quoteAmount).toNumber();
                  myLog(
                    "percentage1:",
                    percentage1,
                    " percentage2:",
                    percentage2
                  );
                  if (percentage1 === 0 || percentage2 === 0) {
                    setToastOpen({
                      open: true,
                      type: ToastType.warning,
                      content: t("labelSwapCancelled"),
                    });
                  } else {
                    setToastOpen({
                      open: true,
                      type: ToastType.success,
                      content: t("labelSwapSuccess"),
                    });
                  }
                  break;
                case sdk.OrderStatus.processed:
                  setToastOpen({
                    open: true,
                    type: ToastType.success,
                    content: t("labelSwapSuccess"),
                  });
                  break;
                case sdk.OrderStatus.processing:
                  setToastOpen({
                    open: true,
                    type: ToastType.success,
                    content: t("labelOrderProcessing"),
                  });
                  break;
                default:
                  setToastOpen({
                    open: true,
                    type: ToastType.error,
                    content: t("labelLimitFailed"),
                  });
              }
            }
            resetTradeData(pageTradePro.tradeType);
            walletLayer2Service.sendUserUpdate();
          }

          setIsLimitLoading(false);
        } catch (reason: any) {
          sdk.dumpError400(reason);
          setToastOpen({
            open: true,
            type: ToastType.error,
            content: t("labelLimitFailed"),
          });
        }
        setIsLimitLoading(false);
      } else {
        setIsLimitLoading(false);
      }
    },
    [__SUBMIT_LOCK_TIMER__, resetTradeData, setToastOpen, t]
  );

  const { makeStopLimitReqInHook } = usePlaceOrder();
  const onChangeLimitEvent = React.useCallback(
    (tradeData: T, formType: TradeBaseType) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;

      if (formType === TradeBaseType.tab) {
        resetTradeData(tradeData.type);
      } else {
        let amountBase =
          formType === TradeBaseType.base
            ? tradeData.base.tradeValue
            : undefined;
        let amountQuote =
          formType === TradeBaseType.quote
            ? tradeData.quote.tradeValue
            : undefined;

        if (
          formType === TradeBaseType.price ||
          formType === TradeBaseType.stopPrice
        ) {
          amountBase =
            tradeData.base.tradeValue !== undefined
              ? tradeData.base.tradeValue
              : undefined;
          amountQuote =
            amountBase !== undefined
              ? undefined
              : tradeData.quote.tradeValue !== undefined
              ? tradeData.quote.tradeValue
              : undefined;
        }

        const {
          stopLimitRequest,
          calcTradeParams,
          sellUserOrderInfo,
          buyUserOrderInfo,
          minOrderInfo,
        } = makeStopLimitReqInHook({
          isBuy: tradeData.type === "buy",
          base: tradeData.base.belong,
          quote: tradeData.quote.belong,
          stopLimitPrice: tradeData.stopPrice.tradeValue as number,
          price: tradeData.price.tradeValue as number,
          depth: pageTradePro.depthForCalc,
          amountBase,
          amountQuote,
        });

        updatePageTradePro({
          market,
          sellUserOrderInfo,
          buyUserOrderInfo,
          minOrderInfo,
          request: stopLimitRequest as sdk.SubmitOrderRequestV3,
          stopLimitCalcTradeParams: {
            ...calcTradeParams,
            stopPrice: tradeData?.stopPrice?.tradeValue?.toString(),
          },
          tradeCalcProData: {
            ...pageTradePro.tradeCalcProData,
            fee:
              calcTradeParams && calcTradeParams.maxFeeBips
                ? calcTradeParams.maxFeeBips?.toString()
                : undefined,
          },
        });
        myLog(
          "stopLimit",
          calcTradeParams?.baseVolShow as number,
          calcTradeParams?.quoteVolShow as number
        );
        setStopLimitTradeData((state) => {
          const tradePrice = tradeData.price.tradeValue;
          let balance =
            tradePrice &&
            tokenPrices &&
            forexMap &&
            sdk
              .toBig(tradePrice)
              .times(tokenPrices[quoteSymbol as string])
              .times(forexMap[currency] ?? 0)
              .toFixed(2);
          const stopPrice = tradeData.stopPrice.tradeValue;
          const stopPriceBalance =
            stopPrice &&
            tokenPrices &&
            forexMap &&
            sdk
              .toBig(stopPrice)
              .times(tokenPrices[quoteSymbol as string])
              .times(forexMap[currency] ?? 0)
              .toFixed(2);

          return {
            ...state,
            price: {
              belong: quoteSymbol,
              tradeValue: tradePrice,
              balance,
            } as IBData<any>,
            stopPrice: {
              belong: quoteSymbol,
              tradeValue: stopPrice,
              balance: stopPriceBalance,
            } as IBData<any>,
            base: {
              ...state.base,
              tradeValue:
                calcTradeParams?.baseVolShow == Infinity
                  ? undefined
                  : (calcTradeParams?.baseVolShow as number),
            },
            quote: {
              ...state.quote,
              tradeValue:
                calcTradeParams?.quoteVolShow == Infinity
                  ? undefined
                  : (calcTradeParams?.quoteVolShow as number),
            },
          };
        });
      }
    },
    [
      resetTradeData,
      makeStopLimitReqInHook,
      market,
      tokenPrices,
      quoteSymbol,
      forexMap,
      currency,
    ]
  );
  const handlePriceError = React.useCallback(
    (
      data: IBData<any>
    ): { error: boolean; message?: string | JSX.Element } | undefined => {
      const tradeValue = data.tradeValue;
      if (tradeValue) {
        const [, precision] = tradeValue.toString().split(".");
        if (
          precision &&
          precision.length > marketMap[market].precisionForPrice
        ) {
          return {
            error: true,
            message: t("labelErrorPricePrecisionLimit", {
              symbol: data.belong,
              decimal: marketMap[market].precisionForPrice,
            }),
          };
        }
        return undefined;
      } else {
        return undefined;
      }
    },
    [market, marketMap, t]
  );

  const onSubmitBtnClick = React.useCallback(async () => {
    setIsLimitLoading(true);
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
    const { priceLevel } = getPriceImpactInfo(
      pageTradePro.limitCalcTradeParams,
      account.readyState,
      false
    );
    if (!allowTrade?.order?.enable) {
      setShowSupport({ isShow: true });
      setIsLimitLoading(false);
    } else if (!StopLimit.enable) {
      setShowTradeIsFrozen({ isShow: true, type: "StopLimit" });
      setIsLimitLoading(false);
    } else {
      switch (priceLevel) {
        case PriceLevel.Lv1:
          setAlertOpen(true);
          break;
        default:
          setConfirmed(true);
          break;
      }
    }
  }, [
    account.readyState,
    allowTrade.order.enable,
    limitSubmit,
    StopLimit.enable,
    setShowSupport,
    setShowTradeIsFrozen,
  ]);
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string;
  } => {
    const account = store.getState().account;
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
    const {
      minOrderInfo,
      tradeCalcProData: { stopRange },
      market,
      // calcTradeParams,
    } = pageTradePro;
    if (account.readyState === AccountStatus.ACTIVATED) {
      // const type = limitTradeData.type === TradeProType.sell ? 'quote' : 'base';
      if (
        stopLimitTradeData?.base.tradeValue === undefined ||
        stopLimitTradeData?.quote.tradeValue === undefined ||
        stopLimitTradeData?.base.tradeValue === 0 ||
        stopLimitTradeData?.quote.tradeValue === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelEnterAmount",
        };
      } else if (!tickerMap[market].close) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: "labelStopLimitCurrentlyInsufficient",
        };
      } else if (!minOrderInfo?.minAmtCheck) {
        let minOrderSize = "Error";
        if (minOrderInfo?.symbol) {
          const basePrecision = tokenMap[minOrderInfo.symbol].precision;
          const showValue = getValuePrecisionThousand(
            minOrderInfo?.minAmtShow,
            undefined,
            undefined,
            basePrecision,
            true,
            { isAbbreviate: true }
          );
          minOrderSize = `${showValue} ${minOrderInfo?.symbol}`;
        }
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelLimitMin| ${minOrderSize}`,
        };
      } else if (
        sdk
          .toBig(
            stopLimitTradeData[
              stopLimitTradeData.type === TradeProType.buy ? "quote" : "base"
            ]?.tradeValue ?? ""
          )
          .gt(
            stopLimitTradeData[
              stopLimitTradeData.type === TradeProType.buy ? "quote" : "base"
            ].balance
          )
      ) {
        return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: "" };
      } else {
        if (
          // @ts-ignore
          sdk
            .toBig(stopLimitTradeData[TradeBaseType.stopPrice]?.tradeValue ?? 0)
            .lte(0)
        ) {
          return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: "" };
        } else if (
          stopRange &&
          stopRange[0] &&
          stopRange[1] &&
          (sdk
            // @ts-ignore
            .toBig(stopLimitTradeData[TradeBaseType.stopPrice]?.tradeValue ?? 0)
            .lt(stopRange[0]) ||
            sdk
              // @ts-ignore
              .toBig(
                stopLimitTradeData[TradeBaseType.stopPrice]?.tradeValue ?? 0
              )
              .gt(stopRange[1]))
        ) {
          return {
            tradeBtnStatus: TradeBtnStatus.DISABLED,
            label: `labelLimitStopPriceMinMax| ${stopRange[0]}-${stopRange[1]}`,
          };
        } else {
          return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" }; // label: ''}
        }
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: "" };
  }, [stopLimitTradeData, tokenMap, tickerMap]);

  const {
    btnStatus: tradeLimitBtnStatus,
    onBtnClick: limitBtnClick,
    btnLabel: tradeLimitI18nKey,
    btnStyle: tradeLimitBtnStyle,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: isLimitLoading,
    submitCallback: onSubmitBtnClick,
  });
  return {
    toastOpen,
    setToastOpen,
    closeToast,
    limitAlertOpen: alertOpen,
    resetLimitData: resetTradeData,
    isLimitLoading: false,
    stopLimitTradeData,
    onChangeLimitEvent,
    tradeLimitI18nKey,
    tradeLimitBtnStatus,
    confirmStopLimit: {
      baseSymbol,
      quoteSymbol,
      tradeType: pageTradePro.tradeType,
      limitPrice: stopLimitTradeData?.price?.tradeValue,
      stopPrice: stopLimitTradeData?.stopPrice.tradeValue,
      baseValue: stopLimitTradeData?.base?.tradeValue,
      quoteValue: stopLimitTradeData?.quote?.tradeValue,
      onSubmit: (e: any) => {
        limitSubmit(e as any, true);
      },
    },
    limitSubmit,
    limitBtnClick,
    handlePriceError,
    tradeLimitBtnStyle: {
      ...tradeLimitBtnStyle,
      ...{
        fontSize: isMobile
          ? tradeLimitI18nKey !== ""
            ? "1.2rem"
            : "1.4rem"
          : "1.6rem",
      },
    },

    // marketTicker,
  };
};
