import { Subject } from 'rxjs';

import * as loopring_defs from 'loopring-sdk';
import store from 'stores';

const subject = new Subject<any>();

export const SwapService = {
    sendMarket: (market:string) => {

    },
    sendUpdateWalletL2: () => {

        //subject.next(undefined)
    },
    sendInputTradeValue: (type:'sell'|'buy') => {

        //subject.next(undefined)
    },
    sendInputSlipage: () => {

        //subject.next(undefined)
    },
    sendUpdateAmountMap:()=>{

    },
    sendDependencyDate:({depth,ammPoolSnapshot,tickerMap})=>{

    },

    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};