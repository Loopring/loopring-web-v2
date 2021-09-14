import { Subject } from 'rxjs';
import { LoopringMap, TickerData } from 'loopring-sdk';
import { makeTickerMap } from 'hooks/help';
import { TickerMap, updateTicker } from 'stores/ticker';

const subject = new Subject<{ tickerMap: TickerMap<{ [ key: string ]: any }> }>();

// export type TickerMap<R> = {
//     [key in keyof R]:TradeFloat
// }
// <R extends {[key:string]:any}>
//<R>
export const tickerService = {
    sendTicker: (_tickerMap: LoopringMap<TickerData>) => {
        updateTicker(_tickerMap)
        const tickerMap: TickerMap<{ [ key: string ]: any }> = makeTickerMap({tickerMap: _tickerMap})
        subject.next({tickerMap})
    },
    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};