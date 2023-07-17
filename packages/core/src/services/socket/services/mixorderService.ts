import { Subject } from 'rxjs'
import { DepthData, getMidPrice } from '@loopring-web/loopring-sdk'

const subject = new Subject<{
  mixorderMap: MixorderMap<{ [key: string]: any }>
}>()

export type MixorderMap<R> = {
  [key in keyof R]: DepthData
}
// <R extends {[key:string]:any}>

export const mixorderService = {
  sendMixorder: (mixorderMap: MixorderMap<{ [key: string]: any }>) => {
    const _mixorderMap = Reflect.ownKeys(mixorderMap).reduce((pre, key) => {
      const data = mixorderMap[key as string]
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

    subject.next({ mixorderMap: _mixorderMap })
  },
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
