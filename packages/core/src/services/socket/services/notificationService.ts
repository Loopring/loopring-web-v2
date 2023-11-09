import { Subject } from 'rxjs'
import * as sdk from '@loopring-web/loopring-sdk'

// import { BasicListItem } from '@loopring-web/component-lib'

// export type NotificationMap<R> = {
//   [key in keyof R]: { pooled: [string, string]; lp: string }
// }
// <R extends {[key:string]:any}>
const subject = new Subject<{
  notification: sdk.UserNotification
}>()

export const notificationService = {
  sendNotification: (notification: sdk.UserNotification) => subject.next({ notification }),
  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
