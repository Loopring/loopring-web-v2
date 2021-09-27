import * as sdk from 'loopring-sdk'
import BigNumber from 'bignumber.js'
import { getValuePrecisionThousand } from './util';
import { ABInfo } from 'loopring-sdk';

export function getShowStr(rawVal: string | number | undefined, fixed: number = 2, precision: number = 4) {
    if (rawVal === '0' || rawVal === 0)
        return '0'
    let newVal: any = undefined
    if (rawVal) {
        newVal = typeof (rawVal) === 'number' ? rawVal : parseFloat(rawVal)
        if (newVal > 10) {
            newVal = newVal.toFixed(fixed)
        } else {
            newVal = sdk.toBig(newVal).toPrecision(precision)
        }
    }
    return newVal
}

export type DepthData = {
    amtSlice: sdk.ABInfo[],
    amtTotalSlice: string[],
    priceSlice: number[],
    baseDecimal: number,
    quoteDecimal: number,
    count: number,
    maxVal: BigNumber,
    precisionForPrice: number,
    basePrecision: number,
}
export type DepthViewData = {
    price: number,
    amt: string,
    amtForShow: string,
    amtTotal: string,
    amtTotalForShow: string,
    percentage: number,
}
function genABViewDataAccumulated({
    // precisionForPrice,
    amtSlice, amtTotalSlice, priceSlice, baseDecimal, count, maxVal, basePrecision }: DepthData): DepthViewData[] {

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
            // console.log(amt)
            const amtForShow = getValuePrecisionThousand(sdk.toBig(amt).div('1e' + baseDecimal),
                undefined, undefined, basePrecision, true, { isAbbreviate: true })
            const amtTotalForShow = getValuePrecisionThousand(sdk.toBig(value).div('1e' + baseDecimal),
                undefined, undefined, basePrecision, true, { isAbbreviate: true })
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

export function depth2ViewDataAccumulated({ depth, countAsk, countBid, baseDecimal, quoteDecimal, precisionForPrice, basePrecision }: {
    depth: sdk.DepthData,
    baseDecimal: number,
    quoteDecimal: number,
    countAsk?: number,
    countBid?: number,
    maxWidth?: number,
    basePrecision: number,
    precisionForPrice: number,
}): { asks: DepthViewData[], bids: DepthViewData[] } {

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
        maxVal = BigNumber.max(sdk.toBig(askTotalSlice[askTotalSlice.length - 1]), sdk.toBig(bidTotalSlice[0]))
    } else if (askTotalSlice.length) {
        maxVal = sdk.toBig(askTotalSlice[askTotalSlice.length - 1])
    } else if (bidTotalSlice.length) {
        maxVal = sdk.toBig(bidTotalSlice[0])
    } else {
        throw new Error('no ab input!')
    }

    const asks = genABViewDataAccumulated({
        basePrecision, precisionForPrice, amtSlice: askSlice,
        amtTotalSlice: askTotalSlice, priceSlice: askPriceSlice, baseDecimal, quoteDecimal, count: countAsk, maxVal
    })

    const bids = genABViewDataAccumulated({
        basePrecision, precisionForPrice, amtSlice: bidSlice,
        amtTotalSlice: bidTotalSlice, priceSlice: bidPriceSlice, baseDecimal, quoteDecimal, count: countBid, maxVal
    })

    return {
        asks,
        bids,
    }
}

export type DepthDataNew = {
    amtSlice: sdk.ABInfo[],
    abInfoSlice: sdk.ABInfo[],
    amtTotalSlice: string[],
    priceSlice: number[],
    baseDecimal: number,
    quoteDecimal: number,
    count: number,
    maxVal: BigNumber,
    precisionForPrice: number,
    basePrecision: number,
}

function genABViewData({
    // precisionForPrice,
    amtSlice, abInfoSlice, amtTotalSlice, priceSlice, baseDecimal, count, maxVal, basePrecision }: DepthDataNew): DepthViewData[] {

    if (abInfoSlice.length < count) {
        const lastV = abInfoSlice[abInfoSlice.length - 1]
        amtSlice = amtSlice.concat(new Array(count - amtSlice.length).fill(lastV))
        abInfoSlice = abInfoSlice.concat(new Array(count - abInfoSlice.length).fill(lastV))
        priceSlice = priceSlice.concat(new Array(count - priceSlice.length).fill(0))
    }

    amtSlice = amtSlice.reverse()
    amtTotalSlice = amtTotalSlice.reverse()
    abInfoSlice = abInfoSlice.reverse()
    priceSlice = priceSlice.reverse()

    return abInfoSlice.reduce((prv, value: ABInfo, ind: number) => {
        if (amtSlice[ind] && amtSlice[ind].amt) {
            const amt = amtSlice[ind].amt
            // console.log(amt)
            const amtForShow = getValuePrecisionThousand(sdk.toBig(amt).div('1e' + baseDecimal),
                undefined, undefined, basePrecision, true, { isAbbreviate: true })
            const amtTotalForShow = getValuePrecisionThousand(sdk.toBig(amtTotalSlice[ind]).div('1e' + baseDecimal),
                undefined, undefined, basePrecision, true, { isAbbreviate: true })
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

export function depth2ViewData({ depth, countAsk, countBid, baseDecimal, quoteDecimal, precisionForPrice, basePrecision }: {
    depth: sdk.DepthData,
    baseDecimal: number,
    quoteDecimal: number,
    countAsk?: number,
    countBid?: number,
    maxWidth?: number,
    basePrecision: number,
    precisionForPrice: number,
}): { asks: DepthViewData[], bids: DepthViewData[] } {

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

    let maxVal = sdk.toBig(0)

    if (askInfoSlice.length && bidInfoSlice.length) {
        maxVal = BigNumber.max(sdk.toBig(askInfoSlice[askInfoSlice.length - 1].amt), sdk.toBig(bidInfoSlice[0].amt))
    } else if (askInfoSlice.length) {
        maxVal = sdk.toBig(askInfoSlice[askInfoSlice.length - 1].amt)
    } else if (bidInfoSlice.length) {
        maxVal = sdk.toBig(bidInfoSlice[0].amt)
    } else {
        throw new Error('no ab input!')
    }

    const asks = genABViewData({
        basePrecision, precisionForPrice, amtSlice: askSlice, amtTotalSlice: askTotalSlice,
        abInfoSlice: askInfoSlice, priceSlice: askPriceSlice, baseDecimal, quoteDecimal, count: countAsk, maxVal
    })

    const bids = genABViewData({
        basePrecision, precisionForPrice, amtSlice: bidSlice, amtTotalSlice: bidTotalSlice,
        abInfoSlice: bidInfoSlice, priceSlice: bidPriceSlice, baseDecimal, quoteDecimal, count: countBid, maxVal
    })

    return {
        asks,
        bids,
    }
}