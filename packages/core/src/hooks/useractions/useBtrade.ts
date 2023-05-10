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
  useBtradeMap,
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
  BtradeTradeCalcData,
  CoinMap,
  CustomErrorWithCode,
  defaultSlipage,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  MarketType,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_DOUBLE_QUICK_AUTO_CLOSE,
  TradeBtnStatus,
  UIERROR_CODE,
  WalletMap,
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

import { useTradeBtrade } from "../../stores/router/tradeBtrade";
import BigNumber from "bignumber.js";

const useBtradeSocket = () => {
  const { sendSocketTopic, socketEnd } = useSocket();
  const { account } = useAccount();
  const { tradeBtrade } = useTradeBtrade();
  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED && tradeBtrade.info) {
      sendSocketTopic({
        [sdk.WsTopicType.account]: true,
        [sdk.WsTopicType.btradeOrderBook]: {
          showOverlap: false,
          markets: [tradeBtrade.info.btradeMarket],
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

export const useBtradeSwap = <
  T extends SwapTradeData<IBData<C>>,
  C extends { [key: string]: any },
  CAD extends BtradeTradeCalcData<C>
>({
  path,
}: {
  path: string;
}) => {
  const { marketCoins, marketArray, marketMap, tradeMap, getBtradeMap } =
    useBtradeMap();
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
  const { account, status: accountStatus } = useAccount();
  const {
    toggle: { BTradeInvest },
  } = useToggle();

  /** loaded from loading **/
  const { exchangeInfo, allowTrade } = useSystem();
  const { coinMap, tokenMap } = useTokenMap();
  const { setShowAccount } = useOpenModals();

  /** init Ticker ready from ui-backend load**/
  /** get store value **/
  /** after unlock **/
  const { status: walletLayer2Status } = useWalletLayer2();
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined);
  const [tradeCalcData, setTradeCalcData] = React.useState<Partial<CAD>>({
    isBtrade: true,
    lockedNotification: true,
    coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
      return { ...prev, [item]: coinMap ? coinMap[item] : {} };
    }, {} as CoinMap<C>),
  } as any);

  /** redux storage **/
  const {
    tradeBtrade,
    updateTradeBtrade,
    __SUBMIT_LOCK_TIMER__,
    __TOAST_AUTO_CLOSE_TIMER__,
    __DAYS__,
  } = useTradeBtrade();

  /*** api prepare ***/
  const [market, setMarket] = React.useState<MarketType>(
    realMarket as MarketType
  );
  const [isBtradeLoading, setIsBtradeLoading] = React.useState(false);

  const { tokenPrices } = useTokenPrices();

  const clearData = () => {
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
        lockedNotification: true,
        isLockedNotificationChecked: false,
        volumeSell: undefined,
        volumeBuy: undefined,
      };
      return _tradeCalcData;
    });
    updateTradeBtrade({
      market,
      maxFeeBips: 0,
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

    const { tradeCalcData, sellMinAmtInfo, sellMaxAmtInfo } = tradeBtrade;

    if (!sellToken || !buyToken || !tradeCalcData) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      };
    }
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    let validAmt = !!(
      tradeCalcData?.volumeSell &&
      sellMinAmtInfo &&
      sdk
        .toBig(tradeCalcData?.volumeSell)
        .gte(sdk.toBig(sellMinAmtInfo).times("1e" + sellToken.decimals))
    );
    const sellExceed = sellMaxAmtInfo
      ? sdk
          .toBig(sellMaxAmtInfo)
          .times("1e" + sellToken.decimals)
          .lt(tradeCalcData.volumeSell ?? 0)
      : false;

    if (sellExceed) {
      validAmt = false;
    }

    const notEnough = sdk
      .toBig(walletMap[sellToken.symbol]?.count ?? 0)
      .lt(tradeData?.sell?.tradeValue ?? 0);
    if (isBtradeLoading) {
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
              sdk.toBig(sellMinAmtInfo ?? 0), //.div("1e" + sellToken.decimals),
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
        } else if (!tradeCalcData?.isLockedNotificationChecked) {
          return {
            label: `labelBtradeConfirm`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          };
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
    tradeCalcData?.isLockedNotificationChecked,
    tradeBtrade.maxFeeBips,
    tradeData?.sell.tradeValue,
    tradeData?.buy.tradeValue,
    isBtradeLoading,
  ]);
  const sendRequest = React.useCallback(async () => {
    setIsBtradeLoading(true);
    const {
      tradeBtrade: {
        tradeCalcData,
        sellToken: _sellToken,
        buyToken: _buyToken,
      },
    } = store.getState()._router_tradeBtrade;
    myLog(
      "exchangeInfo",
      exchangeInfo,
      LoopringAPI.userAPI,
      LoopringAPI.defiAPI
    );
    try {
      if (
        account.readyState == AccountStatus.ACTIVATED &&
        _sellToken &&
        _buyToken &&
        tokenMap &&
        exchangeInfo &&
        tradeCalcData &&
        tradeCalcData?.volumeSell &&
        tradeCalcData?.volumeBuy &&
        tradeCalcData.maxFeeBips &&
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI
      ) {
        const sellToken = tokenMap[_sellToken];
        const buyToken = tokenMap[_buyToken];
        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          {
            accountId: account.accountId,
            sellTokenId: sellToken?.tokenId ?? 0,
          },
          account.apiKey
        );
        const request: sdk.OriginBTRADEV3OrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: sellToken?.tokenId ?? 0,
            volume: sdk.toBig(tradeCalcData.volumeSell).toFixed(0),
          },
          buyToken: {
            tokenId: buyToken?.tokenId ?? 0,
            volume: sdk.toBig(tradeCalcData.volumeBuy).toFixed(0),
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: tradeCalcData.maxFeeBips,
          fillAmountBOrS: false,
          allOrNone: false,
          eddsaSignature: "",
          clientOrderId: "",
          orderType: sdk.OrderTypeResp.TakerOnly,
        };
        myLog("useBtradeSwap: submitOrder request", request);
        const response: { hash: string } | any =
          await LoopringAPI.defiAPI.sendBtradeOrder({
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

        let info: any = {
          sellToken,
          buyToken,
          sellStr: getValuePrecisionThousand(
            sdk.toBig(tradeCalcData.volumeSell).div("1e" + sellToken.decimals),
            sellToken.precision,
            sellToken.precision,
            sellToken.precision,
            false,
            { floor: false }
          ),
          buyStr: getValuePrecisionThousand(
            sdk.toBig(tradeCalcData.volumeBuy).div("1e" + buyToken.decimals),
            buyToken.precision,
            buyToken.precision,
            buyToken.precision,
            false,
            { floor: false }
          ),
          sellFStr: undefined,
          buyFStr: undefined,
          convertStr: `1${sellToken.symbol} \u2248 ${
            tradeCalcData.StoB && tradeCalcData.StoB != "NaN"
              ? tradeCalcData.StoB
              : EmptyValueTag
          } ${buyToken.symbol}`,
          feeStr: tradeCalcData?.fee,
          time: undefined,
        };
        setShowAccount({
          isShow: true,
          step: AccountStep.BtradeSwap_Pending,
          info,
        });
        walletLayer2Service.sendUserUpdate();
        await sdk.sleep(SUBMIT_PANEL_DOUBLE_QUICK_AUTO_CLOSE);
        if (refreshRef.current) {
          // @ts-ignore
          refreshRef.current.firstElementChild.click();
        }
        const orderConfirm: { hash: string } | any =
          await LoopringAPI.defiAPI.getBtradeOrders({
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
        } else if (["failed", "cancelled"].includes(orderConfirm.status)) {
          throw "orderConfirm   failed";
        } else if (store.getState().modals.isShowAccount.isShow) {
          setShowAccount({
            isShow: true,
            step: AccountStep.BtradeSwap_Pending,
            info: {
              ...info,
            },
          });
        }

        await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE);
        if (store.getState().modals.isShowAccount.isShow) {
          setShowAccount({ isShow: false });
        }
      } else {
        throw new Error("api not ready");
      }
    } catch (error: any) {
      let content: string = "";
      if ([102024, 102025, 114001, 114002].includes(error?.code || 0)) {
        content =
          t("labelBtradeSwapFailed") +
          " error: " +
          (error
            ? t(error.messageKey, { ns: "error" })
            : (error as sdk.RESULT_INFO).message);
      } else {
        sdk.dumpError400(error);
        content =
          t("labelBtradeSwapFailed") +
          " error: " +
          (error
            ? t(error.messageKey, { ns: "error" })
            : (error as sdk.RESULT_INFO).message);
      }
      setShowAccount({
        isShow: false,
      });
      setToastOpen({
        open: true,
        type: "error",
        content,
      });
    }
    setIsBtradeLoading(false);
  }, [
    tradeBtrade,
    tradeData,
    tokenMap,
    exchangeInfo,
    account.readyState,
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    __SUBMIT_LOCK_TIMER__,
    setToastOpen,
    t,
    __DAYS__,
    market,
    __TOAST_AUTO_CLOSE_TIMER__,
    updateTradeBtrade,
  ]);

  /*** Btn related function ***/
  const btradeSwapSubmit = React.useCallback(async () => {
    if (!allowTrade?.order?.enable) {
      setShowSupport({ isShow: true });
      setIsBtradeLoading(false);
      return;
    } else if (!marketMap[market]?.enabled || !BTradeInvest.enable) {
      setShowTradeIsFrozen({
        isShow: true,
        type: "Btrade",
      });
      setIsBtradeLoading(false);
      return;
    } else {
      sendRequest();
    }
  }, [market, marketMap, BTradeInvest]);

  const {
    btnStatus: swapBtnStatus,
    onBtnClick: onSwapClick,
    btnLabel: swapBtnI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: isBtradeLoading,
    submitCallback: btradeSwapSubmit,
  });

  const should15sRefresh = React.useCallback(() => {
    myLog("useBtradeSwap: should15sRefresh", market);
    if (market) {
      getBtradeMap();
      callPairDetailInfoAPIs();
    }
  }, [market]);

  React.useEffect(() => {
    const { depth, market } = store.getState()._router_tradeBtrade.tradeBtrade;

    if (depth && new RegExp(market).test(depth?.symbol)) {
      setIsBtradeLoading(false);
      refreshWhenDepthUp();
    } else {
      setIsBtradeLoading(true);
    }
  }, [tradeBtrade.depth, account.readyState, market]);

  const walletLayer2Callback = React.useCallback(async () => {
    let walletMap: WalletMap<any> | undefined = undefined;
    if (account.readyState === AccountStatus.ACTIVATED) {
      walletMap = makeWalletLayer2(true).walletMap;
      setTradeData((tradeData) => {
        return {
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
        } as T;
      });
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
      updateTradeBtrade({
        market: market as MarketType,
        maxFeeBips: 0,
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

  useBtradeSocket();
  useWalletLayer2Socket({ walletLayer2Callback });

  /*** user Action function ***/
  //High: effect by wallet state update
  const handleSwapPanelEvent = async (
    swapData: SwapData<SwapTradeData<IBData<C>>>,
    swapType: any
  ): Promise<void> => {
    const { tradeData } = swapData;
    resetBtrade(swapType, tradeData);
  };

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
        resetBtrade(undefined, undefined);
      }
    }
  }, [market]);
  React.useEffect(() => {
    if (accountStatus === SagaStatus.UNSET) {
      walletLayer2Service.sendUserUpdate();
    }
  }, [accountStatus]);

  const resetTradeCalcData = React.useCallback(
    (_tradeData, _market?, type?: "sell" | "buy") => {
      myLog("useBtradeSwap: resetTradeCalcData", type, _tradeData);

      // const { marketArray, tradeMap } = store.getState().invest.btradeMap;
      if (coinMap && tokenMap && tradeMap && marketMap && marketArray) {
        const { tradePair } = marketInitCheck({
          market: _market,
          type,
          defaultValue: "LRC-USDC",
          marketArray,
          marketMap,
          tokenMap: tradeMap,
        });
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
            tradeValue:
              _tradeData?.belong !== coinA
                ? undefined
                : _tradeData?.tradeValue ?? 0,
            balance: walletMap ? walletMap[coinA]?.count : 0,
          },
          buy: {
            belong: coinB,
            tradeValue:
              _tradeData?.belong !== coinB
                ? undefined
                : _tradeData?.tradeValue ?? 0,
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
            totalQuota: undefined,
            l1Pool: undefined,
            l2Pool: undefined,
          };
          return _tradeCalcData;
        });
        setTradeData((state) => {
          return { ...state, ...tradeDataTmp };
        });
        let { market } = sdk.getExistedMarket(marketArray, coinA, coinB);
        setMarket(market);
        history.push("/trade/btrade/" + _market);
        updateTradeBtrade({ market, tradePair, tradeCalcData: _tradeCalcData });
      }
    },
    [
      tradeCalcData,
      tradeData,
      coinMap,
      tokenMap,
      tradeMap,
      marketMap,
      marketArray,
      setTradeCalcData,
      setTradeData,
      setMarket,
      realMarket,
    ]
  );

  const callPairDetailInfoAPIs = React.useCallback(async () => {
    if (market && LoopringAPI.defiAPI && marketMap && marketMap[market]) {
      try {
        const { depth } = await dexSwapDependAsync({
          // @ts-ignore
          market: marketMap[market]?.btradeMarket,
          tokenMap,
        });
        updateTradeBtrade({
          // @ts-ignore
          market,
          depth,
          ...marketMap[market],
        });
        myLog("useBtradeSwap:", market, depth?.symbol);
      } catch (error: any) {
        myLog("useBtradeSwap:", error, "go to LRC-USDT");
        resetTradeCalcData(undefined, market);
      }
    }
  }, [market, marketMap]);
  const reCalculateDataWhenValueChange = React.useCallback(
    (_tradeData, _tradePair?, type?) => {
      const {
        tradeBtrade: { depth, tradePair },
      } = store.getState()._router_tradeBtrade;

      const walletMap = tradeCalcData?.walletMap as WalletMap<any>;

      myLog(
        "useBtradeSwap:reCalculateDataWhenValueChange",
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
        let totalFee = undefined;
        let stob: string | undefined = undefined;
        let btos: string | undefined = undefined;
        let minimumReceived;
        let sellMinAmtInfo = undefined;
        let sellMaxAmtInfo = undefined;
        let sellMaxL2AmtInfo = undefined;
        let totalFeeRaw = undefined;
        let totalQuote = undefined;
        let poolToVol: any = undefined;
        const info: sdk.BTRADE_MARKET = marketMap[market];
        let maxFeeBips = info.feeBips ?? MAPFEEBIPS;

        const { btradeAmount, minAmount, l2Amount } = info;
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
          slipBips: sdk.toBig(defaultSlipage).times(100).toString(),
        });
        if (
          btradeAmount &&
          l2Amount &&
          (sellBuyStr == market
            ? btradeAmount.base !== "0"
            : btradeAmount.quote !== "0")
        ) {
          if (
            (sellBuyStr == market ? btradeAmount.quote : btradeAmount.base) !==
            ""
          ) {
            poolToVol =
              sdk
                .toBig(
                  sellBuyStr == market ? btradeAmount.base : btradeAmount.quote
                )
                .div("1e" + sellToken.decimals)
                .toString() ?? "0";
          }
          const sellDeepStr =
            sdk
              .toBig(
                sellBuyStr == market ? depth.bids_amtTotal : depth.asks_volTotal
              )
              .div("1e" + sellToken.decimals)
              .times(0.99)
              .toString() ?? "0";

          sellMaxAmtInfo = poolToVol
            ? BigNumber.min(sellDeepStr, poolToVol)
            : sellDeepStr;
          totalQuote = poolToVol
            ? getValuePrecisionThousand(
                BigNumber.min(sellDeepStr, poolToVol),
                sellToken.decimals,
                sellToken.decimals,
                undefined,
                false,
                { isAbbreviate: true }
              )
            : (
                sellBuyStr == market
                  ? btradeAmount.base == "0"
                  : btradeAmount.quote == "0"
              )
            ? t("labelBtradeInsufficient")
            : EmptyValueTag;
          sellMinAmtInfo = BigNumber.max(
            sellToken.orderAmounts.dust,
            sellBuyStr == market ? minAmount.base : minAmount.quote
          )
            .div("1e" + sellToken.decimals)
            .toString();
        }
        if (calcDexOutput) {
          totalFeeRaw = sdk
            .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
            .div(10000)
            .times(maxFeeBips);
          totalFee = totalFeeRaw.gt(0)
            ? getValuePrecisionThousand(
                sdk
                  .toBig(totalFeeRaw)
                  .div("1e" + buyToken.decimals)
                  .toString(),
                buyToken.precision,
                buyToken.precision,
                undefined
              )
            : 0;
          minimumReceived = sdk
            .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
            .gt(0)
            ? getValuePrecisionThousand(
                sdk
                  .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
                  .minus(totalFeeRaw ?? 0)
                  .div("1e" + buyToken.decimals)
                  .toString(),
                buyToken.precision,
                buyToken.precision,
                undefined
              )
            : 0;
          _tradeData[isAtoB ? "buy" : "sell"].tradeValue =
            !_tradeData[isAtoB ? "sell" : "buy"].tradeValue &&
            _tradeData[isAtoB ? "sell" : "buy"].tradeValue != "0"
              ? (undefined as any)
              : getValuePrecisionThousand(
                  calcDexOutput[`amount${isAtoB ? "B" : "S"}`],
                  isAtoB ? buyToken.precision : sellToken.precision,
                  isAtoB ? buyToken.precision : sellToken.precision,
                  isAtoB ? buyToken.precision : sellToken.precision
                ).replaceAll(sdk.SEP, "");
          let result = reCalcStoB({
            market,
            tradeData: _tradeData as SwapTradeData<IBData<unknown>>,
            tradePair: tradePair as any,
            marketMap,
            tokenMap: tradeMap,
          });
          stob = result?.stob;
          btos = result?.btos;
        } else {
          minimumReceived = undefined;
        }

        let _tradeCalcData: any = {
          minimumReceived,
          maxFeeBips,
          volumeSell: calcDexOutput?.sellVol as any,
          volumeBuy: calcDexOutput?.amountBSlipped?.minReceived,
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
                  { isAbbreviate: true }
                )
              : undefined,
          totalQuota: totalQuote,
          l1Pool: poolToVol,
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
        if (_tradeData?.isChecked !== undefined) {
          myLog("tradeCalcData?.isChecked", _tradeData);
          _tradeCalcData.isLockedNotificationChecked = _tradeData.isChecked;
        }
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
              stob?.replaceAll(sdk.SEP, ""),
              buyToken.precision,
              buyToken.precision,
              undefined
            ),
            BtoS: getValuePrecisionThousand(
              btos?.replaceAll(sdk.SEP, ""),
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
          sell: {
            ...state?.sell,
            ..._tradeData?.sell,
            balance: walletMap
              ? walletMap[_tradeData?.sell?.belong ?? ""]?.count
              : 0,
          },
        }));

        updateTradeBtrade({
          info: info,
          market: market as any,
          totalFee: totalFee,
          totalFeeRaw: totalFeeRaw?.toString(),
          lastStepAt: type,
          sellMinAmtInfo: sellMinAmtInfo as any,
          sellMaxL2AmtInfo: sellMaxL2AmtInfo as any,
          sellMaxAmtInfo: sellMaxAmtInfo as any,
          tradeCalcData: _tradeCalcData,
          maxFeeBips,
        });
      }
    },
    [
      account.readyState,
      tradeBtrade,
      tradeCalcData,
      tradeData,
      coinMap,
      tokenMap,
      marketArray,
    ]
  );
  const refreshWhenDepthUp = React.useCallback(() => {
    const { depth, lastStepAt, tradePair, market } = tradeBtrade;
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
      const result = reCalcStoB({
        market,
        tradeData: tradeData as SwapTradeData<IBData<unknown>>,
        tradePair: tradePair as any,

        marketMap,
        tokenMap: tradeMap,
      });
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
        _tradeCalcData = {
          ...state,
          ...tradeCalcData,
          StoB: getValuePrecisionThousand(
            (result ? result?.stob : StoB.toString())?.replaceAll(sdk.SEP, ""),
            buyToken.precision,
            buyToken.precision,
            undefined
          ),
          BtoS: getValuePrecisionThousand(
            (result ? result?.btos : BtoS.toString())?.replaceAll(sdk.SEP, ""),
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

      updateTradeBtrade({ market, tradeCalcData: _tradeCalcData });
    }
  }, [market, tradeBtrade, tradeData, tradeCalcData, setTradeCalcData]);

  const resetBtrade = (
    swapType: SwapType | undefined,
    _tradeData: SwapTradeData<IBData<C>> | undefined
  ) => {
    myLog("useBtradeSwap: resetSwap", swapType, _tradeData);
    const depth = store.getState()._router_tradeBtrade.tradeBtrade?.depth;
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
        break;
      case SwapType.BUY_SELECTED:
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
          isLockedNotificationChecked: false,
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
          "useBtradeSwap:Exchange,tradeCalcData,_tradeCalcData",
          tradeData,
          tradeCalcData,
          _tradeCalcData
        );
        callPairDetailInfoAPIs();
        updateTradeBtrade({
          market,
          tradePair: `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`,
          tradeCalcData: _tradeCalcData,
        });
        setTradeCalcData(_tradeCalcData);
        // @ts-ignore
        setTradeData((state) => {
          const walletMap = makeWalletLayer2(true).walletMap;

          return {
            ...(state ?? {}),
            sell: {
              belong: _tradeCalcData.coinSell,
              tradeValue: undefined,
              balance: walletMap
                ? walletMap[_tradeCalcData.coinSell as string]?.count
                : 0,
            },
            buy: {
              belong: _tradeCalcData.coinBuy,
              tradeValue: undefined,
              balance: walletMap
                ? walletMap[_tradeCalcData.coinBuy as string]?.count
                : 0,
            },
            isChecked: undefined,
          };
        });
        break;
      default:
        myLog("useBtradeSwap:resetSwap default");
        resetTradeCalcData(undefined, market);
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
    btradeSwapSubmit,
    tradeBtrade,
    isSwapLoading: isBtradeLoading,
    market,
    isMobile,
    setToastOpen,
  };
};
