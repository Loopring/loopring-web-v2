import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE, toBig } from '@loopring-web/loopring-sdk'
import {
  DeFiSideCalcData,
  DeFiSideRedeemCalcData,
  DualViewInfo,
  DualViewOrder,
  getValuePrecisionThousand,
  IBData,
  myLog,
} from '@loopring-web/common-resources'
import moment from 'moment'
import { BigNumber } from 'bignumber.js'

export const makeDefiSideStaking = (
  info: sdk.DualProductAndPrice,
  index: sdk.DualIndex,
  rule: sdk.DualRulesCoinsInfo,
  sellSymbol: string,
  buySymbol: string,
  market: sdk.DefiMarketInfo,
): DualViewInfo => {
  const { expireTime, strike, ratio, profit, dualType } = info
  const { precisionForPrice } = market
  myLog('makeDualViewItem', expireTime, strike, ratio, dualType)
  const [base, quote] =
    dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE
      ? [sellSymbol, buySymbol]
      : [buySymbol, sellSymbol]

  const settleRatio = toBig(profit).times(ratio).toFixed(6, BigNumber.ROUND_DOWN)

  const apy = toBig(settleRatio)
    .div((expireTime - Date.now()) / 86400000)
    .times(36500) // year APY
  const term = moment().to(new Date(expireTime), true)

  myLog('dual', {
    apy: getValuePrecisionThousand(apy, 2, 2, 2, true) + '%',
    settleRatio, //targetPrice
    term,
    productId: info.productId,
    expireTime,
    currentPrice: {
      base,
      quote,
      precisionForPrice,
      currentPrice: index.index,
      quoteUnit: index.quote,
    },
    sellSymbol,
    buySymbol,
  })
  return {
    apy: (getValuePrecisionThousand(apy, 2, 2, 2, true) + '%') as any,
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
      quoteUnit: index.quote,
    },
    sellSymbol,
    buySymbol,
    __raw__: {
      info,
      index,
      rule,
    },
  }
}

export const makeDefiSideStakingItem = (
  props: sdk.UserDualTxsHistory,
  sellSymbol: string,
  buySymbol: string,
  currentPrice: number,
  market: sdk.DefiMarketInfo,
): DualViewOrder => {
  const {
    settleRatio,
    dualType,
    strike,
    productId,
    createdAt,
    timeOrigin: { expireTime },
  } = props
  const [base, quote] =
    dualType.toUpperCase() === DUAL_TYPE.DUAL_BASE
      ? [sellSymbol, buySymbol]
      : [buySymbol, sellSymbol]

  const apy = toBig(settleRatio)
    .div((expireTime - createdAt) / 86400000)
    .times(36500) // year APY
  const term = moment().to(new Date(expireTime), true)
  const { precisionForPrice } = market

  return {
    apy: (getValuePrecisionThousand(apy, 2, 2, 2, true) + '%') as any,
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
  }
}
export const calcSideStaking = <T>({
  inputValue,
  deFiSideCalcData,
  tokenSell,
}: {
  inputValue: string
  isJoin: true
  deFiSideCalcData: DeFiSideCalcData<T>
  tokenSell: sdk.TokenInfo
}): {
  minSellVol: string | undefined
  maxSellVol: string | undefined
  sellVol: string
  isJoin: true
  deFiSideCalcData: DeFiSideCalcData<T>
} => {
  const sellVol = sdk.toBig(inputValue ? inputValue : 0).times('1e' + tokenSell.decimals)
  let dalyEarn: undefined | string = undefined
  if (
    inputValue &&
    deFiSideCalcData.stakeViewInfo.apr &&
    deFiSideCalcData.stakeViewInfo.apr !== '' &&
    deFiSideCalcData.stakeViewInfo.apr !== '0.00'
  ) {
    dalyEarn = sdk.toBig(sellVol).times(deFiSideCalcData.stakeViewInfo.apr).div(365).toString()
  } else {
    dalyEarn = undefined
  }
  const maxSellAmount = sdk
    .toBig(deFiSideCalcData.stakeViewInfo.maxAmount)
    .div('1e' + tokenSell.decimals)
    .toString()
  const minSellAmount = sdk
    .toBig(deFiSideCalcData.stakeViewInfo.minAmount)
    .div('1e' + tokenSell.decimals)
    .toString()
  if (deFiSideCalcData.stakeViewInfo.symbol) {
    return {
      sellVol: sellVol.toString(),
      deFiSideCalcData: {
        ...deFiSideCalcData,
        stakeViewInfo: {
          ...deFiSideCalcData.stakeViewInfo,
          minSellVol: deFiSideCalcData.stakeViewInfo.minAmount,
          maxSellVol: deFiSideCalcData.stakeViewInfo.maxAmount,
          maxSellAmount,
          minSellAmount,
          dalyEarn,
        },
      },
      isJoin: true,
      minSellVol: deFiSideCalcData.stakeViewInfo.minAmount,
      maxSellVol: deFiSideCalcData.stakeViewInfo.maxAmount,
    }
  } else {
    return {
      sellVol: sellVol.toString(),
      deFiSideCalcData: {
        ...deFiSideCalcData,
        stakeViewInfo: {
          ...deFiSideCalcData?.stakeViewInfo,
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
    }
  }
}

export const calcRedeemStaking = <T extends IBData<any>, R>({
  inputValue,
  // isJoin,
  deFiSideRedeemCalcData: { stakeViewInfo, coinSell, ...rest },
  tokenSell,
}: {
  inputValue: string
  isJoin: false
  deFiSideRedeemCalcData: DeFiSideRedeemCalcData<T>
  tokenSell: sdk.TokenInfo
}): {
  minSellVol: string | undefined
  maxSellVol: string | undefined
  sellVol: string
  isJoin: boolean
  deFiSideRedeemCalcData: DeFiSideRedeemCalcData<T, R>
} => {
  let sellVol
  if (inputValue?.toString() == coinSell.balance?.toString()) {
    sellVol = (stakeViewInfo as any).remainAmount
  } else {
    sellVol = sdk.toBig(inputValue ? inputValue : 0).times('1e' + tokenSell.decimals)
  }

  const maxSellAmount = sdk
    .toBig((stakeViewInfo as any)?.maxAmount)
    .div('1e' + tokenSell.decimals)
    .toString()
  const minSellAmount = sdk
    .toBig((stakeViewInfo as any).minAmount)
    .div('1e' + tokenSell.decimals)
    .toString()

  if ((stakeViewInfo as any).symbol) {
    return {
      sellVol: sellVol.toString(),
      deFiSideRedeemCalcData: {
        ...rest,
        coinSell,
        stakeViewInfo: {
          ...(stakeViewInfo as any),
          minSellVol: (stakeViewInfo as any).minAmount,
          maxSellVol: (stakeViewInfo as any).maxAmount,
          maxSellAmount,
          minSellAmount,
        },
      },
      isJoin: true,
      minSellVol: (stakeViewInfo as any).minAmount,
      maxSellVol: (stakeViewInfo as any).maxAmount,
    }
  } else {
    return {
      sellVol: sellVol.toString(),
      deFiSideRedeemCalcData: {
        ...rest,
        coinSell,
        stakeViewInfo: {
          ...(stakeViewInfo as any),
          minSellVol: undefined,
          maxSellVol: undefined,
          maxSellAmount,
          minSellAmount,
        },
      },
      isJoin: true,
      minSellVol: undefined,
      maxSellVol: undefined,
    }
  }
}
