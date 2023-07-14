import { Subject } from 'rxjs'
import { MarketTradeInfo } from '@loopring-web/loopring-sdk'

const subject = new Subject<{ mixtrades: MarketTradeInfo[] }>()

export const mixtradeService = {
  sendMixtrade: (mixtrades: MarketTradeInfo[]) => {
    subject.next({ mixtrades: mixtrades })
  },
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
