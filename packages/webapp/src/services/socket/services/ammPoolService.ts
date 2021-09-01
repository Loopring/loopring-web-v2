import { Subject } from 'rxjs';
import { TradeFloat } from '@loopring-web/common-resources';

const subject = new Subject();

export type AmmPoolMap<R> = {
    [key in keyof R]: TradeFloat
}
// <R extends {[key:string]:any}>

export const ammPoolService = {
    sendAmmPool: (ammPoolMap: AmmPoolMap<{ [ key: string ]: any }>) => subject.next({ammPoolMap: ammPoolMap}),
    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};