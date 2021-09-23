import * as sdk from 'loopring-sdk'
import BigNumber from 'bignumber.js'
import { getValuePrecisionThousand } from './util';

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

export type DepthData  = {
    amtSlice: sdk.ABInfo[],
    amtTotalSlice: string[],
    priceSlice: number[],
    baseDecimal: number,
    quoteDecimal: number,
    count: number,
    maxVal: BigNumber,
    precisionForPrice: number
}
export type DepthViewData = {
    price: number,
    amt:string,
    amtForShow: string,
    amtTotal: string,
    amtTotalForShow: string,
    percentage : number,
}
function genABViewData({precisionForPrice,amtSlice, amtTotalSlice, priceSlice, baseDecimal, count, maxVal, }: DepthData):DepthViewData[] {

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
        if (amtSlice[ ind ] && amtSlice[ ind ].amt) {
            const amt = amtSlice[ ind ].amt
            // console.log(amt)
            const amtForShow = getValuePrecisionThousand(sdk.toBig(amt).div('1e' + baseDecimal),
                undefined, undefined, precisionForPrice, true)
            const amtTotalForShow = getValuePrecisionThousand(sdk.toBig(value).div('1e' + baseDecimal),
                undefined, undefined, precisionForPrice, true)
            const percentage = maxVal.gt(sdk.toBig(0)) ? sdk.toBig(value).div(maxVal).toNumber() : 0
            prv.push({
                price: priceSlice[ ind ],
                amt,
                amtForShow,
                amtTotal: amtTotalSlice[ ind ],
                amtTotalForShow,
                percentage,
            })
        }
        return prv


        // myLog('value:', value, ' maxVal:', maxVal.toString(), percentage)


    }, [] as DepthViewData[])

}

export function depth2ViewData({ depth, countAsk,countBid, baseDecimal, quoteDecimal, precisionForPrice}: {
    depth: sdk.DepthData, 
    baseDecimal: number,
    quoteDecimal: number,
    countAsk?: number,
    countBid?: number,
    maxWidth?: number,
    precisionForPrice: number,
}):{asks:DepthViewData[],bids:DepthViewData[]} {

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

    if(askTotalSlice.length && bidTotalSlice.length) {
        maxVal  = BigNumber.max(sdk.toBig(askTotalSlice[askTotalSlice.length - 1]), sdk.toBig(bidTotalSlice[0]))
    } else if (askTotalSlice.length) {
        maxVal = sdk.toBig(askTotalSlice[askTotalSlice.length - 1])
    } else if (bidTotalSlice.length) {
        maxVal = sdk.toBig(bidTotalSlice[0])
    } else {
        throw new Error('no ab input!')
    }

    const asks = genABViewData({precisionForPrice,amtSlice: askSlice,
        amtTotalSlice: askTotalSlice, priceSlice: askPriceSlice, baseDecimal, quoteDecimal, count:countAsk, maxVal})

    const bids = genABViewData({precisionForPrice,amtSlice: bidSlice,
        amtTotalSlice: bidTotalSlice, priceSlice: bidPriceSlice, baseDecimal, quoteDecimal, count:countBid, maxVal})

    return {
        asks,
        bids,
    }
}