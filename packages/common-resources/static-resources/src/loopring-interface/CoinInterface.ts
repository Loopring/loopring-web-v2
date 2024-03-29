import { Account, FloatTag, ForexMap, TradeStatus, TradeTypes, VaultSwapStep } from '../constant'
import * as sdk from '@loopring-web/loopring-sdk'

import React from 'react'

export type CoinKey<R> = keyof R
export type PairKey<P> = keyof P

export interface IBData<R> {
  belong: CoinKey<R>
  balance: number
  tradeValue: number | undefined
}

export interface IBDataMax<R> extends IBData<R> {
  max?: string
}

export interface CoinInfo<R> {
  icon?: string
  name: string
  simpleName: CoinKey<R>
  description?: string
  company: string
  belongAlice?: string
  [key: string]: any
}

export interface WalletCoin<R> {
  belong: CoinKey<R>
  count: number

  [key: string]: any
}

export type CoinMap<R, I = CoinInfo<R>> = {
  //[k in keyof R]: I;
  [K in CoinKey<R>]?: I
  // [k in k extends typeof R]: I;
}

export interface FeeInfo {
  belong: string
  fee: number | string
  feeRaw?: string | number
  token?: string
  hasToken?: boolean
  count?: string
  discount?: number
  __raw__: {
    fastWithDraw: string
    tokenId: number
    feeRaw: string
  }
}

export enum TokenType {
  single = 'single',
  lp = 'lp',
  defi = 'defi',
  dual = 'dual',
  nft = 'nft',
  vault = 'vault',
}

export type PairMap<
  R extends {
    [key: string]: any
  },
  P = {
    coinA: CoinInfo<R>
    coinB: CoinInfo<R>
  },
> = {
  [K in PairKey<R>]?: P
}
export type WalletMap<R, I extends WalletCoin<R> = WalletCoin<R>> = {
  [K in CoinKey<R>]?: I
}

export type TradeCalcData<T> = {
  coinSell: keyof T //name
  coinBuy: keyof T
  buyPrecision: number
  sellPrecision: number
  // tokenA: sdk.TokenInfo,
  // tokenB: sdk.TokenInfo,
  StoB: string | undefined
  BtoS: string | undefined
  // marketPrecision: number,
  coinInfoMap?: CoinMap<T, CoinInfo<T>>
  sellCoinInfoMap?: CoinMap<T, CoinInfo<T>>
  buyCoinInfoMap?: CoinMap<T, CoinInfo<T>>
  walletMap?: WalletMap<T, WalletCoin<T>>
  slippage: number | string
  // slippageTolerance: Array<number | string>,
  minimumReceived: string | undefined
  fee: string
  isReverse: boolean
  feeTakerRate?: number
  tradeCost?: string
  lastStepAt?: 'sell' | 'buy'
  totalQuota: string
  minimumConverted: string | undefined
} & (
  | {
      isBtrade: undefined | boolean
    }
  | {
      isVault: undefined | boolean
    }
)

export type SwapTradeCalcData<T> = TradeCalcData<T> & {
  isNotMatchMarketPrice?: boolean
  marketPrice?: string
  marketRatePrice?: string
  isChecked?: boolean
  slippage: number | string
  priceImpact: string
  priceImpactColor: string
  feeTakerRate?: number
  tradeCost?: string
  isShowBtradeAllow?: boolean
  minimumConverted: string | undefined
  sellMaxAmtStr?: string
  sellMinAmtStr?: string
} & (
    | {
        isBtrade: undefined | boolean
      }
    | {
        isVault: undefined | boolean
      }
  )

export enum BtradeType {
  Quantity = 'Quantity',
  Speed = 'Speed',
}

export type BtradeTradeCalcData<T> = TradeCalcData<T> & {
  isBtrade: true
  maxFeeBips: number
  lockedNotification: true
  volumeSell: string | undefined
  volumeBuy: string | undefined
  sellMinAmtStr: string | undefined
  sellMaxL2AmtStr: string | undefined
  sellMaxAmtStr: string | undefined
  l1Pool: string
  l2Pool: string
  slippage: number | string
  btradeType: BtradeType
  // totalPool: string;
}

