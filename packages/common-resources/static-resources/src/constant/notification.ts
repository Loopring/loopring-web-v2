import { AMMMarketType, MarketType } from "./market";

export enum ACTIVITY_TYPE {
  trade_mining = "trade_mining",
  swap_mining = "swap_mining",
  orderbook_mining = "orderbook_mining",
  special = "special",
}

//
export type NOTIFICATION_ITEM = {
  title: string;
  description: string;
  link: string;
  startDate: number;
  endDate: number;
};
export type ACTIVITY = {
  type: ACTIVITY_TYPE;
  link: `${number}/${number}/${number}-${number}-${number}`;
  startDate: number;
  endDate: number;
  pairs: Array<MarketType | AMMMarketType>;
  config: [string, number, number, number, number];
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
  trade_mining: {
    pairs: Array<MarketType>;
  };
  swap_mining: {
    pairs: Array<MarketType>;
  };
  orderbook_mining: {
    pairs: Array<MarketType>;
  };
  special?: Array<{
    pairs: Array<MarketType>;
    giftIcon?: string;
  }>;
};
export type Notify = Omit<NOTIFICATION, "prev"> & {
  pairs: PairType;
};
const url_path = "https://static.loopring.io/events";

export async function getNotification(
  lng: "en" | "zh" = "en"
): Promise<Notify> {
  async function buildNotification(month: string, notification: NOTIFICATION) {
    const myNotification: NOTIFICATION | undefined = await fetch(
      url_path + `/${year}/${month}/ notification.${lng}.json`
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .catch(undefined);
    if (myNotification !== undefined) {
      notification.activities = [
        ...notification.activities,
        ...myNotification.activities,
      ];
      notification.notifications = [
        ...notification.notifications,
        ...myNotification.notifications,
      ];
    }
    if (
      myNotification !== undefined &&
      myNotification.prev &&
      myNotification.prev.endDate > date.getTime()
    ) {
      await buildNotification(myNotification.prev.prevMonth, notification);
    }
  }

  const date = new Date();
  const year = date.getFullYear();
  const month = "0" + (new Date().getMonth() + 1).toString().slice(-2); //  01,02 ... 12
  const notification: NOTIFICATION = { activities: [], notifications: [] };
  await buildNotification(month, notification);
  const pairs: PairType = {
    trade_mining: {
      pairs: [],
    },
    swap_mining: {
      pairs: [],
    },
    orderbook_mining: {
      pairs: [],
    },
    special: undefined,
  };
  notification.activities = notification.activities.reduce((prev, item) => {
    if (item.endDate > date.getTime()) {
      prev.push(item);
      if (item.type === ACTIVITY_TYPE.special) {
        pairs.special = [
          ...(pairs.special ?? []),
          {
            pairs: item.pairs,
            giftIcon: item.giftIcon,
          },
        ];
      } else {
        pairs[item.type].pairs = [...pairs[item.type].pairs, ...item.pairs];
      }
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
