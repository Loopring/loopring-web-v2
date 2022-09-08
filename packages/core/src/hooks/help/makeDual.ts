import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE, toBig } from "@loopring-web/loopring-sdk";
import {
  DualViewInfo,
  getValuePrecisionThousand,
  myLog,
} from "@loopring-web/common-resources";
import moment from "moment";

// export const dualCurrentPrice = (
//   // pairASymbol: string,
//   // pairBSymbol: string,
//   dualMarket: `${string}-${string}-${string}`
// ): DualCurrentPrice => {
//   // const { tokenPrices } = store.getState().tokenPrices;
//   // const { tickerMap } = store.getState().tickerMap;
//   // const { marketArray } = store.getState().tokenMap;
//   const [, , baseDual, quoteDual] =
//     dualMarket.match(/(dual-)?(\w+)-(\w+)/i) ?? [];
//   // const { market } = getExistedMarket(marketArray, baseDual, quoteDual);
//   // const [, _base, quote] = market.match(/(\w+)-(\w+)/i);
//   // let currentPrice = tickerMap[market].close ?? tokenPrices[baseDual];
//   // currentPrice =
//   //   (quote === quoteDual ? currentPrice : 1 / currentPrice) *
//   //   tokenPrices[quote];
//   return {
//     currentPrice:dualCalcData.dualViewInfo.__raw__.index.index,
//     quote: quoteDual,
//     base: baseDual,
//   };
// };
export const makeDualViewItem = (
  info: sdk.DualProductAndPrice,
  index: sdk.DualIndex,
  rule: sdk.DualRulesCoinsInfo
  // balance: sdk.DualBalance
): DualViewInfo => {
  // strike is targetPrice
  // ratio is  Interest
  const { expireTime, strike, ratio, base, quote, dualType } = info;
  myLog("makeDualViewItem", expireTime, strike, ratio, base, quote, dualType);
  const [sellSymbol, buySymbol] =
    dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE
      ? [base, quote]
      : [quote, base];
  const { baseProfitStep } = rule;
  const settleRatio = toBig(strike).times(ratio); //quote Interest
  const _baseProfitStep = Number(baseProfitStep);
  const apy = settleRatio.div((expireTime - Date.now()) / 86400000).times(365); // year APY
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
    currentPrice: {
      base,
      quote,
      currentPrice: index.index,
    },
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
    ), // quote Interest
    term,
    strike,
    isUp: sdk.toBig(strike).gt(index.index) ? true : false,
    // targetPrice,
    // subscribeData,
    productId: info.productId,
    expireTime,
    currentPrice: {
      base,
      quote,
      currentPrice: Number(index.index),
    },
    sellSymbol,
    buySymbol,
    __raw__: {
      info,
      index,
      rule,
    },
  };
};