export type VaultTradeCalcData<T> = Omit<BtradeTradeCalcData<T>, 'btradeType' | 'isBtrade'> & {
  isVault: true
  belongBuyAlice: string
  belongSellAlice: string
  supportBorrowData: VaultBorrowData
  showHasBorrow: boolean
  isRequiredBorrow: boolean
  borrowVol: string
  borrowStr: string
  step: VaultSwapStep
}

export type TradeCalcProData<T> = {
  coinBase: keyof T //name
  coinQuote: keyof T
  StoB: string
  BtoS: string
  coinInfoMap?: CoinMap<T, CoinInfo<T>>
  walletMap?: WalletMap<T, WalletCoin<T>>
  slippage: number | string
  priceImpact: string
  priceImpactColor: string
  minimumReceived: string
  fee: string
  feeTakerRate?: number
  tradeCost?: string
  lastStepAt?: 'base' | 'quote'
  stopRange?: [string | undefined, string | undefined]
  isNotMatchMarketPrice?: boolean
  marketPrice?: string
  marketRatePrice?: string
  isChecked?: boolean
  minimumConverted?: string
}

/**
 *   @description coinA and coinB balance is different
 *      when is deposit the balance is from wallet balance
 *      when is withdraw the balance is from ammDeposit balance
 *
 */
export type AmmJoinData<C extends IBData<I>, I = any> = {
  coinA: C
  coinB: C
  coinLP: C
  slippage: number | string
  __cache__?: {
    [key: string]: any
  }
}

export type AmmExitData<C extends IBData<I>, I = any> = {
  coinA: C
  coinB: C
  coinLP: C
  slippage: number | string
  __cache__?: {
    [key: string]: any
  }
}
export type DeFiCalcData<T> = {
  coinSell: T
  coinBuy: T
  AtoB: string
  BtoA: string
  fee: string
}
export type DeFiSideCalcData<T, R = sdk.STACKING_PRODUCT> = {
  coinSell: T
  stakeViewInfo: R & {
    dalyEarn?: string
    maxSellAmount?: string
    minSellAmount?: string
    maxSellVol?: string
    minSellVol?: string
  }
}
type RedeemInfo = sdk.StakeInfoOrigin &
  Omit<sdk.STACKING_PRODUCT, 'status'> & {
    status_product: number

    maxSellAmount?: string
    minSellAmount?: string
    maxSellVol?: string
    minSellVol?: string
    minAmount: string
    maxAmount: string
  }
export type DeFiSideRedeemCalcData<T, _R = RedeemInfo> = {
  coinSell: T
  stakeViewInfo: _R
}
export type DualTrade<R> = IBData<R> & {
  isRenew: boolean
  renewTargetPrice?: string
  renewDuration?: number
}

// { isRenew?: true; target; maxRecurseProductDuration: number }
export type DualCalcData<R, B = DualTrade<any>> = sdk.CalDualResult & {
  sellToken?: sdk.TokenInfo
  buyToken?: sdk.TokenInfo
  coinSell: B
  dualViewInfo: R
  balance: {
    [key: string]: sdk.DualBalance
  }
  request?: sdk.DualOrderRequest
}

export type AmmInData<T> = {
  myCoinA: IBData<T>
  myCoinB: IBData<T>
  lpCoinA: IBData<T>
  lpCoinB: IBData<T>
  lpCoin: IBData<T>
  AtoB: number
  BtoA: number
  coinInfoMap: CoinMap<T, CoinInfo<T>>
  // walletMap: WalletMap<T, WalletCoin<T>>,
  // AmmWalletMap: WalletMap<T, WalletCoin<T>>,
  slippage: number | string
  // slippageTolerance: Array<number | string>,
  fee: string
  fees: any
  percentage: string
}

export type AmmDetailBase<T> = {
  // name?: string,
  market: string
  coinA: CoinKey<T>
  coinB: CoinKey<T>
  coinAInfo: CoinInfo<T>
  coinBInfo: CoinInfo<T>
  address: string
  amountU?: string
  totalLPToken?: number
  totalA?: number
  totalB?: number
  totalAStr?: string
  totalBStr?: string
  totalAU?: number
  totalBU?: number
  rewardToken?: CoinKey<T>
  rewardA?: number
  rewardB?: number
  rewardAU?: number
  rewardBU?: number
  rewardToken2?: CoinKey<T>
  feeA?: number
  feeB?: number
  feeU?: number
  isNew?: boolean
  isActivity?: boolean
  APR?: number
  APRs?: {
    self: number
    event: number
    fee: number
  }
}

