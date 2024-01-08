/*
import { AMMMarketType, MarketType } from "./market";
*/
// import { CoinKey } from "../loopring-interface";

import { Account } from './account'
import { InvestAdvice } from '../loopring-interface'
import * as sdk from '@loopring-web/loopring-sdk'

/**
 * export enum RuleType {
 *   AMM_MINING = "AMM_MINING",
 *   SWAP_VOLUME_RANKING = "SWAP_VOLUME_RANKING",
 *   ORDERBOOK_MINING = "ORDERBOOK_MINING",
 * }
 */
export enum NOTIFY_COLOR {
  default = 'default',
  primary = 'primary',
  secondary = 'secondary',
  tertiary = 'tertiary',
}

export type INVEST_ITEM = {
  name: string
  version: string
  type: string
  bannerMobile: string
  bannerLaptop: string
  linkRule: string
  startShow: number
  endShow: number
  link: string
}

export type NOTIFICATION_ITEM = {
  version: string //localStore for visited should be unique
  name: string
  title: string
  description1: string
  description2: string
  type: string
  link: `#race-event/${number}/${number}/activities.${string}.json` | string
  linkIos: string
  linkAndroid: string
  startShow: number
  endShow: number
  color: NOTIFY_COLOR
  banner?: string
  bannerDark?: string
  webRouter?: string
  webFlag: boolean
  versionIosMin: string
  versionIosMax: string
  versionAndroidMin: string
  versionAndroidMax: string
  linkParam: string
}
export type ACTIVITY = NOTIFICATION_ITEM
export type CAMPAIGN_TAG = {
  name: string
  type?: 'activity' | 'protocol' | '' //options for Amm , activity|
  startShow: number
  endShow: number
  iconSource: string
  symbols: Array<string>
  behavior: 'tooltips' | 'link'
  content: string
  webFlag: boolean
  versionIosMin: string
  versionIosMax: string
  versionAndroidMin: string
  versionAndroidMax: string
}

export enum SCENARIO {
  ORDERBOOK = 'ORDERBOOK',
  MARKET = 'MARKET',
  AMM = 'AMM',
  FIAT = 'FIAT',
  SWAP = 'SWAP',
  VAULT = 'VAULT',
}
export type CAMPAIGNTAGCONFIG = {
  [key in SCENARIO]: CAMPAIGN_TAG[]
}
export type RedPacketConfig = {
  timeRangeMaxInSecondsToken: number
  timeRangeMaxInSecondsNFT: number
  showNFT: boolean
  showERC20Blindbox: boolean
}
export type NOTIFICATION = {
  activities: ACTIVITY[]
  activitiesInvest: ACTIVITY[]
  notifications: NOTIFICATION_ITEM[]
  invest: {
    investAdvice: InvestAdvice[]
    STAKE: InvestAdvice[]
  }
  account?: Account
  chainId: sdk.ChainId
  prev?: {
    endDate: number
    // prevMonth: string;
  }
  campaignTagConfig?: CAMPAIGNTAGCONFIG
  redPacket: RedPacketConfig
}

export type Notify = Omit<NOTIFICATION, 'prev'>
export type NOTIFICATIONHEADER<N> = {
  notifyMap: Notify
  myNotifyMap: {
    items: N[]
    total: number
    unReads: number
  }
}

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
