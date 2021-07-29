import { ChartType } from '../';

export interface IOrigDataItem {
    timeStamp: number
    low: number
    high: number
    open: number
    close: number
    volume: number
}


export interface IDataItem {
    timeStamp: number
    low: number
    high: number
    open: number
    close: number
    volume: number
    sign: 1 | -1
}

export interface GetSignParams {
    type: keyof typeof ChartType
    data: any
    dataIndex: number
    open: number
    close: number
    closeDimIdx: number
}

// judge trend
const getSign = ({
                     type,
                     data,
                     dataIndex,
                     open,
                     close,
                     closeDimIdx,
                 }: GetSignParams): IDataItem['sign'] => {
    // if (type === ChartType.Trend) {
    //     // compare with last day's close
    //     return close >= data[ data.length - 1 ].close ? 1 : -1
    // }
    let sign
    if (open > close) {
        sign = -1
    } else if (open < close) {
        sign = 1
    } else {
        sign =
            dataIndex > 0
                ? // If close === open, compare with close of last record
                data[ dataIndex - 1 ][ closeDimIdx ] <= close
                    ? 1
                    : -1
                : // No record of previous, set to be positive
                1
    }

    return sign as IDataItem['sign']
}

export const getRenderData = (
    type: keyof typeof ChartType,
    data?: IOrigDataItem[]
): IDataItem[] => {
    if (!data || !Array.isArray(data)) return []
    // default index of close price
    const closeDimIdx = 3

    return data.map((o, index) => ({
        ...o,
        sign: getSign({
            type,
            data: data,
            dataIndex: index,
            open: o.open,
            close: o.close,
            closeDimIdx,
        }),
    }))
}

export interface IGetDepthDataParams {
    bidsPrices: number[]
    bidsAmtTotals: number[]
    asksPrices: number[]
    asksAmtTotals: number[]
}

export const getDepthData = (data?: IGetDepthDataParams | any) => {
    if (!data || Array.isArray(data)) return undefined
    const {bidsPrices, asksPrices, bidsAmtTotals, asksAmtTotals} = data
    const formattedBidsPrices = bidsPrices.map((price: number) => ({
        type: 'bids',
        price
    }))
    const formattedAsksPrices = asksPrices.map((price: number) => ({
        type: 'asks',
        price,
    }))
    const jointPrices = formattedBidsPrices.concat(formattedAsksPrices)
    const jointAmtTotals = bidsAmtTotals.concat(asksAmtTotals)

    return jointAmtTotals.map((amount: number, index: number) =>
        jointPrices[ index ].type === 'bids'
            ? {
                price: jointPrices[ index ].price,
                bids: amount,
            }
            : {
                price: jointPrices[ index ].price,
                asks: amount,
            }
    )
}
