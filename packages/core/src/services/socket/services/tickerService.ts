import { Subject } from 'rxjs'
import { LoopringMap, TickerData } from '@loopring-web/loopring-sdk'
import { makeTickerMap } from '../../../hooks'
import { updateTicker } from '../../../stores/ticker/reducer'
import { store, TickerMap } from '../../../stores'

const subject = new Subject<{ tickerMap: TickerMap<{ [key: string]: any }> }>()

// export type TickerMap<R> = {
//     [key in keyof R]:TradeFloat
// }
// <R extends {[key:string]:any}>
//<R>
export const tickerService = {
  sendTicker: (_tickerMap: LoopringMap<TickerData>) => {
    // dispatchEvent()
    store.dispatch(updateTicker(_tickerMap))
    const tickerMap: TickerMap<{ [key: string]: any }> = makeTickerMap({
      tickerMap: _tickerMap,
    })
    subject.next({ tickerMap })
  },
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
