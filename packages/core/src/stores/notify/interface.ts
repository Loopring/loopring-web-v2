import { NOTIFICATION_ITEM, Notify, StateBase } from '@loopring-web/common-resources'

/**
 * @notifyMap is only update
 */
export type NotifyStates = {
  notifyMap: Notify | undefined
  myNotifyMap: {
    items: NOTIFICATION_ITEM[]
    totals: number
    unReads: number
  }
} & StateBase
