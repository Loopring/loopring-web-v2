import {
  MarketType,
  ACTIVITY,
  NOTIFICATION_ITEM,
  StateBase,
  Notify,
} from "@loopring-web/common-resources";

/**
 * @notifyMap is only update
 */
export type NotifyStates = {
  notifyMap?: Notify | undefined;
} & StateBase;
