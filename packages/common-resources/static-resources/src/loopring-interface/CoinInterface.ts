import {
  Account,
  DualCurrentPrice,
  FloatTag,
  ForexMap,
  TradeStatus,
  TradeTypes,
} from "../constant";
import * as sdk from "@loopring-web/loopring-sdk";
import React from "react";
import { TokenInfo } from "@loopring-web/loopring-sdk";

export type CoinKey<R> = keyof R;
export type PairKey<P> = keyof P;

export interface IBData<R> {
  belong: CoinKey<R>;
  balance: number;
  tradeValue: number | undefined;
}

export interface CoinInfo<R> {
  icon?: string;
  name: string;
  simpleName: CoinKey<R>;
  description?: string;
  company: string;
}
export interface WalletCoin<R> {
  belong: CoinKey<R>;
  count: number;
}

export type CoinMap<R, I = CoinInfo<R>> = {
  //[k in keyof R]: I;
  [K in CoinKey<R>]?: I;
  // [k in k extends typeof R]: I;
};

export interface FeeInfo {
  belong: string;
  fee: number | string;
  feeRaw?: string | number;
  token?: string;
  hasToken?: boolean;
  __raw__: {
    fastWithDraw: string;
    tokenId: number;
    feeRaw: string;
  };
}

export type PairMap<
  R extends { [key: string]: any },
  P = { coinA: CoinInfo<R>; coinB: CoinInfo<R> }
> = {
  [K in PairKey<R>]?: P;
};
export type WalletMap<R, I = WalletCoin<R>> = {
  [K in CoinKey<R>]?: I;
};

export type TradeCalcData<T> = {
  coinSell: keyof T; //name
  coinBuy: keyof T;
  buyPrecision: number;
  sellPrecision: number;
  // tokenA: sdk.TokenInfo,
  // tokenB: sdk.TokenInfo,
  StoB: string;
  BtoS: string;
  // marketPrecision: number,
  coinInfoMap?: CoinMap<T, CoinInfo<T>>;
  sellCoinInfoMap?: CoinMap<T, CoinInfo<T>>;
  buyCoinInfoMap?: CoinMap<T, CoinInfo<T>>;
  walletMap?: WalletMap<T, WalletCoin<T>>;
  slippage: number | string;
  // slippageTolerance: Array<number | string>,
  priceImpact: string;
  priceImpactColor: string;
  minimumReceived: string;
  fee: string;
  feeTakerRate?: number;
  tradeCost?: string;
};
export type TradeCalcProData<T> = {
  coinBase: keyof T; //name
  coinQuote: keyof T;
  StoB: string;
  BtoS: string;
  coinInfoMap?: CoinMap<T, CoinInfo<T>>;
  // sellCoinInfoMap?: CoinMap<T, CoinInfo<T>>,
  // buyCoinInfoMap?: CoinMap<T, CoinInfo<T>>,
  walletMap?: WalletMap<T, WalletCoin<T>>;
  slippage: number | string;
  // slippageTolerance: Array<number | string>,
  priceImpact: string;
  priceImpactColor: string;
  minimumReceived: string;
  fee: string;
  feeTakerRate?: number;
  tradeCost?: string;
};

/**
 *   @description coinA and coinB balance is different
 *      when is deposit the balance is from wallet balance
 *      when is withdraw the balance is from ammDeposit balance
 *
 */
export type AmmJoinData<C extends IBData<I>, I = any> = {
  coinA: C;
  coinB: C;
  slippage: number | string;
  __cache__?: {
    [key: string]: any;
  };
};

export type AmmExitData<C extends IBData<I>, I = any> = {
  coinA: C;
  coinB: C;
  coinLP: C;
  slippage: number | string;
  __cache__?: {
    [key: string]: any;
  };
};
export type DeFiCalcData<T> = {
  coinSell: T;
  coinBuy: T;
  AtoB: string;
  BtoA: string;
  fee: string;
};

export type DualCalcData<R, B = IBData<any>> = sdk.CalDualResult & {
  sellToken?: TokenInfo;
  buyToken?: TokenInfo;
  coinSell: B;
  dualViewInfo: R;
  balance: { [key: string]: sdk.DualBalance };
  request?: sdk.DualOrderRequest;
};

export type AmmInData<T> = {
  myCoinA: IBData<T>;
  myCoinB: IBData<T>;
  lpCoinA: IBData<T>;
  lpCoinB: IBData<T>;
  lpCoin: IBData<T>;
  AtoB: number;
  BtoA: number;
  coinInfoMap: CoinMap<T, CoinInfo<T>>;
  // walletMap: WalletMap<T, WalletCoin<T>>,
  // AmmWalletMap: WalletMap<T, WalletCoin<T>>,
  slippage: number | string;
  // slippageTolerance: Array<number | string>,
  fee: string;
  percentage: string;
};

export type AmmDetailBase<T> = {
  // name?: string,
  amountDollar?: number;
  totalLPToken?: number;
  totalA?: number;
  totalB?: number;
  rewardValue?: number;
  rewardToken?: CoinKey<T>;
  rewardValue2?: number;
  rewardToken2?: CoinKey<T>;
  feeA?: number;
  feeB?: number;
  feeDollar?: number;
  isNew?: boolean;
  isActivity?: boolean;
  APR?: number;
};

