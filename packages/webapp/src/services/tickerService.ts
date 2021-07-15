import { Subject } from 'rxjs';
// import { TradeFloat } from '@loopring-web/component-lib/src/static-resource';
import { LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';
import { TickerData } from 'loopring-sdk';
import { makeTickerMap } from '../hooks/help';
import { TickerMap } from '../stores/ticker';

const subject = new Subject<{ tickerMap: TickerMap<{ [ key: string ]: any }> }>();

// export type TickerMap<R> = {
//     [key in keyof R]:TradeFloat
// }
// <R extends {[key:string]:any}>
  //<R>
export const tickerService = {
    sendTicker: (_tickerMap:LoopringMap<TickerData>) => {
       const tickerMap:TickerMap<{[key:string]:any}> = makeTickerMap({tickerMap:_tickerMap})
       subject.next({ tickerMap })
    },
    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};