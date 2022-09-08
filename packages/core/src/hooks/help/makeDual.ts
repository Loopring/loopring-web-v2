import { store } from "../../stores";
import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE, getExistedMarket, toBig } from "@loopring-web/loopring-sdk";
import {
  DualCurrentPrice,
  DualViewInfo,
  getValuePrecisionThousand,
  myLog,
} from "@loopring-web/common-resources";
import moment from "moment";

export const dualCurrentPrice = (
  // pairASymbol: string,
  // pairBSymbol: string,
  dualMarket: `${string}-${string}-${string}`
): DualCurrentPrice => {
  const { tokenPrices } = store.getState().tokenPrices;
  const { tickerMap } = store.getState().tickerMap;
  const { marketArray } = store.getState().tokenMap;
  const [, , baseDual, quoteDual] =
    dualMarket.match(/(dual-)?(\w+)-(\w+)/i) ?? [];
  const { market } = getExistedMarket(marketArray, baseDual, quoteDual);
  const [, _base, quote] = market.match(/(\w+)-(\w+)/i);
  let currentPrice = tickerMap[market].close ?? tokenPrices[baseDual];
  currentPrice =
    (quote === quoteDual ? currentPrice : 1 / currentPrice) *
    tokenPrices[quote];
  return {
    currentPrice,
    quote: quoteDual,
    base: baseDual,
  };
};
export const makeDualViewItem = (
  info: sdk.DualProductAndPrice,
  index: sdk.DualIndex,
  rule: sdk.DualRulesCoinsInfo,
  currentPrice: DualCurrentPrice
  // balance: sdk.DualBalance
): DualViewInfo => {
  const { expireTime, strike, ratio, base, quote, dualType } = info;
  const [sellSymbol, buySymbol] =
    dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE
      ? [base, quote]
      : [quote, base];
  const { baseProfitStep } = rule;
  const settleRatio = toBig(strike).times(ratio);
  const _baseProfitStep = Number(baseProfitStep);
  const apy = settleRatio.div((expireTime - Date.now()) / 86400000).times(365); //
  const term = moment().to(new Date(expireTime), true);

  // const currentPrice tickerMap[market];
  myLog("dual", {
    apy: getValuePrecisionThousand(apy, 2, 2, 2, true) + "%",
    settleRatio: getValuePrecisionThousand(
      settleRatio,
      _baseProfitStep,
      _baseProfitStep,
      _baseProfitStep,
      false
    ), //targetPrice
    term,
    productId: info.productId,
    expireTime,
    currentPrice,
    sellSymbol,
    buySymbol,
  });
  // const apr =  info.dualPrice.ba
  return {
    apy: getValuePrecisionThousand(apy, 2, 2, 2, true) + "%",
    settleRatio: getValuePrecisionThousand(
      settleRatio,
      _baseProfitStep,
      _baseProfitStep,
      _baseProfitStep,
      false
    ), //targetPrice
    term,
    strike,
    isUp: sdk.toBig(settleRatio).gt(currentPrice.currentPrice) ? true : false,
    // targetPrice,
    // subscribeData,
    productId: info.productId,
    expireTime,
    currentPrice,
    sellSymbol,
    buySymbol,
    __raw__: {
      info,
      index,
      rule,
    },
  };
};