export type AmmDetail<T> = AmmDetailBase<T> & {
  coinAInfo: CoinInfo<T>;
  coinBInfo: CoinInfo<T>;
};

export type AmmCardProps<T> = AmmDetail<T> & {
  activity: AmmActivity<T>;
  tradeFloat: TradeFloat;
  handleClick: () => void;
  account: Account;
  forexMap: ForexMap<sdk.Currency>;
  popoverIdx: number;
  precisionA?: number;
  precisionB?: number;
  coinAPriceDollar: number;
  coinBPriceDollar: number;
  ammRewardRecordList: {
    amount: string;
    time: number;
  }[];
  getLiquidityMining: (market: string, size?: number) => Promise<void>;
  getMiningLinkList: (market: string) => { [key: string]: string };
  setShowRewardDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setChosenCardInfo: React.Dispatch<React.SetStateAction<any>>;
  ammInfo: any;
};

export type AmmActivity<I> = {
  market: string;
  status: sdk.AmmPoolActivityStatus;
  ruleType: string;
  totalRewards: number;
  myRewards: number;
  rewardToken: CoinInfo<I>;
  duration: {
    from: Date;
    to: Date;
  };
  isPass?: boolean;
  rewardTokenDollar?: number;
  maxSpread?: number;
};
export type Amount<T> = {
  sell: { belong: T; tradeValue: number };
  buy: { belong: T; tradeValue: number };
};

export type TradeBasic<T> = {
  side: keyof typeof TradeTypes;
  amount: Amount<T>;
  time: number; // timestamp
  fee: number;

  // actionsStatus: object;
};
export type Trade<T> = TradeBasic<T> & {
  priceValue: number;
  priceToken: T;
};

export type AmmTrade<T> = TradeBasic<T> & {
  priceValue: number;
  priceToken: T;
};

export type AmmRecord<T> = TradeBasic<T> & {
  amountLP: Amount<T>;
};

export type OrderTrade<T> = TradeBasic<T> & {
  average: number;
  filledAmount: Amount<T>;
  filledPrice: number;
  status: keyof typeof TradeStatus;
};

//ACD extends AmmInData<any>
export type AmmDetailExtend<ACD, T> = {
  ammCalcData: ACD;
} & AmmDetail<T>;

export type AmmDetailExtendProps<ACD, T> = AmmDetailExtend<ACD, T> & {
  tradeFloat: TradeFloat;
  activity?: AmmActivity<any>;
};
export type MyAmmLP<T> = {
  smallBalance?: boolean;
  balanceA: number | undefined;
  balanceB: number | undefined;
  balanceDollar: number | undefined;
  feeA: number | undefined;
  feeB: number | undefined;
  feeDollar?: number | undefined;
  reward?: number | undefined;
  rewardToken: CoinInfo<T> | undefined;
  reward2?: number | undefined;
  rewardToken2?: CoinInfo<T> | undefined;
  rewardDollar?: number | undefined;
  totalLpAmount?: number | undefined;
};

export type TradeFloat = {
  // value: number,
  change?: any;
  timeUnit: "24h" | "all";
  priceDollar: number;
  floatTag: keyof typeof FloatTag;
  reward?: number;
  rewardToken?: string;
  volume?: number;
  close?: number;
  high?: number;
  low?: number;
  changeDollar?: number;
  closeDollar?: number;
};

export enum EXPLORE_TYPE {
  TRANSFER = "transfer",
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  OFFCHAIN_WITHDRAWAL = "withdraw",
  NFTMINT = "nftMint",
  NFTWITHDRAW = "nftWithdraw",
  NFTTRANSFER = "nftTransfer",
}

/**
 * CollectionMeta
 * @property name string useToCreate Collection
 * @property name string
 * @property tileUri string option
 * @property owner? string option
 * @property nftFactory? string option
 * @property baseUri? string option
 * @property collectionTitle? string option
 * @property description? string option
 * @property avatar? string option
 * @property banner? string option
 * @property thumbnail? string option
 * @property cid? string option
 *
 */
export type CollectionMeta = sdk.CollectionMeta & {
  extends: { [key: string]: any };
};
export type CollectionMetaJSON = {
  contract: string;
  thumbnail_uri: string;
  banner_uri: string;
  avatar_uri: string;
  tile_uri: string;
  name: string;
  description: string;
  [key: string]: any;
};

export enum CollectionMetaKey {
  name = "name",
  tileUri = "tileUri",
  owner = "owner",
  nftFactory = "nftFactory",
  baseUri = "baseUri",
  collectionTitle = "collectionTitle",
  description = "description",
  avatar = "avatar",
  banner = "banner",
  thumbnail = "thumbnail",
  cid = "cid",
}

export type MakeMeta<Co = CollectionMeta> = (props: {
  collection: Co;
  domain: string;
}) => {
  metaDemo: any;
};

export type GET_IPFS_STRING = (
  url: string | undefined,
  basicURl: string
) => string;

export type DualViewInfo = {
  apy: string;
  settleRatio: string;
  term: string;
  strike: string;
  isUp: boolean;
  expireTime: number;
  currentPrice: DualCurrentPrice;
  productId: string;
  sellSymbol: string;
  buySymbol: string;
  __raw__: {
    info: sdk.DualProductAndPrice;
    index: sdk.DualIndex;
    rule: sdk.DualRulesCoinsInfo;
  };
};
