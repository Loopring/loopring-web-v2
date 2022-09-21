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
  buySymbol: string
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
    dualType,
    dualPrice: { dualBid },
  } = info;
  myLog("makeDualViewItem", expireTime, strike, ratio, dualType);
  const [base, quote] =
    dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE
      ? [sellSymbol, buySymbol]
      : [buySymbol, sellSymbol];
  // const { baseProfitStep } = rule;
  // baseProfit*ratio
  const settleRatio = toBig(dualBid[0].baseProfit)
    .times(ratio)
    .toFixed(Number(rule.baseProfitStep), BigNumber.ROUND_DOWN);
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
      currentPrice: index.index,
    },
    sellSymbol,
    buySymbol,
  });
  // const apr =  info.dualPrice.ba
  return {
    apy: getValuePrecisionThousand(apy, 2, 2, 2, true) + "%",
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
  currentPrice?: number
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

  return {
    apy: getValuePrecisionThousand(apy, 2, 2, 2, true) + "%",
    settleRatio: settleRatio.toString(), // quote Interest
    term,
    strike: strike.toString(),
    isUp: dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE ? true : false,
    // targetPrice,
    productId,
    enterTime: createdAt,
    expireTime,
    currentPrice: {
      base,
      quote,
      currentPrice,
    },
    sellSymbol,
    buySymbol,
    __raw__: {
      order: props,
    },
  };
};
