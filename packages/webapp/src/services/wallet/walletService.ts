import { Subject } from 'rxjs';

import * as loopring_defs from 'loopring-sdk';
import store from '../../stores';
// import { CoinKey } from '@loopring-web/common-resources';
//CoinKey<any>
const subject = new Subject<{[key:string ]:loopring_defs.UserBalanceInfo}>();

// export type TickerMap<R> = {
//     [key in keyof R]:TradeFloat
// }
// <R extends {[key:string]:any}>
  //<R>
export const walletService = {
    sendAccount: (account:loopring_defs.UserBalanceInfo) => {
        const {idIndex} = store.getState().tokenMap;
       // const tickerMap:TickerMap<{[key:string]:any}> = makeTickerMap({tickerMap:_tickerMap})
        if(account && idIndex ){
            const balance = { [ idIndex[ account.tokenId ] ]: account }
            subject.next(balance)

        }
    },
    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};