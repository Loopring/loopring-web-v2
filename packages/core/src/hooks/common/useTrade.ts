import React from "react";

import * as sdk from "@loopring-web/loopring-sdk";

import { myError, myLog } from "@loopring-web/common-resources";
import {
  DAYS,
  getTimestampDaysLater,
  MAPFEEBIPS,
  store,
  useAmmMap,
  OrderInfoPatch,
  useAccount,
  useTokenMap,
  useSystem,
} from "../../index";
import * as _ from "lodash";

export const DefaultFeeBips = "1";

export enum PriceLevel {
  Normal,
  Lv1,
  Lv2,
}

export interface ReqParams {
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

  ammPoolSnapshot?: sdk.AmmPoolSnapshot;
  depth?: sdk.DepthData;
  slippage?: string;
}

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
  tokenAmtMap,

  depth,
  ammPoolSnapshot,
  slippage,
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

  const sellUserOrderInfo =
    tokenAmtMap && tokenAmtMap[sell]
      ? tokenAmtMap[sell].userOrderInfo
      : undefined;

  const buyUserOrderInfo =
    tokenAmtMap && tokenAmtMap[buy]
      ? tokenAmtMap[buy].userOrderInfo
      : undefined;

  const takerRate = buyUserOrderInfo ? buyUserOrderInfo.takerRate : 0;

  // myLog('makeMarketReq isBuy:', isBuy, ' sell:', sell, ' buy:', buy, ' isAtoB:', isAtoB, ' feeBips:', feeBips, ' takerRate:', takerRate)

  const maxFeeBips = parseInt(
    sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString()
  );

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
    takerRate: takerRate ? takerRate.toString() : "0",
    slipBips: slippage as string,
  });

  const minOrderInfo: (sdk.OrderInfo & OrderInfoPatch) | undefined =
    _.cloneDeep(isBuy ? buyUserOrderInfo : sellUserOrderInfo);

  if (minOrderInfo) {
    if (!isBuy) {
      // sell eth -> usdt, calc min eth from usdt min amt(100USDT)
      const minInput = sdk
        .toBig(buyUserOrderInfo?.minAmount ?? "")
        .div("1e" + buyTokenInfo.decimals)
        .toString();

      const calcTradeParamsForMin = sdk.getOutputAmount({
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
        takerRate: takerRate ? takerRate.toString() : "0",
        slipBips: slippage as string,
      });

      minOrderInfo.minAmount = calcTradeParamsForMin?.amountS as string;
      minOrderInfo.minAmtShow = sdk
        .toBig(minOrderInfo.minAmount)
        .div("1e" + sellTokenInfo.decimals)
        .toNumber();
      minOrderInfo.symbol = sell;
      minOrderInfo.minAmtCheck = sdk
        .toBig(calcTradeParams?.sellAmt ?? "")
        .gte(sdk.toBig(minOrderInfo.minAmtShow));
    } else {
      minOrderInfo.minAmtShow = sdk
        .toBig(minOrderInfo.minAmount)
        .div("1e" + buyTokenInfo.decimals)
        .toNumber();
      minOrderInfo.symbol = buy;
      minOrderInfo.minAmtCheck = sdk
        .toBig(calcTradeParams?.buyAmt ?? "")
        .gte(sdk.toBig(minOrderInfo.minAmtShow));
    }
  } else {
    myError("undefined minOrderInfo");
  }

  // myLog('makeMarketReq calcTradeParams:', calcTradeParams)

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
    maxFeeBips: MAPFEEBIPS,
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
      // sell eth -> usdt, price = 100 usdt / eth  quantity = 1 eth, calc

      // 0.032 eth 100 usdt

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

//price = USDTVol / ETHVol

//buy eth(base). ETH-USDT reversed. sell:usdt buy:eth   calc: usdt<-eth/isAtoB=false
// fee(buyToken) -> eth(base)
// percentage -> change quote vol
export function makeMarketBuyReq() {}

//sell eth(base). ETH-USDT. sell:eth buy:usdt   calc: eth->usdt/isAtoB=true
// fee(buytoken) -> usdt(quote)
// percentage -> change base vol
export function makeMarketSellReq() {}

export function usePlaceOrder() {
  const { account } = useAccount();

  const { tokenMap, marketArray } = useTokenMap();
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

        const feeBips = ammMap[ammMarket]
          ? ammMap[ammMarket].__rawConfig__.feeBips
          : 0;
        return {
          feeBips,
          tokenAmtMap,
        };
      } else {
        return {
          feeBips: undefined,
          tokenAmtMap: undefined,
        };
      }
    },
    [marketArray]
  );

  // {isBuy, amountB or amountS, (base, quote / market), feeBips, takerRate, depth, ammPoolSnapshot, slippage, }
  const makeMarketReqInHook = React.useCallback(
    (params: ReqParams) => {
      const { tokenAmtMap, feeBips } = getTokenAmtMap(params);

      // myLog('makeMarketReqInHook tokenAmtMap:', tokenAmtMap, feeBips)

      if (exchangeInfo) {
        const fullParams: ReqParams = {
          ...params,
          exchangeAddress: exchangeInfo.exchangeAddress,
          accountId: account.accountId,
          tokenMap,
          feeBips: feeBips ? feeBips.toString() : DefaultFeeBips,
          tokenAmtMap: tokenAmtMap,
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
    [account, tokenMap, marketArray, exchangeInfo]
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
    [account, tokenMap, marketArray, exchangeInfo]
  );

  return {
    makeMarketReqInHook,
    makeLimitReqInHook,
  };
}

export const getPriceImpactInfo = (
  calcTradeParams: any,
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
    priceImpactColor,
    priceLevel,
  };
};
