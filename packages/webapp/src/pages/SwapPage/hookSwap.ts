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
  VolToNumberWithPrecision,
  accountStaticCallBack,
  btnClickMap,
  btnLabel,
  makeMarketArray,
  makeWalletLayer2,
  useToast,
  LoopringAPI,
  getTimestampDaysLater,
  DefaultFeeBips,
  getPriceImpactInfo,
  PriceLevel,
  BIGO,
  MAPFEEBIPS,
} from "@loopring-web/core";

import {
  AccountStatus,
  CoinMap,
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

import { myLog } from "@loopring-web/common-resources";
import {
  calcPriceByAmmTickMapDepth,
  marketInitCheck,
  reCalcStoB,
  swapDependAsync,
} from "./help";
import { useHistory } from "react-router-dom";

import * as _ from "lodash";

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
  const { amountMap, getAmount } = useAmount();
  const { isMobile } = useSettings();
  const { account, status: accountStatus } = useAccount();
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { coinMap, tokenMap, marketArray, marketCoins, marketMap } =
    useTokenMap();
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
  const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);
  const [myTradeArray, setMyTradeArray] = React.useState<RawDataTradeItem[]>(
    []
  );
  const [tradeFloat, setTradeFloat] =
    React.useState<TradeFloat | undefined>(undefined);
  const [alertOpen, setAlertOpen] = React.useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);

  /*** Btn related function ***/
  const swapFunc = React.useCallback(
    async (event: MouseEvent, isAgree?: boolean) => {
      let { calcTradeParams, tradeChannel, orderType } = pageTradeLite;
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

        const request: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: sellToken.tokenId,
        };

        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          request,
          account.apiKey
        );

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
            maxFeeBips: MAPFEEBIPS,
            fillAmountBOrS: false, // amm only false
            orderType,
            tradeChannel,
            eddsaSignature: "",
          };

          myLog(request);

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
      account.readyState,
      pageTradeLite,
      tokenMap,
      tradeData,
      setIsSwapLoading,
      setToastOpen,
      setTradeData,
      market,
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

    // myLog('sellExceed:', sellToken.symbol, sellExceed, sellMaxVal.toString(), ' buyExceed:', buyToken.symbol, buyExceed, buyMaxVal.toString())
    // myLog('calcTradeParams:', calcTradeParams?.amountS, sellMinAmt)

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
          const sellSymbol = tradeData?.sell.belong;
          //VolToNumberWithPrecision(sellMinAmt ?? '', sellSymbol as any)
          const minOrderSize = VolToNumberWithPrecision(
            sellMinAmt ?? "",
            sellSymbol as any
          );
          setSwapBtnStatus(TradeBtnStatus.DISABLED);
          if (isNaN(Number(minOrderSize))) {
            return ``;
          } else {
            return `labelLimitMin| ${minOrderSize + " " + sellSymbol}`;
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
    account.readyState,
    pageTradeLite,
    isSwapLoading,
    sellMinAmt,
    setSwapBtnStatus,
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
  }, [pageTradeLite, allowTrade]);
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
  }, [accountStatus, isSwapLoading, pageTradeLite.calcTradeParams?.amountS]);
  /*** Btn related end ***/

  /*** table related function ***/
  const myTradeTableCallback = React.useCallback(async () => {
    if (market && account.accountId && account.apiKey && LoopringAPI.userAPI) {
      const { userTrades } = await LoopringAPI.userAPI.getUserTrades(
        {
          accountId: account.accountId,
          market,
          limit: 100,
        },
        account.apiKey
      );
      let _myTradeArray = makeMarketArray(
        market,
        userTrades
      ) as RawDataTradeItem[];
      const formattedTradeArray = _myTradeArray.map((o) => {
        return {
          ...o,
          precision: marketMap
            ? marketMap[market]?.precisionForPrice
            : undefined,
        };
      }) as RawDataTradeItem[];
      // setMyTradeArray(_myTradeArray ? _myTradeArray : [])
      setMyTradeArray(_myTradeArray ? formattedTradeArray : []);
    } else {
      setMyTradeArray([]);
    }
  }, [market, account.accountId, account.apiKey, setMyTradeArray]);
  React.useEffect(() => {
    if (
      market &&
      accountStatus === SagaStatus.UNSET &&
      walletLayer2Status === SagaStatus.UNSET
    ) {
      myTradeTableCallback();
    }
  }, [market, accountStatus, walletLayer2Status]);

  const marketTradeTableCallback = React.useCallback(async () => {
    if (LoopringAPI.exchangeAPI && market) {
      const { marketTrades } = await LoopringAPI.exchangeAPI.getMarketTrades({
        market,
        limit: 15,
      });
      const _tradeArray = makeMarketArray(market, marketTrades);
      const formattedTradArray = _tradeArray.map((o) => ({
        ...o,
        precision: marketMap ? marketMap[market]?.precisionForPrice : undefined,
      })) as RawDataTradeItem[];
      // setTradeArray(_tradeArray as RawDataTradeItem[])
      setTradeArray(formattedTradArray as RawDataTradeItem[]);
    } else {
      setTradeArray([]);
    }
  }, [market, setTradeArray]);
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
      marketTradeTableCallback();
    }
  }, [market, ammMap]);
  /*** table related end ***/

  /*** account related function ***/
  React.useEffect(() => {
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      accountStatus === SagaStatus.UNSET
    ) {
      getAmount({ market });
    }
  }, [accountStatus]);
  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      tradeCalcData?.coinSell &&
      tradeCalcData?.coinBuy
    ) {
      walletLayer2Callback();
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
  }, [pageTradeLite.depth, tradeCalcData.coinBuy]);

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

      setTradeFloat({ ...ticker, close: close } as TradeFloat);

      const result = reCalcStoB(
        market,
        tradeData as SwapTradeData<IBData<unknown>>,
        tradePair as any
      );
      if (result) {
        setTradeCalcData((state) => {
          state.StoB = result.stob;
          state.BtoS = result.btos;
          return state;
        });
      } else {
        setTradeCalcData((state) => {
          state.StoB = stob;
          state.BtoS = btos;
          return state;
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

        // const tokenA = tokenMap[ coinA ]
        // const tokenB = tokenMap[ coinB ]

        setTradeCalcData((state) => {
          return {
            ...state,
            walletMap,
            coinSell: coinA,
            coinBuy: coinB,
            // tokenA,
            // tokenB,
            // marketPrecision,
            sellPrecision: tokenMap[coinA as string].precision,
            buyPrecision: tokenMap[coinB as string].precision,
            sellCoinInfoMap,
            buyCoinInfoMap,
            priceImpact: "",
            priceImpactColor: "inherit",
            minimumReceived: "",
            StoB: undefined,
            BtoS: undefined,
            fee: undefined,
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

      // @ts-ignore
      // myLog('reCalculateDataWhenValueChange depth:_tradePair,market', pageTradeLite, _tradePair, market)
      //checkMarketDataValid(ammPoolSnapshot, tickMap, market, depth) &&
      if (depth && market && _tradePair === tradePair) {
        const coinA = _tradeData.sell.belong;
        const coinB = _tradeData.buy.belong;

        const isAtoB = type === "sell";

        let input: any = isAtoB
          ? _tradeData.sell.tradeValue
          : _tradeData.buy.tradeValue;
        input = input === undefined || isNaN(Number(input)) ? 0 : Number(input);
        let slippage = sdk
          .toBig(
            _tradeData.slippage && !isNaN(_tradeData.slippage)
              ? _tradeData.slippage
              : "0.5"
          )
          .times(100)
          .toString();
        let totalFee = undefined;
        let feeBips = undefined;
        let takerRate = undefined;
        let buyMinAmtInfo = undefined;
        let sellMinAmtInfo = undefined;
        if (amountMap && amountMap[market as string] && ammMap) {
          const ammMarket = `AMM-${market}`;
          const amount = ammMap[ammMarket]
            ? amountMap[ammMarket]
            : amountMap[market as string];

          buyMinAmtInfo = amount[_tradeData["buy"].belong as string];
          sellMinAmtInfo = amount[_tradeData["sell"].belong as string];
          // myLog(`buyMinAmtInfo,sellMinAmtInfo: AMM-${market}, ${_tradeData[ 'buy' ].belong}`, buyMinAmtInfo, sellMinAmtInfo)

          takerRate = buyMinAmtInfo ? buyMinAmtInfo.userOrderInfo.takerRate : 0;
          feeBips = ammMap[ammMarket]
            ? ammMap[ammMarket].__rawConfig__.feeBips
            : 1;
          totalFee = sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString();

          const buyToken = tokenMap[_tradeData["buy"].belong as string];

          const minAmountInput = sdk
            .toBig(buyMinAmtInfo.userOrderInfo.minAmount)
            .div("1e" + buyToken.decimals)
            .toString();

          const calcForMinAmt = sdk.getOutputAmount({
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
            takerRate: takerRate ? takerRate.toString() : "0",
            slipBips: slippage,
          });

          setSellMinAmt(calcForMinAmt?.amountS);
          // myLog('calcForMinAmt?.amountS:', calcForMinAmt?.amountS)
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
          takerRate: takerRate ? takerRate.toString() : "0",
          slipBips: slippage,
        });

        // myLog('depth:', depth)
        // myLog('calcTradeParams:', calcTradeParams)
        const minSymbol = _tradeData.buy.belong;
        const priceImpactObj = getPriceImpactInfo(calcTradeParams);
        const _tradeCalcData: Partial<TradeCalcData<C>> = {
          priceImpact: priceImpactObj.value,
          priceImpactColor: priceImpactObj.priceImpactColor,
          minimumReceived:
            calcTradeParams && calcTradeParams.amountBOutSlip?.minReceivedVal
              ? getValuePrecisionThousand(
                  calcTradeParams.amountBOutSlip?.minReceivedVal,
                  tokenMap[minSymbol].precision,
                  tokenMap[minSymbol].precision,
                  tokenMap[minSymbol].precision,
                  false,
                  { floor: true }
                )
              : undefined,
          fee: totalFee,
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
              1 / Number(close.replace(",", "")),
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

        // const tradeChannel = calcTradeParams ? (calcTradeParams.exceedDepth ? sdk.TradeChannel.BLANK : sdk.TradeChannel.MIXED) : undefined
        // const orderType = calcTradeParams ? (calcTradeParams.exceedDepth ? sdk.OrderType.ClassAmm : sdk.OrderType.TakerOnly) : undefined

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
          totalFee,
          takerRate,
          sellMinAmtInfo: sellMinAmtInfo as any,
          buyMinAmtInfo: buyMinAmtInfo as any,
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
            1 / Number(close.replace(",", "")),
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
        });
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
    tradeFloat,
    tradeArray,
    myTradeArray,
    tradeData,
    pair,
    marketArray,
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
    // buyPrecision,
    // sellPrecision,
  };
};