export type AmmDetail<T> = AmmDetailBase<T> & {
  exitDisable: boolean
  joinDisable: boolean
  swapDisable: boolean
  showDisable: boolean
  isRiskyMarket: boolean
  stob: string
  btos: string
  tradeFloat: Partial<TradeFloat>
  __rawConfig__: sdk.AmmPoolInfoV3
  __ammPoolState__: sdk.AmmPoolStat
} & sdk.AmmPoolInfoV3

export type AmmCardProps<T> = AmmDetail<T> & {
  activity: AmmActivity<T>
  tradeFloat: TradeFloat
  handleClick: () => void
  account: Account
  forexMap: ForexMap<sdk.Currency>
  popoverIdx: number
  precisionA?: number
  precisionB?: number
  coinAPriceU: number
  coinBPriceUr: number
  getLiquidityMining: (market: string, size?: number) => Promise<void>
  // getMiningLinkList: (market: string) => { [key: string]: string };
  setShowRewardDetail: React.Dispatch<React.SetStateAction<boolean>>
  setChosenCardInfo: React.Dispatch<React.SetStateAction<any>>
  ammInfo: any
}

export type AmmActivity<I> = {
  market: string
  status: sdk.AmmPoolActivityStatus
  ruleType: string
  totalRewards: number
  myRewards: number
  rewardToken: CoinInfo<I>
  duration: {
    from: Date
    to: Date
  }
  isPass?: boolean
  rewardTokenU?: number
  maxSpread?: number
}
export type Amount<T> = {
  sell: {
    belong: T
    tradeValue: number
  }
  buy: {
    belong: T
    tradeValue: number
  }
}

export type TradeBasic<T> = {
  side: keyof typeof TradeTypes
  amount: Amount<T>
  time: number // timestamp
  fee: number

  // actionsStatus: object;
}
export type Trade<T> = TradeBasic<T> & {
  priceValue: number
  priceToken: T
}

export type AmmTrade<T> = TradeBasic<T> & {
  priceValue: number
  priceToken: T
}

export type AmmRecord<T> = TradeBasic<T> & {
  amountLP: Amount<T>
}

export type OrderTrade<T> = TradeBasic<T> & {
  average: number
  filledAmount: Amount<T>
  filledPrice: number
  status: keyof typeof TradeStatus
}

export type AmmDetailExtend<ACD, T> = {
  ammCalcData: ACD
} & AmmDetail<T>

export type AmmDetailExtendProps<ACD, T> = AmmDetailExtend<ACD, T> & {
  tradeFloat: TradeFloat
  activity?: AmmActivity<any>
}
export type MyAmmLP<T> = {
  smallBalance?: boolean
  balanceA: number | undefined
  balanceB: number | undefined
  balanceAStr: string | undefined
  balanceBStr: string | undefined
  balanceU: number | undefined
  feeA: number | undefined
  feeB: number | undefined
  feeU: number | undefined
  reward?: number | undefined
  rewardToken: CoinInfo<T> | undefined
  reward2?: number | undefined
  rewardToken2?: CoinInfo<T> | undefined
  rewardU?: number | undefined
  totalLpAmount?: number | undefined
  feeA24: number | undefined
  feeB24: number | undefined
  feeU24: number | undefined
  reward24: number | undefined
  reward224: number | undefined
  rewardU24: number | undefined
  extraU24: number | undefined
  extraRewards24: {
    tokenSymbol: string
    amount: number
  }[]
}

export type TradeFloat = {
  // value: number,
  change?: any
  timeUnit: '24h' | 'all'
  floatTag: keyof typeof FloatTag
  reward?: number
  rewardToken?: string
  volume?: number
  volumeView?: string
  close?: number
  high?: number
  low?: number
  priceU: number
  changeU?: number
  closeU?: number
}

export enum EXPLORE_TYPE {
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  OFFCHAIN_WITHDRAWAL = 'withdraw',
  NFTMINT = 'nftMint',
  NFTWITHDRAW = 'nftWithdraw',
  NFTTRANSFER = 'nftTransfer',
  NFTSEND_BACK_LUCKY_TOKEN = 'nftTransfer',
  NFTSEND_LUCKY_TOKEN = 'nftTransfer',
  NFTWITHDRAW_LUCKY_TOKEN = 'nftWithdraw',
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
  extends: {
    [key: string]: any
  }
}
export type CollectionMetaJSON = {
  contract: string
  thumbnail_uri: string
  banner_uri: string
  avatar_uri: string
  tile_uri: string
  name: string
  description: string
  [key: string]: any
}

