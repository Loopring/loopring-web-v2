import * as sdk from "@loopring-web/loopring-sdk";
import React from "react";
import {
  usePairMatch,
  useSocket,
  useAccount,
  useAmount,
  useTokenMap,
  useWalletLayer2,
  useSystem,
  usePageTradeLite,
  useTicker,
  store,
  useAmmMap,
  useWalletLayer2Socket,
  walletLayer2Service,
  accountStaticCallBack,
  btnClickMap,
  btnLabel,
  makeWalletLayer2,
  useToast,
  LoopringAPI,
  getTimestampDaysLater,
  DefaultFeeBips,
  getPriceImpactInfo,
  PriceLevel,
  BIGO,
  MAPFEEBIPS,
  MarketCalcParams,
  calcPriceByAmmTickMapDepth,
  Limit,
  marketInitCheck,
  reCalcStoB,
  swapDependAsync,
} from "@loopring-web/core";

import {
  AccountStatus,
  CoinMap,
  defalutSlipage,
  EmptyValueTag,
  fnType,
  getShowStr,
  getValuePrecisionThousand,
  IBData,
  MarketType,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  TradeCalcData,
  TradeFloat,
  WalletMap,
  myLog,
} from "@loopring-web/common-resources";
import {
  RawDataTradeItem,
  SwapData,
  SwapTradeData,
  SwapType,
  TradeBtnStatus,
  useOpenModals,
  useSettings,
  useToggle,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import * as _ from "lodash";
import BigNumber from "bignumber.js";

const useSwapSocket = () => {
  const { sendSocketTopic, socketEnd } = useSocket();
  const { account } = useAccount();
  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      sendSocketTopic({ [sdk.WsTopicType.account]: true });
    } else {
      socketEnd();
    }
    return () => {
      socketEnd();
    };
  }, [account.readyState]);
};

