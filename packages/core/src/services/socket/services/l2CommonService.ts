import { Subject } from 'rxjs'
import { WsL2Common } from '@loopring-web/loopring-sdk/src/defs/ws_defs'
const subject = new Subject<{ nftDatas: string[] } | undefined>()

export const l2CommonService2Service = {
  sendUserUpdate: (props?: { data: WsL2Common } | undefined) => {
    subject.next(props ?? undefined)
  },
  onSocket: () => subject.asObservable(),
}
