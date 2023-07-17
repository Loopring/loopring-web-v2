import * as sdk from '@loopring-web/loopring-sdk'
import BigNumber from 'bignumber.js'
import { getValuePrecisionThousand } from './util'
import { myError } from './log_tools'

export function getShowStr(
  rawVal: string | number | undefined,
  fixed: number = 2,
  precision: number = 4,
) {
  if (rawVal === '0' || rawVal === 0) return '0'
  let newVal: any = undefined
  if (rawVal) {
    newVal = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal)
    if (newVal > 10) {
      newVal = newVal.toFixed(fixed)
    } else {
      newVal = sdk.toBig(newVal).toPrecision(precision)
    }
  }
  return newVal
}

export type DepthData = {
  amtSlice: sdk.ABInfo[]
  amtTotalSlice: string[]
  priceSlice: number[]
  baseDecimal: number
  quoteDecimal: number
  count: number
  maxVal: BigNumber
  precisionForPrice: number
  basePrecision: number
}
export type DepthViewData = {
  price: number
  amt: string
  amtForShow: string
  amtTotal: string
  amtTotalForShow: string
  percentage: number
}
function genABViewDataAccumulated({
  // precisionForPrice,
  amtSlice,
  amtTotalSlice,
  priceSlice,
  baseDecimal,
  count,
  maxVal,
  basePrecision,
}: DepthData): DepthViewData[] {
  if (amtTotalSlice.length < count) {
    const lastV = amtTotalSlice[amtTotalSlice.length - 1]
    amtSlice = amtSlice.concat(new Array(count - amtSlice.length).fill(lastV))
    amtTotalSlice = amtTotalSlice.concat(new Array(count - amtTotalSlice.length).fill(lastV))
    priceSlice = priceSlice.concat(new Array(count - priceSlice.length).fill(0))
  }

  amtSlice = amtSlice.reverse()
  amtTotalSlice = amtTotalSlice.reverse()
  priceSlice = priceSlice.reverse()

  return amtTotalSlice.reduce((prv, value: string, ind: number) => {
    if (amtSlice[ind] && amtSlice[ind].amt) {
      const amt = amtSlice[ind].amt
      // @ts-ignore
      const amtForShow = getValuePrecisionThousand(
        sdk.toBig(amt).div('1e' + baseDecimal),
        undefined,
        undefined,
        basePrecision,
        true,
        { isAbbreviate: true },
      )
      const amtTotalForShow = getValuePrecisionThousand(
        sdk.toBig(value).div('1e' + baseDecimal),
        undefined,
        undefined,
        basePrecision,
        true,
        { isAbbreviate: true },
      )
      const percentage = maxVal.gt(sdk.toBig(0)) ? sdk.toBig(value).div(maxVal).toNumber() : 0
      prv.push({
        price: priceSlice[ind],
        amt,
        amtForShow,
        amtTotal: amtTotalSlice[ind],
        amtTotalForShow,
        percentage,
      })
    }
    return prv

    // myLog('value:', value, ' maxVal:', maxVal.toString(), percentage)
  }, [] as DepthViewData[])
}

export function depth2ViewDataAccumulated({
  depth,
  countAsk,
  countBid,
  baseDecimal,
  quoteDecimal,
  precisionForPrice,
  basePrecision,
}: {
  depth: sdk.DepthData
  baseDecimal: number
  quoteDecimal: number
  countAsk?: number
  countBid?: number
  maxWidth?: number
  basePrecision: number
  precisionForPrice: number
}): { asks: DepthViewData[]; bids: DepthViewData[] } {
  if (countAsk === undefined || countBid === undefined) {
    countAsk = 8
    countBid = 8
  }

  let askSlice = depth.asks.slice(0, countAsk)
  let askTotalSlice = depth.asks_amtTotals.slice(0, countAsk)
  let askPriceSlice = depth.asks_prices.slice(0, countAsk)

  let bidSlice = countBid > 0 ? depth.bids.slice(-countBid) : []
  let bidTotalSlice = countBid > 0 ? depth.bids_amtTotals.slice(-countBid) : []
  let bidPriceSlice = countBid > 0 ? depth.bids_prices.slice(-countBid) : []

  let maxVal = sdk.toBig(0)

  if (askTotalSlice.length && bidTotalSlice.length) {
    maxVal = BigNumber.max(
      sdk.toBig(askTotalSlice[askTotalSlice.length - 1]),
      sdk.toBig(bidTotalSlice[0]),
    )
  } else if (askTotalSlice.length) {
    maxVal = sdk.toBig(askTotalSlice[askTotalSlice.length - 1])
  } else if (bidTotalSlice.length) {
    maxVal = sdk.toBig(bidTotalSlice[0])
  } else {
    myError('no ab input!')
    // throw new Error('no ab input!')
  }

  const asks = genABViewDataAccumulated({
    basePrecision,
    precisionForPrice,
    amtSlice: askSlice,
    amtTotalSlice: askTotalSlice,
    priceSlice: askPriceSlice,
    baseDecimal,
    quoteDecimal,
    count: countAsk,
    maxVal,
  })

  const bids = genABViewDataAccumulated({
    basePrecision,
    precisionForPrice,
    amtSlice: bidSlice,
    amtTotalSlice: bidTotalSlice,
    priceSlice: bidPriceSlice,
    baseDecimal,
    quoteDecimal,
    count: countBid,
    maxVal,
  })

  return {
    asks,
    bids,
  }
}

