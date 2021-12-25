import { AMMMarketType, MarketType } from "./market";
import { myLog } from "../utils";

/**
 * export enum RuleType {
 *   AMM_MINING = "AMM_MINING",
 *   SWAP_VOLUME_RANKING = "SWAP_VOLUME_RANKING",
 *   ORDERBOOK_MINING = "ORDERBOOK_MINING",
 * }
 */

export enum ACTIVITY_TYPE {
  AMM_MINING = "AMM_MINING",
  SWAP_VOLUME_RANKING = "SWAP_VOLUME_RANKING",
  ORDERBOOK_MINING = "ORDERBOOK_MINING",
  SPECIAL = "SPECIAL",
}

export type NOTIFICATION_ITEM = {
  id: string; //localStore for visited should be unique
  title: string;
  description1: string;
  description2: string;
  link: string;
  startDate: number;
  endDate: number;
};
export type ACTIVITY = NOTIFICATION_ITEM & {
  type: ACTIVITY_TYPE;
  link: `${number}/${number}/${number}-${number}-${number}` | string;
  pairs: Array<MarketType | AMMMarketType>;
  config?: [string, number, number, number, number];
  giftIcon?: string;
};
export type NOTIFICATION = {
  activities: ACTIVITY[];
  notifications: NOTIFICATION_ITEM[];
  prev?: {
    endDate: number;
    prevMonth: string;
  };
};
export type PairType = {
  AMM_MINING: {
    pairs: Array<MarketType | AMMMarketType>;
  };
  SWAP_VOLUME_RANKING: {
    pairs: Array<MarketType | AMMMarketType>;
  };
  ORDERBOOK_MINING: {
    pairs: Array<MarketType | AMMMarketType>;
  };
  special?: Array<{
    pairs: Array<MarketType | AMMMarketType>;
    giftIcon?: string;
  }>;
} & {
  [key: string]:
    | {
        pairs: Array<MarketType | AMMMarketType>;
      }
    | undefined;
};
export type Notify = Omit<NOTIFICATION, "prev"> & {
  pairs: PairType;
};
const url_path = "https://static.loopring.io/events";

export async function getNotification(
  lng: "en" | "zh" = "en"
): Promise<Notify> {
  async function buildNotification(month: string, notification: NOTIFICATION) {
    try {
      const myNotification: NOTIFICATION | undefined = await fetch(
        url_path + `/${year}/${month}/notification.${lng}.json`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .catch(undefined);
      if (myNotification !== undefined) {
        notification.activities = [
          ...(notification.activities ?? []),
          ...(myNotification.activities ?? []),
        ];
        notification.notifications = [
          ...(notification.notifications ?? []),
          ...(myNotification.notifications ?? []),
        ];
      }
      if (
        myNotification !== undefined &&
        myNotification.prev &&
        myNotification.prev.endDate > date.getTime()
      ) {
        await buildNotification(myNotification.prev.prevMonth, notification);
      }
      return;
    } catch (e) {
      myLog(e);
      return;
    }
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1).toString()).slice(-2); //  01,02 ... 12
  const notification: NOTIFICATION = {
    activities: [],
    notifications: [],
  };
  await buildNotification(month, notification);
  const pairs: PairType = {
    [ACTIVITY_TYPE.ORDERBOOK_MINING]: {
      pairs: [],
    },
    [ACTIVITY_TYPE.SWAP_VOLUME_RANKING]: {
      pairs: [],
    },
    [ACTIVITY_TYPE.AMM_MINING]: {
      pairs: [],
    },
    special: undefined,
  };
  notification.activities = notification.activities.reduce((prev, item) => {
    try {
      if (item.endDate > date.getTime()) {
        prev.push(item);
        if (item.type === ACTIVITY_TYPE.SPECIAL) {
          pairs.special = [
            ...(pairs.special ?? []),
            {
              pairs: item.pairs,
              giftIcon: item.giftIcon,
            },
          ];
        } else {
          if (!pairs[item.type]) {
            // @ts-ignore
            pairs[item.type] = { pairs: [] };
          }

          pairs[item.type].pairs = pairs[item.type].pairs.concat(
            item.pairs ?? []
          );
        }
      }
    } catch (e) {
      myLog(e);
    }

    return prev;
  }, [] as ACTIVITY[]);
  notification.notifications = notification.notifications.reduce(
    (prev, item) => {
      if (item.endDate > date.getTime()) {
        prev.push(item);
      }
      return prev;
    },
    [] as NOTIFICATION_ITEM[]
  );
  return { ...notification, pairs };
}