export enum CollectionMetaKey {
  name = 'name',
  tileUri = 'tileUri',
  owner = 'owner',
  nftFactory = 'nftFactory',
  baseUri = 'baseUri',
  collectionTitle = 'collectionTitle',
  description = 'description',
  avatar = 'avatar',
  banner = 'banner',
  thumbnail = 'thumbnail',
  cid = 'cid',
}

export type MakeMeta<Co = CollectionMeta> = (props: { collection: Co; domain: string }) => {
  metaDemo: any
}

export type GET_IPFS_STRING = (url: string | undefined, basicURl: string) => string

export type RedPacketSend = {
  type: sdk.LuckyTokenType
  signerFlag: sdk.LuckyTokenSignerFlag
  luckyToken: sdk.LuckyTokenInfo
  numbers: number
  templateID: number
  memo: string
  validSince: number
} // sdk.LuckyTokenItemForSend;

export type LuckyRedPacketItem = {
  labelKey: string
  desKey: string
  tags?: string[],
  value: {
    value: number
    partition: sdk.LuckyTokenAmountType
    mode: sdk.LuckyTokenClaimType
  }
}

export type TickerNew<R = sdk.DatacenterTokenInfoSimple> = R & {
  timeUnit: '24h'
  erc20Symbol: string
  type: TokenType
  volume: string
  priceU: string
  change: string
  __rawTicker__: R & any
  rawData: R & any
}
export type TickerNewMap<R> = {
  [key in keyof R]: TickerNew
}

export type Ticker = TradeFloat & {
  open: number
  high: number
  low: number
  close: number
  change: number
  volume: number | string
  base: string
  quote: string
  __rawTicker__: sdk.TickerData
}
export type NetworkItemInfo = {
  label: string
  chainId: string
  RPC?: string
  link?: string
  isTest?: boolean | undefined
  walletType: string
}

export const url_path = 'https://static.loopring.io/events'
export const url_test_path = 'https://static.loopring.io/events/testEvents'

export type VaultLoanData<T> = {
  coinInfoMap: CoinMap<T, CoinInfo<T>>
  tradeData: T
} & T
export type VaultBorrowData<
  T = IBData<any> & {
    erc20Symbol: string
  },
> = {
  borrowedAmt: string
  borrowedStr: string
  maxBorrowAmount: string
  maxBorrowStr: string
  minBorrowAmount: string
  minBorrowStr: string
  maxBorrowVol: string
  minBorrowVol: string
  maxQuote: string
  borrowVol: string
  borrowAmt: string
  totalQuote: string
  borrowAmtStr: string
  request: sdk.VaultBorrowRequest
} & VaultLoanData<T>

export type VaultRepayData<T> = {
  maxRepayAmount: string
  maxRepayStr: string
  minRepayAmount: string
  minRepayStr: string
  maxRepayVol: string
  minRepayVol: string
  maxQuote: string
  repayVol: string
  repayAmt: string
  repayAmtStr: string
  request: sdk.VaultRepayRequestV3WithPatch['request']
} & VaultLoanData<T>

export type VaultJoinData<I = any, T = IBData<I>> = {
  walletMap: WalletMap<I>
  coinMap: CoinMap<I> & { vaultToken: string; vaultId: number }
  vaultLayer2Map: WalletMap<I>
  vaultSymbol?: string
  request?: sdk.VaultJoinRequest
  maxShowVal: string
  minShowVal: string
  maxAmount: string
  minAmount: string
  amount: string
  isMerge: boolean
  vaultTokenInfo: sdk.TokenInfo
  tradeData: T
  // isShouldClean:boolean
  __request__: sdk.VaultJoinRequest
} & Partial<IBData<I>> &
  Partial<sdk.VaultJoinRequest>

export type VaultExitData<I = any, T = IBData<I>> = {
  __request__: any
  tradeData: T
} & Partial<IBData<I>> &
  Partial<sdk.VaultExitRequest>
