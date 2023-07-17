import { Subject } from 'rxjs'
const subject = new Subject<{ nftDatas: string[] } | undefined>()

export const walletLayer2Service = {
  // sendAccount: (_balance?: loopring_defs.UserBalanceInfo) => {
  //   const { idIndex } = store.getState().tokenMap;
  //   // const tickerMap:TickerMap<{[key:string]:any}> = makeTickerMap({tickerMap:_tickerMap})
  //   if (_balance && idIndex) {
  //     const balance = { [idIndex[_balance.tokenId]]: _balance };
  //     subject.next(undefined);
  //   }
  // },
  sendUserUpdate: (props?: { nftDatas: string[] } | undefined) => {
    subject.next(props ?? undefined)
  },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
