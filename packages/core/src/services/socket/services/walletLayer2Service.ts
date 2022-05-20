import { Subject } from "rxjs";

import * as loopring_defs from "@loopring-web/loopring-sdk";
import { store } from "../../../stores";
// import { CoinKey } from '@loopring-web/common-resources';
//CoinKey<any>
const subject = new Subject<
  { [key: string]: loopring_defs.UserBalanceInfo } | undefined
>();

export const walletLayer2Service = {
  sendAccount: (_balance?: loopring_defs.UserBalanceInfo) => {
    const { idIndex } = store.getState().tokenMap;
    // const tickerMap:TickerMap<{[key:string]:any}> = makeTickerMap({tickerMap:_tickerMap})
    if (_balance && idIndex) {
      const balance = { [idIndex[_balance.tokenId]]: _balance };
      subject.next(balance);
    }
  },
  sendUserUpdate: () => {
    subject.next(undefined);
  },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
};