export type DepthDataNew = {
  amtSlice: sdk.ABInfo[]
  abInfoSlice: sdk.ABInfo[]
  amtTotalSlice: string[]
  priceSlice: number[]
  baseDecimal: number
  quoteDecimal: number
  count: number
  maxVal: BigNumber
  precisionForPrice: number
  basePrecision: number
}

function genABViewData({
  // precisionForPrice,
  amtSlice,
  abInfoSlice,
  amtTotalSlice,
  priceSlice,
  baseDecimal,
  count,
  maxVal,
  basePrecision,
}: DepthDataNew): DepthViewData[] {
  if (abInfoSlice.length < count) {
    const lastV = abInfoSlice[abInfoSlice.length - 1] ?? {}
    amtSlice = amtSlice.concat(new Array(count - amtSlice.length).fill(lastV.amt))
    amtTotalSlice = amtTotalSlice.concat(
      new Array(count - amtTotalSlice.length).fill(lastV.amtTotal),
    )
    abInfoSlice = abInfoSlice.concat(new Array(count - abInfoSlice.length).fill(lastV))
    priceSlice = priceSlice.concat(new Array(count - priceSlice.length).fill(0))
  }

  amtSlice = amtSlice.reverse()
  amtTotalSlice = amtTotalSlice.reverse()
  abInfoSlice = abInfoSlice.reverse()
  priceSlice = priceSlice.reverse()

  return abInfoSlice.reduce((prv, value: sdk.ABInfo, ind: number) => {
    if (amtSlice[ind] && amtSlice[ind].amt) {
      const amt = amtSlice[ind].amt
      const amtForShow = getValuePrecisionThousand(
        sdk.toBig(amt).div('1e' + baseDecimal),
        undefined,
        undefined,
        basePrecision,
        true,
        { isAbbreviate: true },
      )
      const amtTotalForShow = getValuePrecisionThousand(
        sdk.toBig(amtTotalSlice[ind]).div('1e' + baseDecimal),
        undefined,
        undefined,
        basePrecision,
        true,
        { isAbbreviate: true },
      )
      const percentage = maxVal.gt(sdk.toBig(0)) ? sdk.toBig(value.amt).div(maxVal).toNumber() : 0
      prv.push({
        price: priceSlice[ind],
        amt,
        amtForShow,
        amtTotal: amtTotalSlice[ind],
        amtTotalForShow,
        percentage,
      })
    }
    return prv
  }, [] as DepthViewData[])
}

function getMaxAmt(askInfoSlice: sdk.ABInfo[], bidInfoSlice: sdk.ABInfo[]) {
  let maxVal = sdk.toBig(0)

  const totalLst = askInfoSlice.concat(bidInfoSlice)

  totalLst.forEach((item: sdk.ABInfo) => {
    const newAmt = sdk.toBig(item.amt)
    if (newAmt.gte(maxVal)) {
      maxVal = newAmt
    }
  })

  return maxVal
}

export function depth2ViewData({
  depth,
  countAsk,
  countBid,
  baseDecimal,
  quoteDecimal,
  precisionForPrice,
  basePrecision,
}: {
  depth: sdk.DepthData
  baseDecimal: number
  quoteDecimal: number
  countAsk?: number
  countBid?: number
  maxWidth?: number
  basePrecision: number
  precisionForPrice: number
}): { asks: DepthViewData[]; bids: DepthViewData[] } {
  if (countAsk === undefined || countBid === undefined) {
    countAsk = 8
    countBid = 8
  }

  let askSlice = depth.asks.slice(0, countAsk)
  let askInfoSlice = depth.asks.slice(0, countAsk)
  let askTotalSlice = depth.asks_amtTotals.slice(0, countAsk)
  let askPriceSlice = depth.asks_prices.slice(0, countAsk)

  let bidSlice = countBid > 0 ? depth.bids.slice(-countBid) : []
  let bidInfoSlice = countBid > 0 ? depth.bids.slice(-countBid) : []
  let bidTotalSlice = countBid > 0 ? depth.bids_amtTotals.slice(-countBid) : []
  let bidPriceSlice = countBid > 0 ? depth.bids_prices.slice(-countBid) : []

  const maxVal = getMaxAmt(askInfoSlice, bidInfoSlice)

  const asks =
    countAsk > 0
      ? genABViewData({
          basePrecision,
          precisionForPrice,
          amtSlice: askSlice,
          amtTotalSlice: askTotalSlice,
          abInfoSlice: askInfoSlice,
          priceSlice: askPriceSlice,
          baseDecimal,
          quoteDecimal,
          count: countAsk,
          maxVal,
        })
      : []

  const bids =
    countBid > 0
      ? genABViewData({
          basePrecision,
          precisionForPrice,
          amtSlice: bidSlice,
          amtTotalSlice: bidTotalSlice,
          abInfoSlice: bidInfoSlice,
          priceSlice: bidPriceSlice,
          baseDecimal,
          quoteDecimal,
          count: countBid,
          maxVal,
        })
      : []

  return {
    asks,
    bids,
  }
}