export const useSwap = <C extends { [key: string]: any }>({
  path,
}: {
  path: string;
}) => {
  //High: No not Move!!!!!!
  const { realPair, realMarket } = usePairMatch(path);
  /** get store value **/
  const { amountMap, getAmount, status: amountStatus } = useAmount();
  const { isMobile } = useSettings();
  const { account, status: accountStatus } = useAccount();
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { coinMap, tokenMap, marketArray, marketCoins, marketMap } =
    useTokenMap();
  // const [] = React.useState(MAPFEEBIPS)
  const { tickerMap } = useTicker();
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const { ammMap } = useAmmMap();
  const { exchangeInfo, allowTrade } = useSystem();
  const {
    toggle: { order },
  } = useToggle();
  const {
    pageTradeLite,
    updatePageTradeLite,
    __SUBMIT_LOCK_TIMER__,
    __TOAST_AUTO_CLOSE_TIMER__,
    __DAYS__,
  } = usePageTradeLite();
  const { status: walletLayer2Status } = useWalletLayer2();
  /*** api prepare ***/
  const { t } = useTranslation(["common", "error"]);
  const history = useHistory();
  const refreshRef = React.createRef();
  const [pair, setPair] = React.useState(realPair);
  const [market, setMarket] = React.useState<MarketType>(
    realMarket as MarketType
  );
  const [swapBtnI18nKey, setSwapBtnI18nKey] =
    React.useState<string | undefined>(undefined);
  const [swapBtnStatus, setSwapBtnStatus] = React.useState(
    TradeBtnStatus.AVAILABLE
  );
  const [isSwapLoading, setIsSwapLoading] = React.useState(false);
  const [sellMinAmt, setSellMinAmt] = React.useState<string>();
  const [tradeData, setTradeData] =
    React.useState<SwapTradeData<IBData<C>> | undefined>(undefined);
  const [tradeCalcData, setTradeCalcData] = React.useState<
    Partial<TradeCalcData<C>>
  >({
    coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
      return { ...prev, [item]: coinMap ? coinMap[item] : {} };
    }, {} as CoinMap<C>),
  });
  const [storageId, setStorageId] = React.useState<{
    orderId: number;
    offchainId: number;
  }>({} as any);

  // const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);
  // const [myTradeArray, setMyTradeArray] = React.useState<{
  //   data: RawDataTradeItem[];
  //   total: number;
  //   page: number;
  // }>({
  //   data: [],
  //   total: 0,
  //   page: -1,
  // });
  // const [tradeFloat, setTradeFloat] =
  //   React.useState<TradeFloat | undefined>(undefined);

  const [alertOpen, setAlertOpen] = React.useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);

  const clearData = (
    calcTradeParams: Partial<MarketCalcParams> | null | undefined
  ) => {
    setTradeData((state) => {
      return {
        ...state,
        sell: { ...state?.sell, tradeValue: 0 },
        buy: { ...state?.buy, tradeValue: 0 },
      } as SwapTradeData<IBData<C>>;
    });
    setTradeCalcData((state) => {
      return {
        ...state,
        minimumReceived: undefined,
        priceImpact: undefined,
        fee: undefined,
      };
    });
    updatePageTradeLite({
      market,
      maxFeeBips: MAPFEEBIPS,
      calcTradeParams: {
        ...calcTradeParams,
        // takerRate: undefined,
        // feeBips: undefined,
        output: undefined,
        sellAmt: undefined,
        buyAmt: undefined,
        amountS: undefined,
        amountBOut: undefined,
        amountBOutWithoutFee: undefined,
        amountBOutSlip: undefined,
        priceImpact: undefined,
      },
    });
  };
  /*** Btn related function ***/
  const swapFunc = React.useCallback(
    async (event: MouseEvent, isAgree?: boolean) => {
      let { calcTradeParams, tradeChannel, orderType, maxFeeBips } =
        pageTradeLite;
      setAlertOpen(false);
      setConfirmOpen(false);

      if (isAgree) {
        if (
          !LoopringAPI.userAPI ||
          !tokenMap ||
          !exchangeInfo ||
          !calcTradeParams ||
          account.readyState !== AccountStatus.ACTIVATED
        ) {
          setToastOpen({
            open: true,
            type: "error",
            content: t("labelSwapFailed"),
          });
          setIsSwapLoading(false);

          return;
        }

        const sell = tradeData?.sell.belong as string;
        const buy = tradeData?.buy.belong as string;

        const sellToken = tokenMap[sell];
        const buyToken = tokenMap[buy];

        try {
          const request: sdk.SubmitOrderRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            accountId: account.accountId,
            storageId: storageId.orderId,
            sellToken: {
              tokenId: sellToken.tokenId,
              volume: calcTradeParams.amountS as string,
            },
            buyToken: {
              tokenId: buyToken.tokenId,
              volume: calcTradeParams.amountBOutSlip?.minReceived as string,
            },
            allOrNone: false,
            validUntil: getTimestampDaysLater(__DAYS__),
            // maxFeeBips: parseInt(totalFee as string),
            maxFeeBips: maxFeeBips ?? MAPFEEBIPS,
            fillAmountBOrS: false, // amm only false
            orderType,
            tradeChannel,
            eddsaSignature: "",
          };

          myLog("submitOrder request", request);

          const response: { hash: string } | any =
            await LoopringAPI.userAPI.submitOrder(
              request,
              account.eddsaKey.sk,
              account.apiKey
            );

          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            const errorItem =
              SDK_ERROR_MAP_TO_UI[
                (response as sdk.RESULT_INFO)?.code ?? 700001
              ];
            if ((response as sdk.RESULT_INFO).code === 114002) {
              getAmount({ market });
              clearData(calcTradeParams);
            }
            setToastOpen({
              open: true,
              type: "error",
              content:
                t("labelSwapFailed") +
                " error: " +
                (errorItem
                  ? t(errorItem.messageKey, { ns: "error" })
                  : (response as sdk.RESULT_INFO).message),
            });
          } else {
            getStorageId();
            await sdk.sleep(__TOAST_AUTO_CLOSE_TIMER__);
            const resp = await LoopringAPI.userAPI.getOrderDetails(
              {
                accountId: account.accountId,
                orderHash: response.hash,
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
                      type: "warning",
                      content: t("labelSwapCancelled"),
                    });
                  } else {
                    setToastOpen({
                      open: true,
                      type: "success",
                      content: t("labelSwapSuccess"),
                    });
                  }
                  break;
                case sdk.OrderStatus.processed:
                  setToastOpen({
                    open: true,
                    type: "success",
                    content: t("labelSwapSuccess"),
                  });
                  break;
                default:
                  setToastOpen({
                    open: true,
                    type: "error",
                    content: t("labelSwapFailed"),
                  });
              }
            }
            walletLayer2Service.sendUserUpdate();
            clearData(calcTradeParams);
          }
        } catch (reason: any) {
          sdk.dumpError400(reason);
          setToastOpen({
            open: true,
            type: "error",
            content: t("labelSwapFailed"),
          });
        }

        // setOutput(undefined)

        await sdk.sleep(__SUBMIT_LOCK_TIMER__);

        setIsSwapLoading(false);
      } else {
        setIsSwapLoading(false);
      }
    },
    [
      pageTradeLite,
      tokenMap,
      exchangeInfo,
      account.readyState,
      account.accountId,
      account.apiKey,
      account.eddsaKey.sk,
      tradeData?.sell?.belong,
      tradeData?.buy?.belong,
      __SUBMIT_LOCK_TIMER__,
      setToastOpen,
      t,
      __DAYS__,
      getAmount,
      market,
      __TOAST_AUTO_CLOSE_TIMER__,
      updatePageTradeLite,
    ]
  );

  const btnLabelAccountActive = React.useCallback((): string | undefined => {
    if (!tokenMap) {
      setSwapBtnStatus(TradeBtnStatus.DISABLED);
      return;
    }

    const sellToken = tokenMap[tradeData?.sell.belong as string];
    const buyToken = tokenMap[tradeData?.buy.belong as string];

    const { calcTradeParams } = pageTradeLite;

    if (!sellToken || !buyToken || !calcTradeParams) {
      setSwapBtnStatus(TradeBtnStatus.DISABLED);
      return;
    }

    let validAmt = !!(
      calcTradeParams?.amountS &&
      sellMinAmt &&
      sdk.toBig(calcTradeParams?.amountS).gte(sdk.toBig(sellMinAmt))
    );

    const sellExceed = sdk
      .toBig(sellToken?.orderAmounts?.maximum)
      .lt(calcTradeParams.amountS ?? 0);

    const buyExceed = sdk
      .toBig(buyToken?.orderAmounts?.maximum)
      .lt(calcTradeParams?.amountBOutSlip?.minReceived ?? 0);

    if (sellExceed || buyExceed) {
      validAmt = false;
    }

    const sellMaxVal = sdk
      .toBig(sellToken?.orderAmounts?.maximum)
      .div("1e" + sellToken.decimals);
    const buyMaxVal = sdk
      .toBig(buyToken?.orderAmounts?.maximum)
      .div("1e" + buyToken.decimals);

    if (isSwapLoading) {
      setSwapBtnStatus(TradeBtnStatus.LOADING);
      return undefined;
    } else {
      if (account.readyState === AccountStatus.ACTIVATED) {
        if (
          !calcTradeParams ||
          !calcTradeParams.sellAmt ||
          !calcTradeParams.buyAmt
        ) {
          myLog(
            "calcTradeParams.baseAmt:",
            calcTradeParams.sellAmt,
            " calcTradeParams.quoteAmt:",
            calcTradeParams.buyAmt
          );
          setSwapBtnStatus(TradeBtnStatus.DISABLED);
          return "labelEnterAmount";
        } else if (sellExceed) {
          const maxOrderSize = sellMaxVal + " " + tradeData?.sell.belong;
          // myLog('sell maxOrderSize:', maxOrderSize)
          setSwapBtnStatus(TradeBtnStatus.DISABLED);
          return `labelLimitMax| ${maxOrderSize}`;
        } else if (buyExceed) {
          const maxOrderSize = buyMaxVal + " " + tradeData?.buy.belong;
          // myLog('buy maxOrderSize:', maxOrderSize)
          setSwapBtnStatus(TradeBtnStatus.DISABLED);
          return `labelLimitMax| ${maxOrderSize}`;
        } else if (!validAmt) {
          //!validAmt) {
          const sellSymbol = tradeData?.sell.belong;
          setSwapBtnStatus(TradeBtnStatus.DISABLED);
          if (sellMinAmt === undefined || !sellSymbol) {
            return ``;
          } else {
            const sellToken = tokenMap[sellSymbol];
            // //VolToNumberWithPrecision(sellMinAmt ?? '', sellSymbol as any)
            const minOrderSize = getValuePrecisionThousand(
              sdk.toBig(sellMinAmt ?? 0).div("1e" + sellToken.decimals),
              sellToken.precision,
              sellToken.precision,
              sellToken.precision,
              false,
              { floor: false, isAbbreviate: true }
            );
            if (isNaN(Number(minOrderSize))) {
              return `labelLimitMin| ${EmptyValueTag + " " + sellSymbol}`;
            } else {
              return `labelLimitMin| ${minOrderSize + " " + sellSymbol}`;
            }
          }
        } else {
          setSwapBtnStatus(TradeBtnStatus.AVAILABLE);
          return undefined;
        }
      } else {
        setSwapBtnStatus(TradeBtnStatus.AVAILABLE);
      }
    }
  }, [
    tokenMap,
    tradeData?.sell.belong,
    tradeData?.buy.belong,
    pageTradeLite,
    sellMinAmt,
    isSwapLoading,
    account.readyState,
  ]);

  const _btnLabel = Object.assign(_.cloneDeep(btnLabel), {
    [fnType.ACTIVATED]: [btnLabelAccountActive],
  });
  const swapCalculatorCallback = React.useCallback(async () => {
    const { priceLevel } = getPriceImpactInfo(pageTradeLite.calcTradeParams);
    setIsSwapLoading(true);

    myLog("---- swapCalculatorCallback priceLevel:", priceLevel);
    if (!allowTrade.order.enable) {
      setShowSupport({ isShow: true });
      setIsSwapLoading(false);
    } else if (!order.enable) {
      setShowTradeIsFrozen({ isShow: true, type: "Swap" });
      setIsSwapLoading(false);
    } else {
      // {}
      switch (priceLevel) {
        case PriceLevel.Lv1:
          setAlertOpen(true);
          break;
        case PriceLevel.Lv2:
          setConfirmOpen(true);
          break;
        default:
          swapFunc(undefined as any, true);
          break;
      }
    }
  }, [
    pageTradeLite.calcTradeParams,
    allowTrade?.order.enable,
    order.enable,
    setShowSupport,
    setShowTradeIsFrozen,
    swapFunc,
  ]);
  const swapBtnClickArray = Object.assign(_.cloneDeep(btnClickMap), {
    [fnType.ACTIVATED]: [swapCalculatorCallback],
  });
  const onSwapClick = React.useCallback(
    ({ sell, buy, slippage, ...rest }: SwapTradeData<IBData<C>>) => {
      accountStaticCallBack(swapBtnClickArray, [
        { sell, buy, slippage, ...rest },
      ]);
    },
    [swapBtnClickArray]
  );
  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      setSwapBtnStatus(TradeBtnStatus.AVAILABLE);
      setSwapBtnI18nKey(accountStaticCallBack(_btnLabel));
    }
  }, [
    accountStatus,
    isSwapLoading,
    pageTradeLite.calcTradeParams?.amountS,
    sellMinAmt,
    // pageTradeLite.calcTradeParams?.isAtoB,
  ]);
  /*** Btn related end ***/
  const toPro = React.useCallback(() => {
    history.push({
      pathname: `/trade/pro/${market}`,
    });
  }, [market]);

  const should15sRefresh = React.useCallback(() => {
    // myLog('should15sRefresh', market);
    if (market) {
      // updateDepth()
      callPairDetailInfoAPIs();
      // marketTradeTableCallback();
    }
  }, [market]);
  /*** table related end ***/
  const getStorageId = React.useCallback(async () => {
    if (
      tradeCalcData?.coinSell &&
      tokenMap &&
      tokenMap[tradeCalcData?.coinSell] &&
      LoopringAPI.userAPI
    ) {
      const storageId = await LoopringAPI.userAPI.getNextStorageId(
        {
          accountId: account.accountId,
          sellTokenId: tokenMap[tradeCalcData?.coinSell].tokenId,
        },
        account.apiKey
      );
      setStorageId(storageId);
    }
  }, [tradeCalcData?.coinSell, account, tokenMap]);
  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      tradeCalcData?.coinSell &&
      tradeCalcData?.coinBuy
    ) {
      walletLayer2Callback();
      if (account.readyState === AccountStatus.ACTIVATED) {
        getAmount({ market });
        getStorageId();
      }
    }
  }, [
    account.readyState,
    accountStatus,
    market,
    tradeCalcData?.coinSell,
    tradeCalcData?.coinBuy,
  ]);

  const walletLayer2Callback = React.useCallback(async () => {
    let walletMap: WalletMap<any> | undefined = undefined;
    if (account.readyState === AccountStatus.ACTIVATED) {
      walletMap = makeWalletLayer2(true).walletMap;
      // myLog('--ACTIVATED tradeCalcData:', tradeCalcData)
      setTradeData({
        ...tradeData,
        sell: {
          belong: tradeCalcData.coinSell,
          balance: walletMap
            ? walletMap[tradeCalcData.coinSell as string]?.count
            : 0,
        },
        buy: {
          belong: tradeCalcData.coinBuy,
          balance: walletMap
            ? walletMap[tradeCalcData.coinBuy as string]?.count
            : 0,
        },
      } as SwapTradeData<IBData<C>>);
      setTradeCalcData((tradeCalcData) => {
        return { ...tradeCalcData, walletMap } as TradeCalcData<C>;
      });
    } else {
      if (tradeCalcData.coinSell && tradeCalcData.coinBuy) {
        setTradeData((state) => {
          return {
            ...state,
            sell: { belong: tradeCalcData.coinSell },
            buy: { belong: tradeCalcData.coinBuy },
          } as SwapTradeData<IBData<C>>;
        });
      }
      updatePageTradeLite({
        market: market as MarketType,
        feeBips: 0,
        totalFee: 0,
        takerRate: 0,
        priceImpactObj: undefined,
      });
      // setFeeBips('0')
      // setTotalFee('0')
      // setTakerRate('0')
      setTradeCalcData((state) => {
        return {
          ...state,
          minimumReceived: undefined,
          priceImpact: undefined,
          fee: undefined,
        };
      });
    }
  }, [
    tradeData,
    market,
    tradeCalcData,
    marketArray,
    ammMap,
    account.readyState,
  ]);

  useSwapSocket();
  useWalletLayer2Socket({ walletLayer2Callback });
  /*** account related end ***/

  /*** user Action function ***/
  //High: effect by wallet state update
  const handleSwapPanelEvent = async (
    swapData: SwapData<SwapTradeData<IBData<C>>>,
    swapType: any
  ): Promise<void> => {
    // myLog('handleSwapPanelEvent...')

    const { tradeData } = swapData;
    resetSwap(swapType, tradeData);
  };

  React.useEffect(() => {
    if (pageTradeLite.depth) {
      refreshAmmPoolSnapshot();
      setIsSwapLoading(false);
    }
  }, [
    pageTradeLite.depth,
    tradeCalcData.coinBuy,
    account.readyState,
    amountStatus,
    market,
  ]);

  React.useEffect(() => {
    if (market) {
      //@ts-ignore
      if (refreshRef.current) {
        // @ts-ignore
        refreshRef.current.firstElementChild.click();
      }
      if (
        (tradeData && tradeData.sell.belong == undefined) ||
        tradeData === undefined
      ) {
        resetSwap(undefined, undefined);
      }
    }
  }, [market]);
  const refreshAmmPoolSnapshot = React.useCallback(() => {
    const { ticker, ammPoolSnapshot, depth, lastStepAt, tradePair, market } =
      pageTradeLite;
    //@ts-ignore
    //(tickMap || ammPoolSnapshot) &&
    if (
      `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}` === market ||
      `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` === market
    ) {
      let { stob, btos, close } = calcPriceByAmmTickMapDepth({
        market: market as any,
        tradePair: `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
        dependencyData: { ticker, ammPoolSnapshot, depth },
      });

      // setTradeFloat({ ...ticker, close: close } as TradeFloat);

      const result = reCalcStoB(
        market,
        tradeData as SwapTradeData<IBData<unknown>>,
        tradePair as any
      );
      if (result) {
        setTradeCalcData((state) => {
          state.StoB = result.stob;
          state.BtoS = result.btos;
          return { ...state };
        });
      } else {
        setTradeCalcData((state) => {
          state.StoB = stob;
          state.BtoS = btos;
          return { ...state };
        });
      }
      updatePageTradeLite({ market, close });
    }

    if (
      tradeData &&
      lastStepAt &&
      tradeCalcData.coinSell === tradeData["sell"].belong &&
      tradeCalcData.coinBuy === tradeData["buy"].belong &&
      tradeData[lastStepAt].tradeValue &&
      tradeData[lastStepAt].tradeValue !== 0
    ) {
      reCalculateDataWhenValueChange(tradeData, tradePair, lastStepAt);
    }
  }, [market, pageTradeLite, tradeData, tradeCalcData, setTradeCalcData]);

  const resetTradeCalcData = React.useCallback(
    (_tradeData, _market?, type?: "sell" | "buy") => {
      if (coinMap && tokenMap && marketMap && marketArray) {
        const { tradePair } = marketInitCheck(_market, type);
        // @ts-ignore
        const [, coinA, coinB] = tradePair.match(/([\w,#]+)-([\w,#]+)/i);
        let walletMap: WalletMap<any> | undefined;
        if (
          account.readyState === AccountStatus.ACTIVATED &&
          walletLayer2Status === SagaStatus.UNSET
        ) {
          if (!Object.keys(tradeCalcData.walletMap ?? {}).length) {
            walletMap = makeWalletLayer2(true).walletMap as WalletMap<any>;
          }
          walletMap = tradeCalcData.walletMap as WalletMap<any>;
        }
        const tradeDataTmp: any = {
          sell: {
            belong: coinA,
            tradeValue: _tradeData?.tradeValue ?? 0,
            balance: walletMap ? walletMap[coinA]?.count : 0,
          },
          buy: {
            belong: coinB,
            tradeValue: _tradeData?.tradeValue ?? 0,
            balance: walletMap ? walletMap[coinB]?.count : 0,
          },
        };

        const sellCoinInfoMap = tokenMap[coinB].tradePairs?.reduce(
          (prev: any, item: string | number) => {
            return { ...prev, [item]: coinMap[item] };
          },
          {} as CoinMap<C>
        );

        const buyCoinInfoMap = tokenMap[coinA].tradePairs?.reduce(
          (prev: any, item: string | number) => {
            return { ...prev, [item]: coinMap[item] };
          },
          {} as CoinMap<C>
        );

        setTradeCalcData((state) => {
          return {
            ...state,
            walletMap,
            coinSell: coinA,
            coinBuy: coinB,
            sellPrecision: tokenMap[coinA as string].precision,
            buyPrecision: tokenMap[coinB as string].precision,
            sellCoinInfoMap,
            buyCoinInfoMap,
            priceImpact: "",
            priceImpactColor: "inherit",
            minimumReceived: undefined,
            StoB: undefined,
            BtoS: undefined,
            fee: undefined,
            feeTakerRate: undefined,
            tradeCost: undefined,
          };
        });
        setTradeData({ ...tradeDataTmp });

        let { market: market } = sdk.getExistedMarket(
          marketArray,
          coinA,
          coinB
        );
        setMarket(market);
        history.push("/trade/lite/" + _market);
        updatePageTradeLite({ market, tradePair });

        myLog("Market change getAmount", market);
        if (account.readyState === AccountStatus.ACTIVATED) {
          getAmount({ market });
        }
        setIsSwapLoading(true);
        setPair({ coinAInfo: coinMap[coinA], coinBInfo: coinMap[coinB] });
      }
    },
    [
      tradeCalcData,
      tradeData,
      coinMap,
      tokenMap,
      marketMap,
      marketArray,
      setTradeCalcData,
      setTradeData,
      setMarket,
      setPair,
    ]
  );

  const callPairDetailInfoAPIs = React.useCallback(async () => {
    if (market && ammMap && LoopringAPI.exchangeAPI) {
      try {
        const { depth, ammPoolSnapshot } = await swapDependAsync(market);
        const { tickerMap } = store.getState().tickerMap;
        // myLog('store.getState().tickerMap',tickerMap[market]);
        updatePageTradeLite({
          market,
          depth,
          ammPoolSnapshot,
          ticker: tickerMap[market],
        });
      } catch (error: any) {
        myLog(error, "go to LRC-ETH");
        resetTradeCalcData(undefined, market);
      }
    }
  }, [market, ammMap, tickerMap]);
  const reCalculateDataWhenValueChange = React.useCallback(
    (_tradeData, _tradePair?, type?) => {
      const { ammPoolSnapshot, depth, tradePair, close } = pageTradeLite;
      const { amountMap } = store.getState().amountMap;
      let calcForMinAmt, calcForMinCost, calcForPriceImpact;

      // @ts-ignore
      // myLog('reCalculateDataWhenValueChange depth:_tradePair,market', pageTradeLite, _tradePair, market)
      //checkMarketDataValid(ammPoolSnapshot, tickMap, market, depth) &&
      if (depth && market && _tradePair === tradePair) {
        const coinA = _tradeData.sell.belong;
        const coinB = _tradeData.buy.belong;
        const sellToken = tokenMap[coinA as string];
        const buyToken = tokenMap[coinB as string];

        const isAtoB = type === "sell";

        let input: any = isAtoB
          ? _tradeData.sell.tradeValue
          : _tradeData.buy.tradeValue;
        input = input === undefined || isNaN(Number(input)) ? 0 : Number(input);
        let slippage = sdk
          .toBig(
            _tradeData.slippage && !isNaN(_tradeData.slippage)
              ? _tradeData.slippage
              : defalutSlipage
          )
          .times(100)
          .toString();
        let totalFee = undefined;
        let feeTakerRate = undefined;
        let feeBips = undefined;
        let takerRate = undefined;
        let buyMinAmtInfo = undefined;
        let sellMinAmtInfo = undefined;
        let tradeCost = undefined;
        let basePrice = undefined;
        let tradePrice = undefined;
        let maxFeeBips = MAPFEEBIPS;

        if (amountMap && amountMap[market as string] && ammMap) {
          myLog(`amountMap[${market}]:`, amountMap[market as string]);

          const ammMarket = `AMM-${market}`;
          // const amount = ammMap[ammMarket]
          //   ? amountMap[ammMarket]
          //   : amountMap[market as string];
          const amountMarket = amountMap[market as string];

          buyMinAmtInfo = amountMarket[_tradeData["buy"].belong as string];
          sellMinAmtInfo = amountMarket[_tradeData["sell"].belong as string];
          // myLog(`buyMinAmtInfo,sellMinAmtInfo: AMM-${market}, ${_tradeData[ 'buy' ].belong}`, buyMinAmtInfo, sellMinAmtInfo)

          takerRate = buyMinAmtInfo ? buyMinAmtInfo.userOrderInfo.takerRate : 0;
          feeBips = ammMap[ammMarket]
            ? ammMap[ammMarket].__rawConfig__.feeBips
            : 1;

          feeTakerRate =
            amountMarket[_tradeData["buy"].belong as string] &&
            amountMarket[_tradeData["buy"].belong as string].userOrderInfo
              .takerRate;
          tradeCost =
            amountMarket[_tradeData["buy"].belong as string].tradeCost;

          const minAmountInput = BigNumber.max(
            buyMinAmtInfo.userOrderInfo.minAmount,
            tokenMap[buyToken.symbol].orderAmounts.dust
          )
            .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
            .div("1e" + buyToken.decimals)
            .toString();

          calcForMinAmt = sdk.getOutputAmount({
            input: minAmountInput,
            sell: coinA,
            buy: coinB,
            isAtoB: false,
            marketArr: marketArray as string[],
            tokenMap: tokenMap as any,
            marketMap: marketMap as any,
            depth,
            ammPoolSnapshot: ammPoolSnapshot,
            feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
            takerRate: "0",
            slipBips: slippage,
          });

          myLog(
            "buyMinAmtInfo.userOrderInfo.minAmount:",
            buyMinAmtInfo.userOrderInfo.minAmount,
            `buyMinAmtInfo.userOrderInfo.minAmount, with slippage:${slippage}`,
            sdk
              .toBig(buyMinAmtInfo.userOrderInfo.minAmount)
              .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
              .toString()
          );

          /*** calc for Price Impact ****/
          const sellMinAmtInput = sdk
            .toBig(sellMinAmtInfo.baseOrderInfo.minAmount)
            .div("1e" + sellToken.decimals)
            .toString();

          calcForPriceImpact = sdk.getOutputAmount({
            input: sellMinAmtInput,
            sell: coinA,
            buy: coinB,
            isAtoB: true,
            marketArr: marketArray as string[],
            tokenMap: tokenMap as any,
            marketMap: marketMap as any,
            depth,
            ammPoolSnapshot: ammPoolSnapshot,
            feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
            takerRate: "0",
            slipBips: "10",
          });

          basePrice = sdk
            .toBig(calcForPriceImpact?.output)
            .div(sellMinAmtInput);

          myLog(
            "calcForPriceImpact input: ",
            sellMinAmtInput,
            ", output: ",
            sdk
              .toBig(calcForPriceImpact?.output)
              .div(sellMinAmtInput)
              .toNumber(),
            ", calcForPriceImpact:",
            calcForPriceImpact?.amountBOutSlip?.minReceivedVal,
            ", calcForPriceImpact basePrice: ",
            basePrice.toNumber()
          );

          /**** calc for min Cost ****/
          const dustToken = buyToken;
          let calcForMinCostInput = BigNumber.max(
            sdk.toBig(tradeCost).times(2),
            dustToken.orderAmounts.dust
          );

          const tradeCostInput = sdk
            .toBig(calcForMinCostInput)
            .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
            .div("1e" + dustToken.decimals)
            .toString();

          myLog(
            "tradeCost*2:",
            sdk.toBig(tradeCost).times(2).toString(),
            "buyToken.orderAmounts.dust",
            buyToken.orderAmounts.dust,
            "calcForMinCostInput",
            calcForMinCostInput.toString(),
            `calcForMinCostInput, with slippage:${slippage}`,
            sdk
              .toBig(calcForMinCostInput ?? 0)
              .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
              .toString(),
            "calcForMinCost, Input",
            tradeCostInput
          );

          calcForMinCost = sdk.getOutputAmount({
            input: tradeCostInput,
            sell: coinA,
            buy: coinB,
            isAtoB: false,
            marketArr: marketArray as string[],
            tokenMap: tokenMap as any,
            marketMap: marketMap as any,
            depth,
            ammPoolSnapshot: ammPoolSnapshot,
            feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
            takerRate: "0",
            slipBips: slippage,
          });
          const minAmt = BigNumber.max(
            sellToken.orderAmounts.dust,
            calcForMinCost?.amountS ?? 0
          ).times(1.1);
          setSellMinAmt(minAmt.toString());
          myLog(
            `calcForMinAmt.amountS`,
            sdk
              .toBig(calcForMinAmt?.amountS ?? 0)
              .div(
                "1e" + tokenMap[_tradeData["sell"].belong as string].decimals
              )
              .toString(),
            "calcForMinCost.amountS",
            sdk
              .toBig(calcForMinCost?.amountS ?? 0)
              .div(
                "1e" + tokenMap[_tradeData["sell"].belong as string].decimals
              )
              .toString()
          );
          // myLog('calcForMinAmt?.sellAmt:', calcForMinAmt?.sellAmt)
          // myLog(`${realMarket} feeBips:${feeBips} takerRate:${takerRate} totalFee: ${totalFee}`)
        }
        const calcTradeParams = sdk.getOutputAmount({
          input: input.toString(),
          sell: coinA,
          buy: coinB,
          isAtoB,
          marketArr: marketArray as string[],
          tokenMap: tokenMap as any,
          marketMap: marketMap as any,
          depth,
          ammPoolSnapshot: ammPoolSnapshot,
          feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
          takerRate: "0",
          slipBips: slippage,
        });

        const minSymbol = _tradeData.buy.belong;
        tradePrice = sdk
          .toBig(calcTradeParams?.amountBOutSlip?.minReceivedVal ?? 0)
          .div(isAtoB ? input.toString() : calcTradeParams?.output);
        const priceImpact = sdk
          .toBig(1)
          .minus(sdk.toBig(tradePrice).div(basePrice ?? 1))
          .minus(0.001);
        if (calcTradeParams && priceImpact.gte(0)) {
          calcTradeParams.priceImpact = priceImpact.toFixed(4, 1);
        } else {
          calcTradeParams && (calcTradeParams.priceImpact = "0");
        }

        myLog(
          "calcTradeParams input:",
          input.toString(),
          ", calcTradeParams Price: ",
          sdk
            .toBig(calcTradeParams?.amountBOutSlip?.minReceivedVal ?? 0)
            .div(input.toString())
            .toNumber(),
          `isAtoB:${isAtoB}, ${
            isAtoB ? input.toString() : calcTradeParams?.output
          } tradePrice: `,
          tradePrice.toString(),
          "basePrice: ",
          basePrice?.toString(),
          "toBig(tradePrice).div(basePrice)",
          sdk
            .toBig(tradePrice)
            .div(basePrice ?? 1)
            .toNumber(),
          "priceImpact (1-tradePrice/basePrice) - 0.001",
          priceImpact.toNumber(),
          "priceImpact view",
          calcTradeParams?.priceImpact
        );

        if (
          tradeCost &&
          calcTradeParams &&
          calcTradeParams.amountBOutSlip?.minReceived &&
          feeTakerRate
        ) {
          let value = sdk
            .toBig(calcTradeParams.amountBOutSlip?.minReceived)
            .times(feeTakerRate)
            .div(10000);

          myLog(
            "input Accounts",
            calcTradeParams?.amountS,
            "100 U calcForMinAmt:",
            calcForMinAmt?.amountS
          );

          let validAmt = !!(
            calcTradeParams?.amountS &&
            calcForMinAmt?.amountS &&
            sdk.toBig(calcTradeParams?.amountS).gte(calcForMinAmt.amountS)
          );
          let totalFeeRaw;

          myLog(
            `${minSymbol} tradeCost:`,
            tradeCost,
            "useTakeRate Fee:",
            value.toString(),
            "calcForMinAmt?.amountS:",
            calcForMinAmt?.amountS,
            `is setup minTrade amount, ${calcForMinAmt?.amountS}:`,
            validAmt
          );

          if (!validAmt) {
            if (sdk.toBig(tradeCost).gte(value)) {
              totalFeeRaw = sdk.toBig(tradeCost);
            } else {
              totalFeeRaw = value;
            }
            myLog(
              "maxFeeBips update for tradeCost before value:",
              maxFeeBips,
              "totalFeeRaw",
              totalFeeRaw.toString()
            );
            maxFeeBips = Math.ceil(
              totalFeeRaw
                .times(10000)
                .div(calcTradeParams.amountBOutSlip?.minReceived)
                .toNumber()
            );
            myLog("maxFeeBips update for tradeCost after value:", maxFeeBips);
          } else {
            totalFeeRaw = sdk.toBig(value);
          }

          totalFee = getValuePrecisionThousand(
            totalFeeRaw.div("1e" + tokenMap[minSymbol].decimals).toString(),
            tokenMap[minSymbol].precision,
            tokenMap[minSymbol].precision,
            tokenMap[minSymbol].precision,
            false,
            { floor: true }
          );
          tradeCost = getValuePrecisionThousand(
            sdk
              .toBig(tradeCost)
              .div("1e" + tokenMap[minSymbol].decimals)
              .toString(),
            tokenMap[minSymbol].precision,
            tokenMap[minSymbol].precision,
            tokenMap[minSymbol].precision,
            false,
            { floor: true }
          );

          myLog("totalFee view value:", totalFee, tradeCost);
          myLog("tradeCost view value:", tradeCost);
        }

        const minimumReceived = getValuePrecisionThousand(
          sdk
            .toBig(calcTradeParams?.amountBOutSlip?.minReceivedVal ?? 0)
            .minus(totalFee)
            .toString(),
          tokenMap[minSymbol].precision,
          tokenMap[minSymbol].precision,
          tokenMap[minSymbol].precision,
          false,
          { floor: true }
        );

        const priceImpactObj = getPriceImpactInfo(calcTradeParams);
        const _tradeCalcData: Partial<TradeCalcData<C>> = {
          priceImpact: priceImpactObj.value.toString(),
          priceImpactColor: priceImpactObj.priceImpactColor,
          minimumReceived: !minimumReceived?.toString().startsWith("-")
            ? minimumReceived
            : undefined,
          fee: totalFee,
          feeTakerRate,
          tradeCost,
        };

        // myLog('calcTradeParams?.output:', calcTradeParams?.output, getShowStr(calcTradeParams?.output))
        _tradeData[isAtoB ? "buy" : "sell"].tradeValue = getShowStr(
          calcTradeParams?.output
        );

        const result = reCalcStoB(
          market,
          _tradeData as SwapTradeData<IBData<unknown>>,
          tradePair as any
        );
        if (result) {
          _tradeCalcData.StoB = result.stob;
          _tradeCalcData.BtoS = result.btos;
        } else {
          if (close) {
            // @ts-ignore
            const [, _coinA] = market.match(/(\w+)-(\w+)/i);
            let _btos = getValuePrecisionThousand(
              1 / Number(close.replace(sdk.SEP, "")),
              tokenMap[_coinA].precision,
              tokenMap[_coinA].precision,
              tokenMap[_coinA].precision,
              true
            ); // .toFixed(tokenMap[idIndex[poolATokenVol.tokenId]].precision))

            if (market === tradePair) {
              _tradeCalcData.StoB = close;
              _tradeCalcData.BtoS = _btos;
            } else {
              _tradeCalcData.StoB = _btos;
              _tradeCalcData.BtoS = close;
            }
          }
        }
        myLog("updatePageTradeLite feeBips:", feeBips);

        updatePageTradeLite({
          market,
          calcTradeParams: {
            ...calcTradeParams,
            feeBips: feeBips ? feeBips : 1,
            takerRate: takerRate ? takerRate : 0,
          } as any,
          priceImpactObj,
          lastStepAt: type,
          feeBips,
          takerRate,
          sellMinAmtInfo: sellMinAmtInfo as any,
          buyMinAmtInfo: buyMinAmtInfo as any,
          totalFee,
          maxFeeBips,
          feeTakerRate,
          tradeCost,
        });
        //setOutput(calcTradeParams)
        setTradeCalcData({ ...tradeCalcData, ..._tradeCalcData });
        setTradeData({ ...tradeData, ..._tradeData });
      }
    },
    [
      amountMap,
      pageTradeLite,
      tradeCalcData,
      tradeData,
      coinMap,
      tokenMap,
      marketMap,
      marketArray,
    ]
  );

  const resetSwap = (
    swapType: SwapType | undefined,
    _tradeData: SwapTradeData<IBData<C>> | undefined
  ) => {
    switch (swapType) {
      case SwapType.SEll_CLICK:
      case SwapType.BUY_CLICK:
        return;
      case SwapType.SELL_SELECTED:
        //type = 'sell'
        if (_tradeData?.sell.belong !== tradeData?.sell.belong) {
          resetTradeCalcData(
            _tradeData,
            `${_tradeData?.sell?.belong ?? `#null`}-${
              _tradeData?.buy?.belong ?? `#null`
            }`,
            "sell"
          );
        } else {
          reCalculateDataWhenValueChange(
            _tradeData,
            `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`,
            "sell"
          );
        }
        // throttleSetValue('sell', _tradeData)
        break;
      case SwapType.BUY_SELECTED:
        //type = 'buy'
        if (_tradeData?.buy.belong !== tradeData?.buy.belong) {
          resetTradeCalcData(
            _tradeData,
            `${_tradeData?.sell?.belong ?? `#null`}-${
              _tradeData?.buy?.belong ?? `#null`
            }`,
            "buy"
          );
        } else {
          reCalculateDataWhenValueChange(
            _tradeData,
            `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`,
            "buy"
          );
        }
        break;
      case SwapType.EXCHANGE_CLICK:
        const { close } = pageTradeLite;
        let btos: string = "0";
        if (close) {
          // @ts-ignore
          const [, _coinA] = market.match(/(\w+)-(\w+)/i);
          btos = getValuePrecisionThousand(
            1 / Number(close.replace(sdk.SEP, "")),
            tokenMap[_coinA].precision,
            tokenMap[_coinA].precision,
            tokenMap[_coinA].precision,
            true
          ); // .toFixed(tokenMap[idIndex[poolATokenVol.tokenId]].precision))
        }
        const _tradeCalcData = {
          ...tradeCalcData,
          coinSell: tradeCalcData.coinBuy,
          sellPrecision: tokenMap[tradeCalcData.coinBuy as string].precision,
          coinBuy: tradeCalcData.coinSell,
          buyPrecision: tokenMap[tradeCalcData.coinSell as string].precision,
          sellCoinInfoMap: tradeCalcData.buyCoinInfoMap,
          buyCoinInfoMap: tradeCalcData.sellCoinInfoMap,
          StoB:
            market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`
              ? close
              : btos,
          BtoS:
            market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`
              ? btos
              : close,
          priceImpact: undefined,
          priceImpactColor: "inherit",
          minimumReceived: undefined,
          fee: undefined,
          feeTakerRate: undefined,
          tradeCost: undefined,
        };

        myLog(
          "Exchange,tradeCalcData,_tradeCalcData",
          tradeCalcData,
          _tradeCalcData
        );
        callPairDetailInfoAPIs();
        updatePageTradeLite({
          market,
          tradePair: `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`,
          calcTradeParams: {
            ...pageTradeLite.calcTradeParams,
            isReverse: !pageTradeLite.calcTradeParams,
            amountS: undefined,
            output: undefined,
          },
        });
        setSellMinAmt(undefined);
        setTradeCalcData(_tradeCalcData);
        break;
      default:
        myLog("resetSwap default");
        resetTradeCalcData(undefined, market);
        should15sRefresh();
        break;
    }
  };

  return {
    toastOpen,
    closeToast,
    tradeCalcData,
    tradeData,
    onSwapClick,
    swapBtnI18nKey,
    swapBtnStatus,
    handleSwapPanelEvent,
    should15sRefresh,
    refreshRef,
    alertOpen,
    confirmOpen,
    swapFunc,
    pageTradeLite,
    isSwapLoading,
    market,
    toPro,
    isMobile,
  };
};
