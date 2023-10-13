import { Notify, StateBase } from '@loopring-web/common-resources'

/**
 * @notifyMap is only update
 */
export type NotifyStates = {
  notifyMap: Notify | undefined
} & StateBase
