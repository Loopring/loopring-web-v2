import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE, toBig } from "@loopring-web/loopring-sdk";
import {
  DualViewInfo,
  DualViewOrder,
  getValuePrecisionThousand,
  myLog,
} from "@loopring-web/common-resources";
import moment from "moment";
import { BigNumber } from "bignumber.js";

export const makeDualViewItem = (
  info: sdk.DualProductAndPrice,
  index: sdk.DualIndex,
  rule: sdk.DualRulesCoinsInfo,
  sellSymbol: string,
  buySymbol: string,
  market: sdk.DefiMarketInfo
  // balance: sdk.DualBalance
): DualViewInfo => {
  // strike is targetPrice
  // ratio is  Interest
  const {
    expireTime,
    strike,
    ratio,
    // base,
    // // currency: base,
    // currency: quote,
    profit,
    dualType,
  } = info;
  const { precisionForPrice } = market;
  myLog("makeDualViewItem", expireTime, strike, ratio, dualType);
  const [base, quote] =
    dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE
      ? [sellSymbol, buySymbol]
      : [buySymbol, sellSymbol];
  // const { baseProfitStep } = rule;
  // baseProfit*ratio
  const settleRatio = toBig(profit)
    .times(ratio)
    .toFixed(6, BigNumber.ROUND_DOWN);
  // myLog(settleRatio, settleRatio);
  // const _baseProfitStep = Number(baseProfitStep);
  const apy = toBig(settleRatio)
    .div((expireTime - Date.now()) / 86400000)
    .times(36500); // year APY
  const term = moment().to(new Date(expireTime), true);

  // const currentPrice tickerMap[market];
  myLog("dual", {
    apy: getValuePrecisionThousand(apy, 2, 2, 2, true) + "%",
    settleRatio, //targetPrice
    term,
    productId: info.productId,
    expireTime,
    currentPrice: {
      base,
      quote,
      precisionForPrice,
      currentPrice: index.index,
    },
    sellSymbol,
    buySymbol,
  });
  // const apr =  info.dualPrice.ba
  return {
    apy: (getValuePrecisionThousand(apy, 2, 2, 2, true) + "%") as any,
    settleRatio, // quote Interest
    term,
    strike,
    isUp: dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE ? true : false, //sdk.toBig(strike).gt(index.index) ? true : false,
    // targetPrice,
    // subscribeData,
    productId: info.productId,
    expireTime,
    currentPrice: {
      base,
      quote,
      precisionForPrice,
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

export const makeDualOrderedItem = (
  props: sdk.UserDualTxsHistory,
  sellSymbol: string,
  buySymbol: string,
  currentPrice: number,
  market: sdk.DefiMarketInfo
  // balance: sdk.DualBalance
): DualViewOrder => {
  const {
    settleRatio,
    dualType,
    strike,
    // deliveryPrice,
    productId,
    createdAt,
    // tokenInfoOrigin,
    timeOrigin: { expireTime },
  } = props;
  const [base, quote] =
    dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE
      ? [sellSymbol, buySymbol]
      : [buySymbol, sellSymbol];

  const apy = toBig(settleRatio)
    .div((expireTime - createdAt) / 86400000)
    .times(36500); // year APY
  const term = moment().to(new Date(expireTime), true);
  const { precisionForPrice } = market;

  return {
    apy: (getValuePrecisionThousand(apy, 2, 2, 2, true) + "%") as any,
    settleRatio: settleRatio.toString(), // quote Interest
    term,
    strike: strike.toString(),
    isUp: dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE ? true : false,
    // targetPrice,
    productId,
    enterTime: createdAt,
    expireTime,
    currentPrice: {
      precisionForPrice,
      base,
      quote,
      currentPrice: currentPrice ?? 0,
    },
    sellSymbol,
    buySymbol,
    __raw__: {
      order: props,
    },
  };
};
