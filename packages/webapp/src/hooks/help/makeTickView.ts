import { TickerData } from 'loopring-sdk';
import store from '../../stores';
import { FloatTag,TradeFloat } from '@loopring-web/component-lib/src/static-resource';
import { volumeToCountAsBigNumber } from './volumeToCount';
import { Ticker, TickerMap } from '../../stores/ticker';
import { LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';

export const makeTickView = (tick: TickerData) => {
    // const {forex} = store.getState().system;

    const price = !isNaN(tick.close) ? tick.close : 0

    const floatTag = (isNaN(tick.close) || isNaN(tick.open))  || tick.open === tick.close ? FloatTag.none : 
        tick.close > tick.open ? FloatTag.increase : FloatTag.decrease

    let _tradeFloat: Partial<TradeFloat> = {
        change: (tick.close - tick.open) / tick.open,
        timeUnit: '24h',
        priceYuan: price,
        priceDollar: price,
        floatTag,
        reward: 0,
        // APY: 0,
    }

    return _tradeFloat;
}
export  const makeTickerMap =  <R extends {[key:string]:any}>({tickerMap}:{tickerMap:LoopringMap<TickerData>}):TickerMap<{[key:string]:any}>=>{
    const {faitPrices, forex} = store.getState().system;
    return Reflect.ownKeys(tickerMap).reduce((prev, key) => {
        const item: TickerData = tickerMap[ key as any ];
        if (item && item.base && forex && faitPrices && (faitPrices[ item.base ] || faitPrices[ 'USDT' ])) {
            const volume = volumeToCountAsBigNumber(item.base, item.base_token_volume);
            //FIX: DIE is not in faitPrices
            const priceDollar = volume?.times(faitPrices[ item.base ] ? faitPrices[ item.base ].price : faitPrices[ 'USDT' ].price);
            const priceYuan = priceDollar?.times(forex);
            const change = item.change && item.change !== 0 ? item.change * 100 : undefined;

            prev[ key as keyof R] = {
                // ...item,
                timeUnit: '24h',
                priceDollar: priceDollar?.toNumber() === 0 ? undefined : priceDollar?.toNumber(),
                priceYuan: priceYuan?.toNumber() === 0 ? undefined : priceYuan?.toNumber(),
                volume: volume?.toNumber() === 0 ? undefined : volume?.toNumber(),
                floatTag: item.close > item.open ? 'increase' : 'decrease',
                change: change,
                close: isNaN(item.close) ? undefined : item.close,
                high: item.high === 0 ? undefined : item.high,
                low: item.low === 0 ? undefined : item.high,
                // APY: 0,
                reward: 0,
                rewardToken: '',
                __rawTicker__: item,
            } as Ticker;
        }
        return prev
    }, {} as TickerMap<R>)
}
