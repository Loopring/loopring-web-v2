import { Subject } from 'rxjs'

export type AmmPoolMap<R> = {
  [key in keyof R]: { pooled: [string, string]; lp: string }
}
// <R extends {[key:string]:any}>
const subject = new Subject<{
  ammPoolMap: AmmPoolMap<{ [key: string]: any }>
}>()

export const ammPoolService = {
  sendAmmPool: (ammPoolMap: AmmPoolMap<{ [key: string]: any }>) => subject.next({ ammPoolMap }),
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
