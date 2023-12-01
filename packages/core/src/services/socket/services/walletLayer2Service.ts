import { Subject } from 'rxjs'
const subject = new Subject<{ nftDatas: string[] } | undefined>()

export const walletLayer2Service = {
  sendUserUpdate: (props?: { nftDatas: string[] } | undefined) => {
    subject.next(props ?? undefined)
  },
  onSocket: () => subject.asObservable(),
}
