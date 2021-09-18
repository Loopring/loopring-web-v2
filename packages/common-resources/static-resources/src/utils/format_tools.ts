import * as sdk from 'loopring-sdk'
import BigNumber from 'bignumber.js'
import { myLog } from './log_tools'

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

function genABViewData({amtSlice, amtTotalSlice, priceSlice, baseDecimal, count, maxVal, }: {
    amtSlice: sdk.ABInfo[],
    amtTotalSlice: string[], 
    priceSlice: number[], 
    baseDecimal: number,
    quoteDecimal: number,
    count: number, 
    maxVal: BigNumber
}) {

    if (amtTotalSlice.length < count) {
        const lastV = amtTotalSlice[amtTotalSlice.length - 1]
        amtSlice = amtSlice.concat(new Array(count - amtSlice.length).fill(lastV))
        amtTotalSlice = amtTotalSlice.concat(new Array(count - amtTotalSlice.length).fill(lastV))
        priceSlice = priceSlice.concat(new Array(count - priceSlice.length).fill(0))
    }

    amtSlice = amtSlice.reverse()
    amtTotalSlice = amtTotalSlice.reverse()
    priceSlice = priceSlice.reverse()

    const viewData = amtTotalSlice.map((value: string, ind: number) => {
        const amt = amtSlice[ind].amt
        const amtForShow = sdk.toBig(amtSlice[ind].amt).div('1e' + baseDecimal).toString()
        const amtTotalForShow = sdk.toBig(value).div('1e' + baseDecimal).toString()
        const percentage = maxVal.gt(sdk.toBig(0)) ? sdk.toBig(value).div(maxVal).toNumber() : 0

        // myLog('value:', value, ' maxVal:', maxVal.toString(), percentage)

        return {
            price: priceSlice[ind],
            amt,
            amtForShow,
            amtTotal: amtTotalSlice[ind],
            amtTotalForShow,
            percentage,
        }
    })

    return viewData

}

export function depth2ViewData({ depth, count, baseDecimal, quoteDecimal, }: {
    depth: sdk.DepthData, 
    baseDecimal: number,
    quoteDecimal: number,
    count?: number, 
    maxWidth?: number,
}) {

    if (count === undefined) {
        count = 10
    }
    
    let askSlice = depth.asks.slice(0, count)
    let askTotalSlice = depth.asks_amtTotals.slice(0, count)
    let askPriceSlice = depth.asks_prices.slice(0, count)

    let bidSlice = depth.bids.slice(0, count)
    let bidTotalSlice = depth.bids_amtTotals.slice(-count)
    let bidPriceSlice = depth.bids_prices.slice(-count)

    const maxVal = BigNumber.max(sdk.toBig(askTotalSlice[askTotalSlice.length - 1]), sdk.toBig(bidTotalSlice[0]))

    const asks = genABViewData({amtSlice: askSlice, amtTotalSlice: askTotalSlice, priceSlice: askPriceSlice, baseDecimal, quoteDecimal, count, maxVal})

    const bids = genABViewData({amtSlice: bidSlice, amtTotalSlice: bidTotalSlice, priceSlice: bidPriceSlice, baseDecimal, quoteDecimal, count, maxVal})

    return {
        asks,
        bids,
    }
}