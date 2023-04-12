import * as sdk from "@loopring-web/loopring-sdk";
import React from "react";
import {
  DAYS,
  dexSwapDependAsync,
  getTimestampDaysLater,
  LoopringAPI,
  makeWalletLayer2,
  MAPFEEBIPS,
  marketInitCheck,
  reCalcStoB,
  store,
  useAccount,
  useCexMap,
  usePairMatch,
  useSocket,
  useSubmitBtn,
  useSystem,
  useToast,
  useTokenMap,
  useTokenPrices,
  useWalletLayer2,
  useWalletLayer2Socket,
  walletLayer2Service,
} from "@loopring-web/core";

import {
  AccountStatus,
  CexTradeCalcData,
  CEX_MARKET,
  CoinMap,
  CustomErrorWithCode,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  MarketType,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_QUICK_AUTO_CLOSE,
  TradeBtnStatus,
  UIERROR_CODE,
  WalletMap,
  defalutSlipage,
} from "@loopring-web/common-resources";
import {
  AccountStep,
  SwapData,
  SwapTradeData,
  SwapType,
  useOpenModals,
  useSettings,
  useToggle,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { useTradeCex } from "../../stores/router/tradeCex";
import BigNumber from "bignumber.js";

const useCexSocket = () => {
  const { sendSocketTopic, socketEnd } = useSocket();
  const { account } = useAccount();
  const { tradeCex } = useTradeCex();
  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      sendSocketTopic({
        [sdk.WsTopicType.account]: true,
        [sdk.WsTopicType.cefiOrderBook]: {
          showOverlap: false,
          markets: [tradeCex.cexMarket], //[tradeCex.market],
          level: 0,
          snapshot: true,
        },
      });
    } else {
      socketEnd();
    }
    return () => {
      socketEnd();
    };
  }, [account.readyState]);
};

export const useCexSwap = <
  T extends SwapTradeData<IBData<C>>,
  C extends { [key: string]: any },
  CAD extends CexTradeCalcData<C>
