import * as sdk from "@loopring-web/loopring-sdk";
import { DUAL_TYPE, toBig } from "@loopring-web/loopring-sdk";
import {
  DeFiSideCalcData,
  DeFiSideRedeemCalcData,
  DualViewInfo,
  DualViewOrder,
  getValuePrecisionThousand,
  IBData,
  myLog,
} from "@loopring-web/common-resources";
import moment from "moment";
import { BigNumber } from "bignumber.js";

export const makeDefiSideStaking = (
  info: sdk.DualProductAndPrice,
  index: sdk.DualIndex,
  rule: sdk.DualRulesCoinsInfo,
  sellSymbol: string,
  buySymbol: string,
  market: sdk.DefiMarketInfo
): DualViewInfo => {
  const { expireTime, strike, ratio, profit, dualType } = info;
  const { precisionForPrice } = market;
  myLog("makeDualViewItem", expireTime, strike, ratio, dualType);
  const [base, quote] =
    dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE
      ? [sellSymbol, buySymbol]
      : [buySymbol, sellSymbol];

  const settleRatio = toBig(profit)
    .times(ratio)
    .toFixed(6, BigNumber.ROUND_DOWN);

  const apy = toBig(settleRatio)
    .div((expireTime - Date.now()) / 86400000)
    .times(36500); // year APY
  const term = moment().to(new Date(expireTime), true);

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
  return {
    apy: (getValuePrecisionThousand(apy, 2, 2, 2, true) + "%") as any,
    settleRatio,
    term,
    strike,
    isUp: dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE ? true : false,
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

export const makeDefiSideStakingItem = (
  props: sdk.UserDualTxsHistory,
  sellSymbol: string,
  buySymbol: string,
  currentPrice: number,
  market: sdk.DefiMarketInfo
): DualViewOrder => {
  const {
    settleRatio,
    dualType,
    strike,
    productId,
    createdAt,
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
export const calcSideStaking = <T>({
  inputValue,
  deFiSideCalcData,
  tokenSell,
}: {
  inputValue: string;
  isJoin: true;
  deFiSideCalcData: DeFiSideCalcData<T>;
  tokenSell: sdk.TokenInfo;
}): {
  minSellVol: string | undefined;
  maxSellVol: string | undefined;
  sellVol: string;
  isJoin: true;
  deFiSideCalcData: DeFiSideCalcData<T>;
} => {
  const sellVol = sdk
    .toBig(inputValue ? inputValue : 0)
    .times("1e" + tokenSell.decimals);
  let dalyEarn: undefined | string = undefined;
  if (
    inputValue &&
    deFiSideCalcData.stackViewInfo.apr &&
    deFiSideCalcData.stackViewInfo.apr !== "" &&
    deFiSideCalcData.stackViewInfo.apr !== "0.00"
  ) {
    dalyEarn = sdk
      .toBig(sellVol)
      .times(deFiSideCalcData.stackViewInfo.apr)
      .div(365)
      .toString();
  } else {
    dalyEarn = undefined;
  }
  const maxSellAmount = sdk
    .toBig(deFiSideCalcData.stackViewInfo.maxAmount)
    .div("1e" + tokenSell.decimals)
    .toString();
  const minSellAmount = sdk
    .toBig(deFiSideCalcData.stackViewInfo.minAmount)
    .div("1e" + tokenSell.decimals)
    .toString();
  if (deFiSideCalcData.stackViewInfo.symbol) {
    return {
      sellVol: sellVol.toString(),
      deFiSideCalcData: {
        ...deFiSideCalcData,
        stackViewInfo: {
          ...deFiSideCalcData.stackViewInfo,
          minSellVol: deFiSideCalcData.stackViewInfo.minAmount,
          maxSellVol: deFiSideCalcData.stackViewInfo.maxAmount,
          maxSellAmount,
          minSellAmount,
          dalyEarn,
        },
      },
      isJoin: true,
      minSellVol: deFiSideCalcData.stackViewInfo.minAmount,
      maxSellVol: deFiSideCalcData.stackViewInfo.maxAmount,
    };
  } else {
    return {
      sellVol: sellVol.toString(),
      deFiSideCalcData: {
        ...deFiSideCalcData,
        stackViewInfo: {
          ...deFiSideCalcData?.stackViewInfo,
          minSellVol: undefined,
          maxSellVol: undefined,
          maxSellAmount,
          minSellAmount,
          dalyEarn,
        },
      },
      isJoin: true,
      minSellVol: undefined,
      maxSellVol: undefined,
    };
  }
};

export const calcRedeemStaking = <T extends IBData<any>, R>({
  inputValue,
  // isJoin,
  deFiSideRedeemCalcData: { stackViewInfo, coinSell, ...rest },
  tokenSell,
}: {
  inputValue: string;
  isJoin: false;
  deFiSideRedeemCalcData: DeFiSideRedeemCalcData<T>;
  tokenSell: sdk.TokenInfo;
}): {
  minSellVol: string | undefined;
  maxSellVol: string | undefined;
  sellVol: string;
  isJoin: boolean;
  deFiSideRedeemCalcData: DeFiSideRedeemCalcData<T, R>;
} => {
  let sellVol;
  if (inputValue?.toString() == coinSell.balance?.toString()) {
    sellVol = (stackViewInfo as any).remainAmount;
  } else {
    sellVol = sdk
      .toBig(inputValue ? inputValue : 0)
      .times("1e" + tokenSell.decimals);
  }

  const maxSellAmount = sdk
    .toBig((stackViewInfo as any)?.maxAmount)
    .div("1e" + tokenSell.decimals)
    .toString();
  const minSellAmount = sdk
    .toBig((stackViewInfo as any).minAmount)
    .div("1e" + tokenSell.decimals)
    .toString();

  if ((stackViewInfo as any).symbol) {
    return {
      sellVol: sellVol.toString(),
      deFiSideRedeemCalcData: {
        ...rest,
        coinSell,
        stackViewInfo: {
          ...(stackViewInfo as any),
          minSellVol: (stackViewInfo as any).minAmount,
          maxSellVol: (stackViewInfo as any).maxAmount,
          maxSellAmount,
          minSellAmount,
        },
      },
      isJoin: true,
      minSellVol: (stackViewInfo as any).minAmount,
      maxSellVol: (stackViewInfo as any).maxAmount,
    };
  } else {
    return {
      sellVol: sellVol.toString(),
      deFiSideRedeemCalcData: {
        ...rest,
        coinSell,
        stackViewInfo: {
          ...(stackViewInfo as any),
          minSellVol: undefined,
          maxSellVol: undefined,
          maxSellAmount,
          minSellAmount,
        },
      },
      isJoin: true,
      minSellVol: undefined,
      maxSellVol: undefined,
    };
  }
};
