import React from "react";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  AccountStatus,
  defaultSlipage,
  getValuePrecisionThousand,
  myError,
  myLog,
} from "@loopring-web/common-resources";
import {
  DAYS,
  getTimestampDaysLater,
  MAPFEEBIPS,
  OrderInfoPatch,
  store,
  useAccount,
  useAmmMap,
  useSystem,
  useTicker,
  useTokenMap,
} from "../../index";
import * as _ from "lodash";
import BigNumber from "bignumber.js";

export const DefaultFeeBips = "1";

export enum PriceLevel {
  Normal,
  Lv1,
  Lv2,
}

export type ReqParams = {
  isBuy?: boolean;

  price?: number;
  amountBase?: number;
  amountQuote?: number;
  base?: string;
  quote?: string;
  market?: string;

  tokenMap?: sdk.LoopringMap<sdk.TokenInfo>;
  marketArray?: string[];
  marketMap?: any;

  exchangeAddress?: string;
  accountId?: number;
  storageId?: number;

  feeBips?: string;

  // key is ETH or USDT
  tokenAmtMap?: { [key: string]: sdk.TokenAmount };
  tokenMarketMap?: { [key: string]: sdk.TokenAmount };

  ammPoolSnapshot?: sdk.AmmPoolSnapshot;
  depth?: sdk.DepthData;
  slippage?: string;
};

