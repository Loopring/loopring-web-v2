import { Subject } from 'rxjs'
import { MarketTradeInfo } from '@loopring-web/loopring-sdk'

const subject = new Subject<{ trades: MarketTradeInfo[] }>()

export const tradeService = {
  sendTrade: (trades: MarketTradeInfo[]) => {
    subject.next({ trades })
  },
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
