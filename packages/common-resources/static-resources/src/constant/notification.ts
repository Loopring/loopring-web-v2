/*
import { AMMMarketType, MarketType } from "./market";
*/
// import { CoinKey } from "../loopring-interface";

import { Account } from "./account";
import { InvestAdvice } from "../loopring-interface";

/**
 * export enum RuleType {
 *   AMM_MINING = "AMM_MINING",
 *   SWAP_VOLUME_RANKING = "SWAP_VOLUME_RANKING",
 *   ORDERBOOK_MINING = "ORDERBOOK_MINING",
 * }
 */
export enum NOTIFY_COLOR {
  default = "default",
  primary = "primary",
  secondary = "secondary",
  tertiary = "tertiary",
}

export type INVEST_ITEM = {
  name: string;
  version: string;
  type: string;
  bannerMobile: string;
  bannerLaptop: string;
  linkRule: string;
  startShow: number;
  endShow: number;
  link: string;
};

export type NOTIFICATION_ITEM = {
  version: string; //localStore for visited should be unique
  name: string;
  title: string;
  description1: string;
  description2: string;
  type: string;
  link: `#race-event/${number}/${number}/activities.${string}.json` | string;
  startShow: number;
  endShow: number;
  color: NOTIFY_COLOR;
  banner?: string;
  webRouter?: string;
};
export type ACTIVITY = NOTIFICATION_ITEM;
export type CAMPAIGN_TAG = {
  name: string;
  startShow: number;
  endShow: number;
  iconSource: string;
  symbols: Array<string>;
  toolTips: string;
};
export enum SCENARIO {
  orderbook = "orderbook",
  market = "market",
  Amm = "Amm",
  Fiat = "Fiat",
  swap = "swap",
}
export type CAMPAIGNTAGCONFIG = {
  [key in SCENARIO]: CAMPAIGN_TAG[];
};
export type NOTIFICATION = {
  activities: ACTIVITY[];
  notifications: NOTIFICATION_ITEM[];
  invest: {
    investAdvice: InvestAdvice[];
    STAKE: InvestAdvice[];
  };
  account?: Account;
  prev?: {
    endDate: number;
    // prevMonth: string;
  };
  campaignTagConfig?: CAMPAIGNTAGCONFIG;
};

export type Notify = Omit<NOTIFICATION, "prev">;

// export enum SCENARIO {
//   orderbook = "orderbook",
//   market = "market",
//   Amm = "Amm",
//   Fiat = "Fiat",
//   swap = "swap",
// }

// export  type  CAMPAIGNTAGCONFIG  ={
//   [key in SCENARIO]: CAMPAIGN_TAG[];
// }