export function makeMarketReq({
  isBuy,

  amountBase,
  amountQuote,
  base,
  quote,

  tokenMap,
  marketArray,
  marketMap,

  exchangeAddress,
  accountId,
  storageId,

  feeBips,
  // tokenAmtMap,
  tokenMarketMap,
  depth,
  ammPoolSnapshot,
  slippage = (defaultSlipage * 100).toString(),
}: ReqParams) {
  if (
    !tokenMap ||
    !exchangeAddress ||
    !marketArray ||
    accountId === undefined ||
    !base ||
    !quote ||
    (!depth && !ammPoolSnapshot)
  ) {
    return {
      sellUserOrderInfo: undefined,
      buyUserOrderInfo: undefined,
      minOrderInfo: undefined,
      calcTradeParams: undefined,
      marketRequest: undefined,
    };
  }

  if (isBuy === undefined) {
    isBuy = true;
  }

  if (feeBips === undefined) {
    feeBips = DefaultFeeBips;
  }

  if (!storageId) {
    storageId = 0;
  }

  const baseTokenInfo = tokenMap[base];
  const quoteTokenInfo = tokenMap[quote];

  const sellTokenInfo = isBuy ? quoteTokenInfo : baseTokenInfo;
  const buyTokenInfo = isBuy ? baseTokenInfo : quoteTokenInfo;

  let input = (
    amountBase !== undefined
      ? amountBase
      : amountQuote !== undefined
      ? amountQuote
      : 0
  )?.toString();

  const sell = sellTokenInfo.symbol;
  const buy = buyTokenInfo.symbol;

  // buy. amountSell is not null.
  const isAtoB =
    (isBuy && amountQuote !== undefined) ||
    (!isBuy && amountBase !== undefined);

  const calcTradeParams = sdk.getOutputAmount({
    input,
    sell,
    buy,
    isAtoB,
    marketArr: marketArray,
    tokenMap: tokenMap as any,
    marketMap: marketMap as any,
    depth: depth as sdk.DepthData,
    ammPoolSnapshot: ammPoolSnapshot,
    feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
    takerRate: "0",
    slipBips: slippage,
  });

  let minOrderInfo,
    totalFeeRaw,
    totalFee,
    tradeCost,
    feeTakerRate,
    maxFeeBips: number = MAPFEEBIPS,
    buyUserOrderInfo,
    sellUserOrderInfo;
  if (tokenMarketMap && slippage) {
    buyUserOrderInfo = tokenMarketMap[buy]
      ? tokenMarketMap[buy].userOrderInfo
      : undefined;
    sellUserOrderInfo = tokenMarketMap[sell]
      ? tokenMarketMap[sell].userOrderInfo
      : undefined;
    const minSymbol = buy;
    const inputAmount = buyUserOrderInfo;

    const minInput = sdk
      .toBig(inputAmount?.minAmount ?? "")
      .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
      .div("1e" + buyTokenInfo.decimals)
      .toString();
    feeTakerRate = buyUserOrderInfo?.takerRate;
    const calcForMinAmt = sdk.getOutputAmount({
      input: minInput,
      sell,
      buy,
      isAtoB: false,
      marketArr: marketArray,
      tokenMap: tokenMap as any,
      marketMap: marketMap as any,
      depth: depth as sdk.DepthData,
      ammPoolSnapshot,
      feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
      takerRate: "0",
      slipBips: slippage,
    });

    myLog(
      `inputAmount ${minSymbol} minAmount:`,
      inputAmount?.minAmount,
      `, Market minAmount: with slippage:${slippage}:`,
      sdk
        .toBig(inputAmount?.minAmount ?? "")
        .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
        .toString(),
      `, dustToken:`,
      sell
    );

    /*** calc for Price Impact ****/
    const sellMinAmtInfo = tokenMarketMap[sellTokenInfo.symbol];
    const sellMinAmtInput = sdk
      .toBig(sellMinAmtInfo.baseOrderInfo.minAmount)
      .div("1e" + sellTokenInfo.decimals)
      .toString();

    const calcForPriceImpact = sdk.getOutputAmount({
      input: sellMinAmtInput,
      sell,
      buy,
      isAtoB: true,
      marketArr: marketArray,
      tokenMap: tokenMap as any,
      marketMap: marketMap as any,
      depth: depth as sdk.DepthData,
      ammPoolSnapshot,
      feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
      takerRate: "0",
      slipBips: "10",
    });
    myLog(
      "calcForPriceImpact input:",
      sellMinAmtInput,
      ", calcForPriceImpact basePrice: ",
      sdk.toBig(calcForPriceImpact?.output).div(sellMinAmtInput).toNumber()
    );
    const basePrice = sdk
      .toBig(calcForPriceImpact?.output)
      .div(sellMinAmtInput);
    const tradePrice = sdk
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
      `isBuy:${isAtoB}, ${
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

    /**** calc for min Cost ****/
    tradeCost = tokenMarketMap[buy].tradeCost;
    let dustToken = tokenMap[buy];
    let sellToken = tokenMap[sell];
    let calcForMinCostInput = BigNumber.max(
      sdk.toBig(tradeCost).times(2),
      dustToken.orderAmounts.dust
    );

    myLog(dustToken.symbol);

    const tradeCostInput = sdk
      .toBig(calcForMinCostInput)
      .div(sdk.toBig(1).minus(sdk.toBig(slippage).div(10000)))
      .div("1e" + tokenMap[buy].decimals)
      .toString();
    const calcForMinCost = sdk.getOutputAmount({
      input: tradeCostInput,
      sell,
      buy,
      isAtoB: false,
      marketArr: marketArray,
      tokenMap: tokenMap as any,
      marketMap: marketMap as any,
      depth: depth as sdk.DepthData,
      ammPoolSnapshot,
      feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
      takerRate: "0",
      slipBips: slippage,
    });
    const minAmt = BigNumber.max(
      sellToken.orderAmounts.dust,
      calcForMinCost?.amountS ?? 0
    );
    minOrderInfo = {
      minAmount: minAmt,
      minAmtShow:
        minAmt &&
        sdk
          .toBig(minAmt)
          .times(1.1)
          .div("1e" + tokenMap[sell].decimals)
          .toNumber(),
      symbol: sell,
      minAmtCheck: sdk
        .toBig(calcTradeParams?.amountS ?? 0)
        .gte(sdk.toBig(minAmt).times(1.1) ?? 0),
    };

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
  } else {
    myError("undefined minOrderInfo");
  }

  const tradeChannel = calcTradeParams
    ? calcTradeParams.exceedDepth
      ? sdk.TradeChannel.BLANK
      : sdk.TradeChannel.MIXED
    : undefined;
  const orderType = calcTradeParams
    ? calcTradeParams.exceedDepth
      ? sdk.OrderType.ClassAmm
      : sdk.OrderType.TakerOnly
    : undefined;

  const sellTokenVol3: sdk.TokenVolumeV3 = {
    tokenId: sellTokenInfo.tokenId,
    volume: calcTradeParams?.amountS as string,
  };

  const buyTokenVol3: sdk.TokenVolumeV3 = {
    tokenId: buyTokenInfo.tokenId,
    volume: calcTradeParams?.amountBOutSlip.minReceived as string,
  };

  const marketRequest: sdk.SubmitOrderRequestV3 = {
    exchange: exchangeAddress,
    accountId,
    storageId,
    sellToken: sellTokenVol3,
    buyToken: buyTokenVol3,
    allOrNone: false,
    validUntil: getTimestampDaysLater(DAYS),
    maxFeeBips,
    fillAmountBOrS: false, // amm only false
    orderType,
    tradeChannel,
    eddsaSignature: "",
  };

  return {
    sellUserOrderInfo,
    buyUserOrderInfo,
    minOrderInfo,
    calcTradeParams: {
      ...calcTradeParams,
      maxFeeBips,
    },
    marketRequest,
    totalFee,
    maxFeeBips,
    feeTakerRate,
    tradeCost,
  };
}

export function makeLimitReq({
  isBuy,
  depth,
  price,
  amountBase,
  amountQuote,
  base,
  quote,
  tokenMap,

  exchangeAddress,
  accountId,
  storageId,

  feeBips,
  tokenAmtMap,
}: ReqParams) {
  if (
    !tokenMap ||
    !exchangeAddress ||
    !depth ||
    accountId === undefined ||
    !base ||
    !quote ||
    (!amountBase && !amountQuote)
  ) {
    myLog("got empty input!");
    return {
      sellUserOrderInfo: undefined,
      buyUserOrderInfo: undefined,
      calcTradeParams: undefined,
      limitRequest: undefined,
    };
  }

  if (price === undefined) {
    price = 0;
  }

  if (isBuy === undefined) {
    isBuy = true;
  }

  if (feeBips === undefined) {
    feeBips = DefaultFeeBips;
  }

  if (!storageId) {
    storageId = 0;
  }

  const baseTokenInfo = tokenMap[base];
  const quoteTokenInfo = tokenMap[quote];

  const sellTokenInfo = isBuy ? quoteTokenInfo : baseTokenInfo;
  const buyTokenInfo = isBuy ? baseTokenInfo : quoteTokenInfo;

  const sell = sellTokenInfo.symbol;
  const buy = buyTokenInfo.symbol;

  const sellUserOrderInfo =
    tokenAmtMap && tokenAmtMap[sell]
      ? tokenAmtMap[sell].userOrderInfo
      : undefined;

  const buyUserOrderInfo =
    tokenAmtMap && tokenAmtMap[buy]
      ? tokenAmtMap[buy].userOrderInfo
      : undefined;

  let baseVol = undefined;
  let quoteVol = undefined;

  let baseVolShow = undefined;
  let quoteVolShow = undefined;

  if (amountBase !== undefined) {
    baseVolShow = amountBase;
    baseVol = sdk.toBig(baseVolShow).times("1e" + baseTokenInfo.decimals);
    quoteVolShow = sdk
      .toBig(amountBase)
      .times(sdk.toBig(price))
      .toFixed(quoteTokenInfo.precision);
    quoteVol = sdk
      .toBig(amountBase)
      .times(sdk.toBig(price))
      .times("1e" + quoteTokenInfo.decimals);
  } else if (amountQuote !== undefined) {
    baseVolShow = sdk
      .toBig(amountQuote)
      .div(sdk.toBig(price))
      .toFixed(baseTokenInfo.precision);
    baseVol = sdk
      .toBig(amountQuote)
      .div(sdk.toBig(price))
      .times("1e" + baseTokenInfo.decimals);
    quoteVolShow = amountQuote;
    quoteVol = sdk.toBig(amountQuote).times("1e" + quoteTokenInfo.decimals);
  } else {
    throw Error("no amount info!");
  }

  const baseTokenVol3: sdk.TokenVolumeV3 = {
    tokenId: baseTokenInfo.tokenId,
    volume: baseVol.toFixed(0, 0),
  };

  const quoteTokenVol3: sdk.TokenVolumeV3 = {
    tokenId: quoteTokenInfo.tokenId,
    volume: quoteVol.toFixed(0, 0),
  };

  let minOrderInfo: (sdk.OrderInfo & OrderInfoPatch) | undefined = undefined;

  if (sellUserOrderInfo && buyUserOrderInfo) {
    if (!isBuy) {
      minOrderInfo = _.cloneDeep(buyUserOrderInfo);
      const minAmount = sdk
        .toBig(minOrderInfo.minAmount)
        .div("1e" + buyTokenInfo.decimals)
        .div(sdk.toBig(price));
      minOrderInfo.minAmtShow = minAmount.toNumber();
      minOrderInfo.minAmount = minAmount
        .times("1e" + sellTokenInfo.decimals)
        .toString();
      minOrderInfo.symbol = sell;
      minOrderInfo.minAmtCheck = baseVol.gte(sdk.toBig(minOrderInfo.minAmount));
    } else {
      minOrderInfo = _.cloneDeep(buyUserOrderInfo);
      minOrderInfo.minAmtShow = sdk
        .toBig(minOrderInfo.minAmount)
        .div("1e" + buyTokenInfo.decimals)
        .toNumber();
      minOrderInfo.symbol = buy;
      minOrderInfo.minAmtCheck = baseVol.gte(sdk.toBig(minOrderInfo.minAmount));
    }
  } else {
    // throw Error('undefined minOrderInfo')
    myError("undefined minOrderInfo");
  }

  const takerRate =
    tokenAmtMap && tokenAmtMap[baseTokenInfo.symbol]
      ? tokenAmtMap[baseTokenInfo.symbol].userOrderInfo.takerRate
      : 0;

  const maxFeeBips = parseInt(
    sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString()
  );

  const sellToken = isBuy ? quoteTokenVol3 : baseTokenVol3;
  const buyToken = isBuy ? baseTokenVol3 : quoteTokenVol3;

  const limitRequest: sdk.SubmitOrderRequestV3 = {
    exchange: exchangeAddress,
    accountId,
    storageId,
    sellToken,
    buyToken,
    allOrNone: false,
    validUntil: getTimestampDaysLater(DAYS),
    maxFeeBips: MAPFEEBIPS,
    fillAmountBOrS: false, // amm only false
    orderType: sdk.OrderType.LimitOrder,
    tradeChannel: sdk.TradeChannel.MIXED,
    eddsaSignature: "",
  };

  // myLog('limitRequest:', limitRequest)
  let priceImpact = 0;

  const ask1 = depth.asks_prices[0];
  const bid1 = depth.bids_prices[depth.bids_prices.length - 1];

  if (isBuy && ask1 && price > ask1) {
    priceImpact = (price - ask1) / ask1;
  } else if (!isBuy && bid1 && price < bid1) {
    priceImpact = (bid1 - price) / bid1;
  }

  const calcTradeParams = {
    isBuy,
    priceImpact,
    baseVol: baseVol.toFixed(),
    baseVolShow,
    quoteVol: quoteVol.toFixed(),
    quoteVolShow,
    takerRate,
    feeBips,
    maxFeeBips,
  };

  return {
    sellUserOrderInfo,
    buyUserOrderInfo,
    minOrderInfo,
    calcTradeParams,
    limitRequest,
  };
}

export function usePlaceOrder() {
  const { account } = useAccount();

  const { tokenMap, marketArray } = useTokenMap();
  const { tickerMap } = useTicker();
  const { ammMap } = useAmmMap();

  const { exchangeInfo } = useSystem();

  const getTokenAmtMap = React.useCallback(
    (params: ReqParams) => {
      const { amountMap } = store.getState().amountMap;
      if (ammMap && marketArray && amountMap) {
        let base = params.base;

        let quote = params.quote;

        let market = params.market;

        let ammMarket: string;

        if (market) {
          const result = market.match(/([\w,#]+)-([\w,#]+)/i);

          if (result) {
            [, base, quote] = result;
          }
        }

        const existedMarket = sdk.getExistedMarket(marketArray, base, quote);

        params.base = existedMarket.baseShow;
        params.quote = existedMarket.quoteShow;
        market = existedMarket.market;
        ammMarket = existedMarket.amm as string;

        const tokenAmtMap = amountMap
          ? ammMap[ammMarket]
            ? amountMap[ammMarket]
            : amountMap[market as string]
          : undefined;
        const tokenMarketMap = amountMap
          ? amountMap[market as string]
          : undefined;

        const feeBips = ammMap[ammMarket]
          ? ammMap[ammMarket].__rawConfig__.feeBips
          : 0;
        return {
          feeBips,
          tokenAmtMap,
          tokenMarketMap,
        };
      } else {
        return {
          feeBips: undefined,
          tokenAmtMap: undefined,
          tokenMarketMap: undefined,
        };
      }
    },
    [ammMap, marketArray]
  );

  // {isBuy, amountB or amountS, (base, quote / market), feeBips, takerRate, depth, ammPoolSnapshot, slippage, }
  const makeMarketReqInHook = React.useCallback(
    (params: ReqParams) => {
      const { tokenAmtMap, tokenMarketMap, feeBips } = getTokenAmtMap(params);

      // myLog('makeMarketReqInHook tokenAmtMap:', tokenAmtMap, feeBips)

      if (exchangeInfo) {
        const fullParams: ReqParams = {
          ...params,
          exchangeAddress: exchangeInfo.exchangeAddress,
          accountId: account.accountId,
          tokenMap,
          feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
          tokenAmtMap,
          tokenMarketMap,
        };
        return makeMarketReq(fullParams);
      } else {
        return {
          sellUserOrderInfo: undefined,
          buyUserOrderInfo: undefined,
          minOrderInfo: undefined,
          calcTradeParams: undefined,
          marketRequest: undefined,
        };
      }
    },
    [getTokenAmtMap, exchangeInfo, account.accountId, tokenMap]
  );

  // {isBuy, price, amountB or amountS, (base, quote / market), feeBips, takerRate, }
  const makeLimitReqInHook = React.useCallback(
    (params: ReqParams) => {
      const { tokenAmtMap, feeBips } = getTokenAmtMap(params);

      myLog("makeLimitReqInHook tokenAmtMap:", tokenAmtMap, feeBips);

      if (exchangeInfo) {
        const fullParams: ReqParams = {
          ...params,
          exchangeAddress: exchangeInfo.exchangeAddress,
          accountId: account.accountId,
          tokenMap,
          feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
          tokenAmtMap: tokenAmtMap,
        };
        return makeLimitReq(fullParams);
      } else {
        myLog("makeLimitReqInHook error no tokenAmtMap", tokenAmtMap);
        return {
          sellUserOrderInfo: undefined,
          buyUserOrderInfo: undefined,
          minOrderInfo: undefined,
          calcTradeParams: undefined,
          limitRequest: undefined,
        };
      }
    },
    [getTokenAmtMap, exchangeInfo, account.accountId, tokenMap]
  );

  const makeStopLimitReqInHook = React.useCallback(
    <T extends ReqParams & { stopLimitPrice?: string | number }>(params: T) => {
      const { tokenAmtMap, feeBips } = getTokenAmtMap(params);
      const { tickerMap } = store.getState().tickerMap;
      myLog("makeLimitReqInHook tokenAmtMap:", tokenAmtMap, feeBips);
      let sellUserOrderInfo = undefined,
        buyUserOrderInfo = undefined,
        minOrderInfo = undefined,
        calcTradeParams = undefined,
        stopLimitRequest = undefined,
        stopSide = undefined;

      if (exchangeInfo && params?.depth?.symbol && params.quote && tickerMap) {
        const ticker = tickerMap[params.depth.symbol];

        // const { close } = tickerMap[params.market];
        let midStopPrice = ticker?.close; // params.depth.mid_price ?? 0;
        if (params.stopLimitPrice == undefined) {
          params.stopLimitPrice = 0;
        }

        stopSide = midStopPrice
          ? sdk.toBig(params.stopLimitPrice).lt(midStopPrice)
            ? sdk.STOP_SIDE.LESS_THAN_AND_EQUAL
            : sdk.STOP_SIDE.GREAT_THAN_AND_EQUAL
          : undefined;
        myLog(
          "stopSide",
          stopSide,
          "stopLimitPrice",
          midStopPrice,
          "stopLimitPrice",
          params.stopLimitPrice
        );

        const fullParams: T = {
          ...params,
          exchangeAddress: exchangeInfo.exchangeAddress,
          accountId: account.accountId,
          tokenMap,
          feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
          tokenAmtMap: tokenAmtMap,
        };
        const result = makeLimitReq(fullParams);
        sellUserOrderInfo = result.sellUserOrderInfo;
        buyUserOrderInfo = result.buyUserOrderInfo;
        minOrderInfo = result.minOrderInfo;
        calcTradeParams = result.calcTradeParams;
        stopLimitRequest = {
          ...result.limitRequest,
          stopPrice: params.stopLimitPrice,
          stopSide,
          extraOrderType: sdk.EXTRAORDER_TYPE.STOP_LIMIT,
        };
      } else {
        myLog("makeLimitReqInHook error no tokenAmtMap", tokenAmtMap);
      }
      return {
        // stopRange,
        sellUserOrderInfo,
        buyUserOrderInfo,
        minOrderInfo,
        calcTradeParams,
        stopLimitRequest,
      };
    },
    [getTokenAmtMap, exchangeInfo, account.accountId, tokenMap, tickerMap]
  );

  return {
    makeMarketReqInHook,
    makeLimitReqInHook,
    makeStopLimitReqInHook,
  };
}

export const getPriceImpactInfo = (
  calcTradeParams: any,
  accountStatus: keyof typeof AccountStatus | "unknown",
  isMarket: boolean = true
) => {
  let priceImpact: any = calcTradeParams?.priceImpact
    ? parseFloat(calcTradeParams?.priceImpact) * 100
    : undefined;
  let priceImpactColor = "var(--color-success)";

  let priceLevel = PriceLevel.Normal;

  if (isMarket) {
    if (priceImpact) {
      if (priceImpact > 0.1 && priceImpact <= 1) {
        priceImpactColor = "var(--color-success)";
      } else if (priceImpact > 1 && priceImpact <= 3) {
        priceImpactColor = "textPrimary";
      } else if (priceImpact > 3 && priceImpact <= 5) {
        priceImpactColor = "var(--color-warning)";
      } else if (priceImpact > 5 && priceImpact <= 10) {
        priceImpactColor = "var(--color-error)";
        priceLevel = PriceLevel.Lv1;
      } else if (priceImpact > 10) {
        priceImpactColor = "var(--color-error)";
        priceLevel = PriceLevel.Lv2;
      }
    } else {
      priceImpactColor = "var(--color-text-primary)";
    }
  } else {
    if (priceImpact > 10) {
      priceImpactColor = "var(--color-error)";
      priceLevel = PriceLevel.Lv1;
    }
  }

  return {
    value: priceImpact,
    priceImpactColor:
      accountStatus === AccountStatus.ACTIVATED
        ? priceImpactColor
        : "var(--color-text-primary)",
    priceLevel,
  };
};
