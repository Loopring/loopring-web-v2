import { Subject } from 'rxjs';
import { AmmPoolSnapshot } from 'loopring-sdk';

const subject = new Subject();

export type AmmPoolMap<R> = {
    [key in keyof R]: AmmPoolSnapshot
}
// <R extends {[key:string]:any}>

export const ammPoolService = {
    sendAmmPool: (ammPoolMap: AmmPoolMap<{ [ key: string ]: any }>) => subject.next({ammPoolMap: ammPoolMap}),
    // clearMessages: () => subject.next(),
    onSocket: () => subject.asObservable()
};