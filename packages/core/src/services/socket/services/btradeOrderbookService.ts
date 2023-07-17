import { Subject } from 'rxjs'
import { DepthData, getMidPrice } from '@loopring-web/loopring-sdk'

const subject = new Subject<{
  btradeOrderbookMap: BtradeOrderbookMap<{ [key: string]: any }>
}>()

export type BtradeOrderbookMap<R> = {
  [key in keyof R]: DepthData
}
// <R extends {[key:string]:any}>

export const btradeOrderbookService = {
  sendBtradeOrderBook: (btradeOrderbookMap: BtradeOrderbookMap<{ [key: string]: any }>) => {
    const _orderbookMap = Reflect.ownKeys(btradeOrderbookMap).reduce((pre, key) => {
      const data = btradeOrderbookMap[key as string]
      const { bids, asks, mid_price } = getMidPrice({
        _asks: data['asks'],
        _bids: data['bids'],
      })

      return {
        ...pre,
        [key]: {
          ...data,
          mid_price,
          bids: bids.ab_arr,
          bids_prices: bids.ab_prices,
          bids_amtTotals: bids.ab_amtTotals,
          bids_volTotals: bids.ab_volTotals,
          bids_amtTotal: bids.amtTotal.toString(),
          bids_volTotal: bids.volTotal.toString(),
          asks: asks.ab_arr,
          asks_prices: asks.ab_prices,
          asks_amtTotals: asks.ab_amtTotals,
          asks_volTotals: asks.ab_volTotals,
          asks_amtTotal: asks.amtTotal.toString(),
          asks_volTotal: asks.volTotal.toString(),
        },
      }
    }, {})

    subject.next({ btradeOrderbookMap: _orderbookMap })
  },
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
