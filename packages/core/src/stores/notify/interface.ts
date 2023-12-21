import { Notify, StateBase } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

/**
 * @notifyMap is only update
 */
export type NotifyStates = {
  notifyMap: Notify | undefined
  myNotifyMap: {
    items: sdk.UserNotification[]
    total: number | undefined
    unReads: number | undefined
  }
} & StateBase
