import { Subject } from 'rxjs'
import { BasicListItem, NotificationItem } from '@loopring-web/component-lib'

// export type NotificationMap<R> = {
//   [key in keyof R]: { pooled: [string, string]; lp: string }
// }
// <R extends {[key:string]:any}>
const subject = new Subject<{
  notification: BasicListItem
}>()

export const notificationService = {
  sendNotification: (notification: BasicListItem) => subject.next({ notification }),
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
