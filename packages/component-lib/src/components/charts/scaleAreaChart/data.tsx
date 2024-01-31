import { ChartType } from '../'

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

const getSign = ({ data, dataIndex, close }: GetSignParams): IDataItem['sign'] => {
  let sign
  const closeLastDay = dataIndex !== 0 && data[dataIndex - 1].close
  sign = dataIndex > 0 && closeLastDay ? (closeLastDay < close ? 1 : -1) : 1
  return sign as IDataItem['sign']
}

export const getRenderData = (
  type: keyof typeof ChartType,
  data?: IOrigDataItem[],
): IDataItem[] => {
  if (!data || !Array.isArray(data)) return []
  const closeDimIdx = 3
  return data.map((o, index) => {
    if ((o as any).change) {
      return {
        ...o,
        sign: ((o as any).change ?? 0) >= 0 ? 1 : -1
      }
    } else {
      return {
        ...o,
        sign: getSign({
          type,
          data: data,
          dataIndex: index,
          open: o.open,
          close: o.close,
          closeDimIdx,
        }),
      }
    }
  })

}
export const getAprRenderData = (
  type: keyof typeof ChartType,
  data?: { apy: string; createdAt: number }[],
): { apy: string; createdAt: number }[] => {
  if (!data || !Array.isArray(data)) return []
  return data.map((o, _index) => ({
    ...o,
    sign: {
      ...o,
    },
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
  const { bidsPrices, asksPrices, bidsAmtTotals, asksAmtTotals } = data
  const formattedBidsPrices = bidsPrices.map((price: number) => ({
    type: 'bids',
    price,
  }))
  const formattedAsksPrices = asksPrices.map((price: number) => ({
    type: 'asks',
    price,
  }))
  const jointPrices = formattedBidsPrices.concat(formattedAsksPrices)
  const jointAmtTotals = bidsAmtTotals.concat(asksAmtTotals)

  const fakeData = [
    {
      price: formattedBidsPrices[formattedBidsPrices.length - 1]?.price,
      bids: 0,
    },
    {
      price: formattedAsksPrices[0]?.price,
      asks: 0,
    },
  ]

  const rawAmtTotals = jointAmtTotals.map((amount: number, index: number) =>
    jointPrices[index].type === 'bids'
      ? {
          price: jointPrices[index].price,
          bids: amount,
        }
      : {
          price: jointPrices[index].price,
          asks: amount,
        },
  )

  const filteredBidsList = rawAmtTotals.filter((o: any) => o.bids)
  const filteredAsksList = rawAmtTotals.filter((o: any) => o.asks)

  const newData = [...filteredBidsList, ...fakeData, ...filteredAsksList]

  return newData
}