>({
  path,
}: {
  path: string;
}) => {
  const { marketCoins, marketArray, marketMap, tradeMap, getCexMap } =
    useCexMap();
  //High: No not Move!!!!!!
  const { realMarket } = usePairMatch({
    path,
    coinA: "LRC",
    coinB: "USDT",
    marketArray,
    tokenMap: tradeMap,
  });
  const { t } = useTranslation(["common", "error"]);
  const history = useHistory();
  const refreshRef = React.createRef();
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { isMobile } = useSettings();
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals();
  const { account } = useAccount();
  const {
    toggle: { cexOrder },
  } = useToggle();

  /** loaded from loading **/
  const { exchangeInfo, allowTrade } = useSystem();
  const { coinMap, tokenMap } = useTokenMap();
  const { setShowAccount } = useOpenModals();
  // const {  getAmount, status: amountStatus } = useAmount();

  /** init Ticker ready from ui-backend load**/
  /** get store value **/
  /** after unlock **/
  const { status: walletLayer2Status } = useWalletLayer2();
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined);
  const [tradeCalcData, setTradeCalcData] = React.useState<Partial<CAD>>({
    isCex: true,
    lockedNotification: true,
    coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
      return { ...prev, [item]: coinMap ? coinMap[item] : {} };
    }, {} as CoinMap<C>),
  } as any);

  /** redux storage **/
  const {
    tradeCex,
    updateTradeCex,
    __SUBMIT_LOCK_TIMER__,
    __TOAST_AUTO_CLOSE_TIMER__,
    __DAYS__,
  } = useTradeCex();

  /*** api prepare ***/
  const [market, setMarket] = React.useState<MarketType>(
    realMarket as MarketType
  );
  const [isSwapLoading, setIsSwapLoading] = React.useState(false);

  const { tokenPrices } = useTokenPrices();

  const clearData = () =>
    // tradeCalcData: Partial<TradeCalcData<any>> | null | undefined
    {
      let _tradeCalcData: any = {};
      setTradeData((state) => {
        return {
          ...state,
          sell: { ...state?.sell, tradeValue: undefined },
          buy: { ...state?.buy, tradeValue: undefined },
          isChecked: undefined,
        } as T;
      });

      setTradeCalcData((state) => {
        _tradeCalcData = {
          ...(state ?? {}),
          maxFeeBips: undefined,
          lockedNotification: false,
          isLockedNotificationChecked: false,
          volumeSell: undefined,
          volumeBuy: undefined,
        };
        return _tradeCalcData;
      });
      updateTradeCex({
        market,
        maxFeeBips: MAPFEEBIPS,
        tradeCalcData: {
          ..._tradeCalcData,
        },
      });
    };

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus;
    label: string | undefined;
  } => {
    if (!tokenMap && !tokenPrices) {
      // setSwapBtnStatus();
      // return {tradeBtnStatus:TradeBtnStatus.DISABLED};
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      };
    }
    // const account = store.getState().account;
    const sellToken = tokenMap[tradeData?.sell.belong as string];
    const buyToken = tokenMap[tradeData?.buy.belong as string];

    const {
      tradeCalcData,
      // totalFeeRaw,
      sellMinAmtInfo,
      // sellMaxL2AmtInfo,
      sellMaxAmtInfo,
      // ...product
    } = tradeCex;

    if (!sellToken || !buyToken || !tradeCalcData || !sellMaxAmtInfo) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      };
    }
    const walletMap = makeWalletLayer2(true).walletMap ?? {};

    let validAmt = !!(
      tradeCalcData?.volumeSell &&
      sellMinAmtInfo &&
      sdk.toBig(tradeCalcData?.volumeSell).gte(sdk.toBig(sellMinAmtInfo))
    );

    const sellExceed = sdk
      .toBig(sellMaxAmtInfo)
      .lt(tradeCalcData.volumeSell ?? 0);
    //
    // const buyExceed = sdk
    //   .toBig(buyToken?.orderAmounts?.maximum)
    //   .lt(tradeCalcData?.amountBOutSlip?.minReceived ?? 0);

    if (sellExceed) {
      validAmt = false;
    }

    const notEnough = sdk
      .toBig(walletMap[sellToken.symbol]?.count ?? 0)
      .lt(tradeData?.sell?.tradeValue ?? 0);

    // const sellMaxVal = sellMaxAmtInfo;
    // const buyMaxVal = sdk
    //   .toBig(buyToken?.orderAmounts?.maximum)
    //   .div("1e" + buyToken.decimals);
    //
    if (isSwapLoading) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.LOADING,
      };
    } else {
      if (account.readyState === AccountStatus.ACTIVATED) {
        if (
          !tradeCalcData ||
          !tradeCalcData.volumeSell ||
          !tradeCalcData.volumeBuy
        ) {
          return {
            label: "labelEnterAmount",
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          };
        } else if (notEnough) {
          return {
            label: "tokenNotEnough",
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          };
        } else if (sellExceed) {
          const maxOrderSize =
            tradeCalcData.sellMaxAmtStr + " " + tradeData?.sell.belong;
          return {
            label: `labelLimitMax| ${maxOrderSize}`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          };
        } else if (!validAmt) {
          const sellSymbol = tradeData?.sell.belong;
          if (sellMinAmtInfo === undefined || !sellSymbol) {
            return {
              label: "labelEnterAmount",
              tradeBtnStatus: TradeBtnStatus.DISABLED,
            };
          } else {
            const sellToken = tokenMap[sellSymbol];
            const minOrderSize = getValuePrecisionThousand(
              sdk.toBig(sellMinAmtInfo ?? 0).div("1e" + sellToken.decimals),
              sellToken.precision,
              sellToken.precision,
              sellToken.precision,
              false,
              { floor: false, isAbbreviate: true }
            );
            if (isNaN(Number(minOrderSize))) {
              return {
                label: `labelLimitMin| ${EmptyValueTag + " " + sellSymbol}`,
                tradeBtnStatus: TradeBtnStatus.DISABLED,
              };
            } else {
              return {
                label: `labelLimitMin| ${minOrderSize + " " + sellSymbol}`,
                tradeBtnStatus: TradeBtnStatus.DISABLED,
              };
            }
          }
        } else {
          return {
            label: undefined,
            tradeBtnStatus: TradeBtnStatus.AVAILABLE,
          };
        }
      } else {
        return {
          label: undefined,
          tradeBtnStatus: TradeBtnStatus.AVAILABLE,
        };
      }
    }
  }, [
    account,
    tokenMap,
    tradeData?.sell.belong,
    tradeData?.buy.belong,
    tradeCex,
    isSwapLoading,
  ]);
  const sendRequest = React.useCallback(async () => {
    setIsSwapLoading(true);
    try {
      if (
        account.readyState !== AccountStatus.ACTIVATED &&
        tradeData?.sell.belong &&
        tradeData?.buy.belong &&
        tokenMap &&
        exchangeInfo &&
        tradeCalcData &&
        tradeCalcData?.volumeSell &&
        tradeCalcData?.volumeBuy &&
        tradeCalcData.maxFeeBips &&
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI
      ) {
        const sell = tradeData?.sell.belong as string;
        const buy = tradeData?.buy.belong as string;
        const sellToken = tokenMap[sell];
        const buyToken = tokenMap[buy];
        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          {
            accountId: account.accountId,
            sellTokenId: sellToken?.tokenId ?? 0,
          },
          account.apiKey
        );
        const request: sdk.OriginCEXV3OrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: sellToken?.tokenId ?? 0,
            volume: tradeCalcData.volumeSell,
          },
          buyToken: {
            tokenId: buyToken?.tokenId ?? 0,
            volume: tradeCalcData.volumeBuy,
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips:
            tradeCalcData.maxFeeBips <= 5 ? 5 : tradeCalcData.maxFeeBips,
          fillAmountBOrS: false,
          allOrNone: true,
          eddsaSignature: "",
          clientOrderId: "",
          orderType: sdk.OrderTypeResp.TakerOnly,
          // taker:
          // new BN(ethUtil.toBuffer(request.taker)).toString(),
        };
        myLog("useCexSwap: submitOrder request", request);
        const response: { hash: string } | any =
          await LoopringAPI.defiAPI.sendCefiOrder({
            request,
            privateKey: account.eddsaKey.sk,
            apiKey: account.apiKey,
          });
        if (
          (response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message
        ) {
          throw new CustomErrorWithCode({
            code: (response as sdk.RESULT_INFO).code,
            message: (response as sdk.RESULT_INFO).message,
            ...SDK_ERROR_MAP_TO_UI[
              (response as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN
            ],
          });
        } else {
          clearData();
        }
        walletLayer2Service.sendUserUpdate();

        const info = {
          sellToken,
          buyToken,
          sellStr:
            getValuePrecisionThousand(
              sdk.toBig(tradeCalcData.volumeSell).div(sellToken.precision),
              sellToken.precision,
              sellToken.precision,
              sellToken.precision,
              false,
              { floor: false }
            ) +
            " " +
            sellToken.symbol,
          buyStr:
            getValuePrecisionThousand(
              sdk.toBig(tradeCalcData.volumeBuy).div(buyToken.precision),
              buyToken.precision,
              buyToken.precision,
              buyToken.precision,
              false,
              { floor: false }
            ) +
            " " +
            buyToken.symbol,
          convertStr: `1${sellToken.symbol} \u2248 ${
            tradeCalcData.StoB && tradeCalcData.StoB != "NaN"
              ? tradeCalcData.StoB
              : EmptyValueTag
          } ${buyToken.symbol}`,
          feeStr: tradeCalcData?.fee + " " + buyToken.symbol,
        };
        setShowAccount({
          isShow: true,
          step: AccountStep.CexSwap_Delivering,
          info,
        });
        await sdk.sleep(1000);
        const orderConfirm: { hash: string } | any =
          await LoopringAPI.defiAPI.getCefiOrders({
            request: {
              accountId: account.accountId,
              // @ts-ignore
              hash: response.hash,
            },
            apiKey: account.apiKey,
          });
        if (
          (orderConfirm as sdk.RESULT_INFO).code ||
          (orderConfirm as sdk.RESULT_INFO).message
        ) {
          setShowAccount({
            isShow: true,
            step: AccountStep.CexSwap_Failed,
            info,
          });
        } else {
          setShowAccount({
            isShow: true,
            step: AccountStep.CexSwap_Settled,
            info,
          });
        }
        await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE);
      } else {
        throw new Error("api not ready");
      }
    } catch (error: any) {
      let content: string = "";
      if ([102024, 102025, 114001, 114002].includes(error?.code || 0)) {
        content =
          t("labelCexSwapFailed") +
          " error: " +
          (error
            ? t(error.messageKey, { ns: "error" })
            : (error as sdk.RESULT_INFO).message);
      } else {
        sdk.dumpError400(error);
        content =
          t("labelCexSwapFailed") +
          " error: " +
          (error
            ? t(error.messageKey, { ns: "error" })
            : (error as sdk.RESULT_INFO).message);
      }
      setToastOpen({
        open: true,
        type: "error",
        content,
      });
    }
    setIsSwapLoading(false);
  }, [
    tradeCex,
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
    market,
    __TOAST_AUTO_CLOSE_TIMER__,
    updateTradeCex,
  ]);

  /*** Btn related function ***/
  const cexSwapSubmit = React.useCallback(async () => {
    if (!allowTrade?.cexOrder?.enable) {
      setShowSupport({ isShow: true });
      setIsSwapLoading(false);
      return;
    } else if (!cexOrder.enable) {
      setShowTradeIsFrozen({
        isShow: true,
        type: t("labelCexSwap"),
      });
      setIsSwapLoading(false);
      return;
    } else {
      sendRequest();
    }
  }, []);

  const {
    btnStatus: swapBtnStatus,
    onBtnClick: onSwapClick,
    btnLabel: swapBtnI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: isSwapLoading,
    submitCallback: cexSwapSubmit,
  });

  const should15sRefresh = React.useCallback(() => {
    myLog("useCexSwap: should15sRefresh", market);
    if (market) {
      getCexMap();
      callPairDetailInfoAPIs();
    }
  }, [market]);

  React.useEffect(() => {
    const { depth, market } = store.getState()._router_tradeCex.tradeCex;

    if (depth && new RegExp(market).test(depth?.symbol)) {
      setIsSwapLoading(false);
      refreshWhenDepthUp();
    } else {
      setIsSwapLoading(true);
    }
  }, [tradeCex.depth, account.readyState, market]);

  const walletLayer2Callback = React.useCallback(async () => {
    let walletMap: WalletMap<any> | undefined = undefined;
    if (account.readyState === AccountStatus.ACTIVATED) {
      walletMap = makeWalletLayer2(true).walletMap;
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
      } as T);
      setTradeCalcData((tradeCalcData) => {
        return { ...tradeCalcData, walletMap } as CAD;
      });
    } else {
      if (tradeCalcData.coinSell && tradeCalcData.coinBuy) {
        setTradeData((state) => {
          return {
            ...state,
            sell: { belong: tradeCalcData.coinSell },
            buy: { belong: tradeCalcData.coinBuy },
          } as T;
        });
      }
      updateTradeCex({
        market: market as MarketType,
        feeBips: 0,
        totalFee: 0,
        tradeCalcData: {},
      });

      setTradeCalcData((state) => {
        return {
          ...state,
          walletMap: {},
          minimumReceived: undefined,
          priceImpact: undefined,
          fee: undefined,
        };
      });
    }
  }, [tradeData, market, tradeCalcData, marketArray, account.readyState]);

  useCexSocket();
  useWalletLayer2Socket({ walletLayer2Callback });

  /*** user Action function ***/
  //High: effect by wallet state update
  const handleSwapPanelEvent = async (
    swapData: SwapData<SwapTradeData<IBData<C>>>,
    swapType: any
  ): Promise<void> => {
    const { tradeData } = swapData;
    resetCex(swapType, tradeData);
  };

  React.useEffect(() => {
    if (market) {
      //@ts-ignore
      if (refreshRef.current) {
        // @ts-ignore
        refreshRef.current.firstElementChild.click();
        walletLayer2Service.sendUserUpdate();
      }
      if (
        (tradeData && tradeData.sell.belong == undefined) ||
        tradeData === undefined
      ) {
        resetCex(undefined, undefined);
      }
    }
  }, [market]);

  const resetTradeCalcData = React.useCallback(
    (_tradeData, _market?, type?: "sell" | "buy") => {
      myLog("useCexSwap: resetTradeCalcData", type, _tradeData);

      if (coinMap && tokenMap && marketMap && marketArray) {
        const { tradePair } = marketInitCheck(_market, type);
        // @ts-ignore
        const [, coinA, coinB] = tradePair.match(/([\w,#]+)-([\w,#]+)/i);
        let walletMap: WalletMap<any> | undefined;
        if (
          account.readyState === AccountStatus.ACTIVATED &&
          walletLayer2Status === SagaStatus.UNSET
        ) {
          if (!Object.keys(tradeCalcData?.walletMap ?? {}).length) {
            walletMap = makeWalletLayer2(true).walletMap as WalletMap<any>;
          }
          walletMap = tradeCalcData?.walletMap as WalletMap<any>;
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

        const sellCoinInfoMap = tradeMap[coinB].tradePairs?.reduce(
          (prev: any, item: string | number) => {
            return { ...prev, [item]: coinMap[item] };
          },
          {} as CoinMap<C>
        );

        const buyCoinInfoMap = tradeMap[coinA].tradePairs?.reduce(
          (prev: any, item: string | number) => {
            return { ...prev, [item]: coinMap[item] };
          },
          {} as CoinMap<C>
        );
        let _tradeCalcData = {};
        setTradeCalcData((state) => {
          _tradeCalcData = {
            ...state,
            walletMap,
            coinSell: coinA,
            coinBuy: coinB,
            sellPrecision: tokenMap[coinA as string].precision,
            buyPrecision: tokenMap[coinB as string].precision,
            sellCoinInfoMap,
            buyCoinInfoMap,
            StoB: undefined,
            BtoS: undefined,
            fee: undefined,
            tradeCost: undefined,
            lockedNotification: true,
            isLockedNotificationChecked: false,
            volumeSell: undefined,
            volumeBuy: undefined,
            sellMinAmtStr: undefined,
            sellMaxL2AmtStr: undefined,
            sellMaxAmtStr: undefined,
            l1Pool: undefined,
            l2Pool: undefined,
            // totalPool: undefined,
          };
          return _tradeCalcData;
        });
        setTradeData({ ...tradeDataTmp });
        let { market } = sdk.getExistedMarket(marketArray, coinA, coinB);
        setMarket(market);
        history.push("/trade/cex/" + _market);
        updateTradeCex({ market, tradePair, tradeCalcData: _tradeCalcData });
      }
    },
    [
      tradeCalcData,
      tradeData,
      coinMap,
      tokenMap,
      marketArray,
      setTradeCalcData,
      setTradeData,
      setMarket,
      realMarket,
    ]
  );

  const callPairDetailInfoAPIs = React.useCallback(async () => {
    const { marketMap } = store.getState().invest.cexMap;

    if (market && LoopringAPI.defiAPI && marketMap[market]) {
      try {
        const { depth } = await dexSwapDependAsync({
          market: marketMap[market].cexMarket,
          tokenMap,
        });
        updateTradeCex({
          market,
          depth,
          ...marketMap[market],
        });
        myLog("useCexSwap:", market, depth?.symbol);
      } catch (error: any) {
        myLog("useCexSwap:", error, "go to LRC-USDT");
        resetTradeCalcData(undefined, market);
      }
    }
  }, [market, marketMap]);
  const reCalculateDataWhenValueChange = React.useCallback(
    (_tradeData, _tradePair?, type?) => {
      const {
        tradeCex: { depth, tradePair },
      } = store.getState()._router_tradeCex;

      const { marketMap } = store.getState().invest.cexMap;

      myLog(
        "useCexSwap:reCalculateDataWhenValueChange",
        tradeData,
        _tradePair,
        type
      );
      if (depth && market && _tradePair === tradePair && _tradeData?.sell) {
        const coinA = _tradeData?.sell.belong;
        const coinB = _tradeData?.buy.belong;
        const sellToken = tokenMap[coinA as string];
        const buyToken = tokenMap[coinB as string];
        const sellBuyStr = `${sellToken.symbol}-${buyToken.symbol}`;
        const isAtoB = type === "sell";

        let input: any = isAtoB
          ? _tradeData.sell.tradeValue
          : _tradeData.buy.tradeValue;
        input = input === undefined || isNaN(Number(input)) ? 0 : Number(input);
        let maxFeeBips = MAPFEEBIPS;
        let totalFee = undefined;
        let stob: string | undefined = undefined;
        let btos: string | undefined = undefined;
        let minimumReceived = undefined;
        let sellMinAmtInfo = undefined;
        let sellMaxAmtInfo = undefined;
        let sellMaxL2AmtInfo = undefined;
        // let tradeCost = undefined;
        let totalFeeRaw = undefined;
        const info: CEX_MARKET = marketMap[market];
        const { cefiAmount, minAmount, l2Amount } = info;
        const calcDexOutput = sdk.calcDex({
          info,
          input: input.toString(),
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB,
          marketArr: marketArray,
          tokenMap,
          marketMap,
          depth,
          feeBips: maxFeeBips.toString(),
          slipBips: sdk.toBig(defalutSlipage).times(100).toString(),
        });
        //buy token pool can not be empty
        if (
          // amountMap &&
          // amountMap[market as string] &&
          cefiAmount &&
          l2Amount &&
          (sellBuyStr == market
            ? cefiAmount.quote !== "0"
            : cefiAmount.base !== "0")
        ) {
          if (
            (sellBuyStr == market ? cefiAmount.quote : cefiAmount.base) !== ""
          ) {
            const poolToVol =
              sdk
                .toBig(
                  sellBuyStr == market ? cefiAmount.quote : cefiAmount.base
                )
                .div("1e" + buyToken.decimals)
                .toString() ?? "0";
            const calcPoolToSell = sdk.calcDex({
              info,
              input: poolToVol,
              sell: sellToken.symbol,
              buy: buyToken.symbol,
              isAtoB: false,
              marketArr: marketArray,
              tokenMap,
              marketMap,
              depth,
              feeBips: maxFeeBips.toString(),
              slipBips: sdk.toBig(defalutSlipage).times(100).toString(),
            });
            sellMaxAmtInfo = calcPoolToSell?.amountS;
          }

          // const poolL2ToVol =
          //   sdk
          //     .toBig(
          //       sellBuyStr == market ? l2Amount.quote ?? 0 : l2Amount.base ?? 0
          //     )
          //     .div("1e" + buyToken.decimals)
          //     .toString() ?? "0";

          // const calcPoolL2ToSell = sdk.calcDex({
          //   info,
          //   input: poolL2ToVol,
          //   sell: sellToken.symbol,
          //   buy: buyToken.symbol,
          //   isAtoB: false,
          //   marketArr: marketArray,
          //   tokenMap,
          //   marketMap,
          //   depth,
          //   feeBips: maxFeeBips.toString(),
          // });

          // sellMaxL2AmtInfo = sdk
          //   .toBig(calcPoolL2ToSell?.amountS ?? 0)
          //   .toString();

          sellMinAmtInfo = BigNumber.max(
            sellToken.orderAmounts.dust,
            sellBuyStr == market ? minAmount.base : minAmount.quote
          )
            .div("1e" + sellToken.decimals)
            .toString();
        }

        if (calcDexOutput) {
          minimumReceived = sdk
            .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
            .minus(totalFeeRaw ?? 0)
            .div("1e" + buyToken.decimals)
            .toString();
          _tradeData[isAtoB ? "buy" : "sell"].tradeValue =
            getValuePrecisionThousand(
              calcDexOutput[`amount${isAtoB ? "B" : "S"}`],
              isAtoB ? buyToken.precision : sellToken.precision,
              isAtoB ? buyToken.precision : sellToken.precision,
              isAtoB ? buyToken.precision : sellToken.precision
            );
          let result = reCalcStoB(
            market,
            _tradeData as SwapTradeData<IBData<unknown>>,
            tradePair as any
          );
          stob = result?.stob;
          btos = result?.btos;
        } else {
          minimumReceived = undefined;
        }

        let _tradeCalcData: any = {
          minimumReceived,
          volumeBuy: tradeCalcData?.volumeBuy as any,
          volumeSell: tradeCalcData?.volumeSell as any,
          fee: totalFee,
          isReverse: calcDexOutput?.isReverse,
          lastStepAt: type,
          sellMinAmtStr: getValuePrecisionThousand(
            sdk.toBig(sellMinAmtInfo ?? 0),
            sellToken.precision,
            sellToken.precision,
            sellToken.precision,
            false
          ),
          sellMaxL2AmtStr: getValuePrecisionThousand(
            sdk.toBig(sellMaxL2AmtInfo ?? 0),
            sellToken.precision,
            sellToken.precision,
            sellToken.precision,
            false,
            { isAbbreviate: true }
          ),
          sellMaxAmtStr:
            sellMaxAmtInfo !== undefined
              ? getValuePrecisionThousand(
                  sdk.toBig(sellMaxAmtInfo ?? 0),
                  sellToken.precision,
                  sellToken.precision,
                  undefined,
                  false,
                  { isAbbreviate: true, floor: false }
                )
              : undefined,
          l1Pool: getValuePrecisionThousand(
            sdk
              .toBig(
                sellBuyStr == market
                  ? cefiAmount.quote
                    ? cefiAmount.quote
                    : 0
                  : cefiAmount.base
                  ? cefiAmount.base
                  : 0
              )
              .div("1e" + buyToken.decimals),
            buyToken.precision,
            buyToken.precision,
            undefined,
            false
          ),
          l2Pool: getValuePrecisionThousand(
            sdk
              .toBig(
                (sellBuyStr == market ? l2Amount.quote : l2Amount.base) ?? 0
              )
              .div("1e" + buyToken.decimals),
            buyToken.precision,
            buyToken.precision,
            undefined,
            false
          ),
        };
        totalFeeRaw = sdk.toBig(calcDexOutput?.buyVol ?? 0).times(info.feeBips);
        totalFee = getValuePrecisionThousand(
          sdk.toBig(totalFeeRaw).div("1e" + buyToken.decimals),
          buyToken.precision,
          buyToken.precision,
          undefined,
          false
        );

        setTradeCalcData((state) => {
          const [mid_price, _mid_price_convert] = calcDexOutput
            ? [
                depth.mid_price,
                getValuePrecisionThousand(
                  1 / depth.mid_price,
                  buyToken.precision,
                  buyToken.precision,
                  buyToken.precision
                ),
              ]
            : [undefined, undefined];

          stob = stob
            ? stob
            : state?.StoB
            ? state.StoB
            : !calcDexOutput?.isReverse
            ? mid_price
            : _mid_price_convert;
          btos = btos
            ? btos
            : state?.BtoS
            ? state.BtoS
            : calcDexOutput?.isReverse
            ? mid_price
            : _mid_price_convert;
          _tradeCalcData = {
            ...state,
            ..._tradeCalcData,
            StoB: getValuePrecisionThousand(
              stob,
              buyToken.precision,
              buyToken.precision,
              undefined
            ),
            BtoS: getValuePrecisionThousand(
              btos,
              sellToken.precision,
              sellToken.precision,
              undefined
            ),
            lastStepAt: type,
          };
          return _tradeCalcData;
        });

        setTradeData((state) => ({
          ...state,
          ..._tradeData,
        }));

        updateTradeCex({
          ...info,
          market: market as any,
          totalFee: totalFee,
          totalFeeRaw: totalFeeRaw?.toString(),
          lastStepAt: type,
          sellMinAmtInfo: sellMinAmtInfo as any,
          sellMaxL2AmtInfo: sellMaxL2AmtInfo as any,
          sellMaxAmtInfo: sellMaxAmtInfo as any,
          tradeCalcData: _tradeCalcData,
        });
      }
    },
    [
      account.readyState,
      tradeCex,
      tradeCalcData,
      tradeData,
      coinMap,
      tokenMap,
      marketArray,
    ]
  );
  const refreshWhenDepthUp = React.useCallback(() => {
    const { depth, lastStepAt, tradePair, market } = tradeCex;
    if (depth && depth.symbol === market) {
      reCalculateDataWhenValueChange(tradeData, tradePair, lastStepAt);
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
    } else if (
      depth &&
      tradeCalcData.coinSell &&
      tradeCalcData.coinBuy &&
      (`${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}` === market ||
        `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` === market)
    ) {
      const result = reCalcStoB(
        market,
        tradeData as SwapTradeData<IBData<unknown>>,
        tradePair as any
      );
      const buyToken = tokenMap[tradeCalcData.coinBuy];
      const sellToken = tokenMap[tradeCalcData.coinSell];

      let _tradeCalcData: any = {};
      setTradeCalcData((state) => {
        const pr1 = sdk.toBig(1).div(depth.mid_price).toString();
        const pr2 = depth.mid_price;
        const [StoB, BtoS] =
          market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`
            ? [pr1, pr2]
            : [pr2, pr1];
        // state.;
        // state.BtoS = ;
        _tradeCalcData = {
          ...state,
          ...tradeCalcData,
          StoB: getValuePrecisionThousand(
            result ? result?.stob : StoB.toString(),
            buyToken.precision,
            buyToken.precision,
            undefined
          ),
          BtoS: getValuePrecisionThousand(
            result ? result?.btos : BtoS.toString(),
            sellToken.precision,
            sellToken.precision,
            undefined
          ),
        };
        return {
          ..._tradeCalcData,
        };
      });
      const walletMap = makeWalletLayer2(true).walletMap;
      reCalculateDataWhenValueChange(
        {
          sell: {
            belong: tradeCalcData.coinSell,
            balance: walletMap ? walletMap[tradeCalcData.coinSell]?.count : 0,
          },
          buy: { belong: tradeCalcData.coinBuy },
        },
        `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
        "sell"
      );
      //
      //
      updateTradeCex({ market, tradeCalcData: _tradeCalcData });
    }
  }, [market, tradeCex, tradeData, tradeCalcData, setTradeCalcData]);

  const resetCex = (
    swapType: SwapType | undefined,
    _tradeData: SwapTradeData<IBData<C>> | undefined
  ) => {
    myLog("useCexSwap: resetSwap", swapType, _tradeData);
    const depth = store.getState()._router_tradeCex.tradeCex?.depth;
    switch (swapType) {
      case SwapType.SEll_CLICK:
      case SwapType.BUY_CLICK:
        return;
      case SwapType.SELL_SELECTED:
        myLog(_tradeData);
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
        let StoB, BtoS;
        if (depth && depth.mid_price) {
          const pr1 = sdk.toBig(1).div(depth.mid_price).toString();
          const pr2 = depth.mid_price;
          [StoB, BtoS] =
            market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`
              ? [pr1, pr2]
              : [pr2, pr1];
        }
        const sellPrecision =
          tokenMap[tradeCalcData.coinBuy as string].precision;
        const buyPrecision =
          tokenMap[tradeCalcData.coinSell as string].precision;
        const _tradeCalcData = {
          ...tradeCalcData,
          coinSell: tradeCalcData.coinBuy,
          coinBuy: tradeCalcData.coinSell,
          sellPrecision,
          buyPrecision,
          sellCoinInfoMap: tradeCalcData.buyCoinInfoMap,
          buyCoinInfoMap: tradeCalcData.sellCoinInfoMap,
          StoB: getValuePrecisionThousand(
            StoB,
            buyPrecision,
            buyPrecision,
            undefined,
            false
          ),
          BtoS: getValuePrecisionThousand(
            BtoS,
            sellPrecision,
            sellPrecision,
            undefined,
            false
          ),
        };

        myLog(
          "useCexSwap:Exchange,tradeCalcData,_tradeCalcData",
          tradeData,
          tradeCalcData,
          _tradeCalcData
        );
        callPairDetailInfoAPIs();
        updateTradeCex({
          market,
          tradePair: `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`,
          tradeCalcData: _tradeCalcData,
        });
        setTradeCalcData(_tradeCalcData);
        break;
      default:
        myLog("useCexSwap:resetSwap default");
        resetTradeCalcData(undefined, market);
        break;
    }

    // if(isChecked)
  };
  // myLog("useCexSwap: tradeData", tradeData);

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
    cexSwapSubmit,
    tradeCex,
    isSwapLoading,
    market,
    isMobile,
    setToastOpen,
  };
};
