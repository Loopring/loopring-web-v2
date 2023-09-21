import {
  CollectionMeta,
  DeFiCalcData,
  DeFiSideCalcData,
  DeFiSideRedeemCalcData,
  FeeInfo,
  IBData,
  LuckyRedPacketItem,
} from '../loopring-interface'
import * as sdk from '@loopring-web/loopring-sdk'
import { MarketType } from './market'
import { VendorProviders } from './vendor'

export enum DeFiChgType {
  coinSell = 'coinSell',
  coinBuy = 'coinBuy',
  exchange = 'exchange',
}

export type WithdrawType =
  | sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL
  | sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
  | sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL

export type WithdrawTypes = {
  [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: 'Fast'
  [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: 'Standard'
}

export type PriceTagType = '$' | '￥'

export enum CurrencyToTag {
  usd = 'Dollar',
  cny = 'Yuan',
}

export enum PriceTag {
  Dollar = '$',
  Yuan = '￥',
}

export enum TradeTypes {
  Buy = 'Buy',
  Sell = 'Sell',
}

export enum TradeStatus {
  // Filled = 'Filled',
  // Cancelled = 'Cancelled',
  // Succeeded = 'Succeeded',
  Processing = 'processing',
  Processed = 'processed',
  Cancelling = 'cancelling',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Waiting = 'waiting',
}

export type TxInfo = {
  hash: string
  timestamp?: number | undefined
  status?: 'pending' | 'success' | 'failed' | undefined
  [key: string]: any
}

export interface AccountHashInfo {
  depositHashes: { [key: string]: TxInfo[] }
  showHadUnknownCollection: { [key: string]: boolean }
}

export interface NFTHashInfo {
  nftDataHashes: { [key: string]: Required<TxInfo> }
}

export enum Layer1Action {
  GuardianLock = 'GuardianLock',
  NFTDeploy = 'NFTDeploy',
}

// GuardianLock
export type Layer1ActionHistory = {
  [key: string]: {
    [key in keyof typeof Layer1Action]?: { [key: string]: number }
    // NFTDeploy?: { [key: string]: number };
  }
}

export type ChainHashInfos = {
  [key in sdk.ChainId extends string ? string : string]: AccountHashInfo
}

export type NFTHashInfos = {
  [key in sdk.ChainId extends string ? string : string]: NFTHashInfo
}
export type LAYER1_ACTION_HISTORY = {
  [key in sdk.ChainId extends string ? string : string]: Layer1ActionHistory
} & { __timer__: -1 | NodeJS.Timeout }

export type MetaProperty = {
  key: string
  value: string
}
export type MetaDataProperty = { [key: string]: string }
export type AttributesProperty = {
  trait_type: string
  value: string
}

export type NFTMETA = {
  image: string
  name: string
  royaltyPercentage: number // 0 - 10 for UI
  description: string
  collection_metadata: string
  properties?: Array<MetaProperty>
  animationUrl?: string
  attributes?: AttributesProperty[]
}

export enum Media {
  Audio = 'Audio',
  Image = 'Image',
  Video = 'Video',
  Media3D = 'Media3D',
}

export type NFTWholeINFO<Co = CollectionMeta> = sdk.NFTTokenInfo &
  sdk.UserNFTBalanceInfo &
  NFTMETA & {
    nftBalance?: number
    nftIdView?: string
    pendingOnSync: boolean
    fee?: FeeInfo
    isFailedLoadMeta?: boolean
    etherscanBaseUrl: string
    __mediaType__?: Media
    // collectionMeta?: Partial<Co>;
    preference?: {
      favourite: boolean
      hide: boolean
    }
    collectionInfo?: Co
  }

export type MintTradeNFT<I> = {
  balance?: number
  fee?: FeeInfo
  cid?: string
  nftId?: string
  nftBalance?: number
  nftIdView?: string
  royaltyPercentage?: number
  // tokenAddress?:string;
} & Partial<IBData<I>> &
  Partial<Omit<sdk.NFTTokenInfo, 'creatorFeeBips' | 'nftData'>>
export type MintReadTradeNFT<I> = {
  balance?: number
  fee?: FeeInfo
  readonly cid?: string
  readonly nftId?: string
  readonly nftIdView?: string
  readonly nftBalance?: number
  readonly royaltyPercentage?: number
} & Partial<IBData<I>> &
  Partial<Omit<sdk.NFTTokenInfo, 'creatorFeeBips' | 'nftData'>>

export type TradeNFT<I, Co> = MintTradeNFT<I> &
  Partial<NFTWholeINFO<Co>> & {
    isApproved?: boolean
    collectionMeta?: CollectionMeta
  }

export enum NFT_TYPE_STRING {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
}

export const EmptyValueTag = '--'
export const HiddenTag = '*****'
export const DEAULT_NFTID_STRING =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
export const MINT_LIMIT = 100000
export const SUBMIT_PANEL_AUTO_CLOSE = 8000
export const SUBMIT_PANEL_QUICK_AUTO_CLOSE = 3000
export const SUBMIT_PANEL_DOUBLE_QUICK_AUTO_CLOSE = 1000
export const TOAST_TIME = 3000

export const PROPERTY_LIMIT = 64
export const PROPERTY_KET_LIMIT = 20
export const STAKING_INVEST_LIMIT = 5
export const PROPERTY_Value_LIMIT = 40
export const REDPACKET_ORDER_LIMIT = 10000
export const REDPACKET_ORDER_NFT_LIMIT = 20000
export const EXCLUSIVE_REDPACKET_ORDER_LIMIT_WHITELIST = 1000
export const EXCLUSIVE_REDPACKET_ORDER_LIMIT = 50
export const BLINDBOX_REDPACKET_LIMIT = 10000
export const LOOPRING_TAKE_NFT_META_KET = {
  name: 'name',
  image: 'image',
  royaltyPercentage: 'royaltyPercentage',
  description: 'description',
  properties: 'properties',
}
export type LOOPRING_NFT_METADATA = {
  [key in keyof typeof LOOPRING_TAKE_NFT_META_KET]?: string | undefined
}

export const NFTLimit = 12,
  CollectionLimit = 12,
  RedPacketLimit = 12

export const AddAssetList = {
  FromMyL1: {
    key: 'FromMyL1',
    svgIcon: 'IncomingIcon',
    enableKey: 'deposit',
  },
  BuyWithCard: {
    key: 'BuyWithCard',
    svgIcon: 'CardIcon',
    enableKey: 'legal',
  },
  FromOtherL2: {
    key: 'FromOtherL2',
    svgIcon: 'L2l2Icon',
    enableKey: null,
  },
  FromOtherL1: {
    key: 'FromOtherL1',
    svgIcon: 'OutputIcon',
    enableKey: null,
  },
  FromExchange: {
    key: 'FromExchange',
    svgIcon: 'ExchangeAIcon',
    enableKey: null,
  },
  FromAnotherNet: {
    key: 'FromAnotherNet',
    svgIcon: 'AnotherIcon',
    enableKey: null,
  },
}

export const SendAssetList = {
  SendAssetToMyL1: {
    key: 'SendToMyL1',
    svgIcon: 'IncomingIcon',
    enableKey: 'withdraw',
  },
  SendAssetToL2: {
    key: 'SendTOL2',
    svgIcon: 'L2l2Icon',
    enableKey: 'transfer',
  },
  SendAssetToOtherL1: {
    key: 'SendToOtherL1',
    svgIcon: 'L1l2Icon',
    enableKey: 'withdraw',
  },
  SendAssetToAnotherNet: {
    key: 'SendAssetToAnotherNet',
    svgIcon: 'AnotherIcon',
    enableKey: 'withdraw',
  },
}

export const SendNFTAssetList = {
  SendAssetToMyL1: {
    key: 'SendToMyL1',
    svgIcon: 'IncomingIcon',
    enableKey: 'withdrawNFT',
  },
  SendAssetToL2: {
    key: 'SendTOL2',
    svgIcon: 'L2l2Icon',
    enableKey: 'transferNFT',
  },
  SendAssetToOtherL1: {
    key: 'SendToOtherL1',
    svgIcon: 'L1l2Icon',
    enableKey: 'withdrawNFT',
  },
}

export enum AddressError {
  NoError = 'NoError',
  EmptyAddr = 'EmptyAddr',
  InvalidAddr = 'InvalidAddr',
  ENSResolveFailed = 'ENSResolveFailed',
  IsNotLoopringContract = 'IsNotLoopringContract',
  TimeOut = 'TimeOut',
}

export enum WALLET_TYPE {
  EOA = 'EOA',
  Loopring = 'Loopring',
  OtherSmart = 'OtherSmart',
  Exchange = 'Exchange',
}

export enum EXCHANGE_TYPE {
  NonExchange = 'NonExchange',
  Binance = 'Binance',
  Huobi = 'Huobi',
  Coinbase = 'Coinbase',
  Others = 'Others',
}

export type AddressItemType<T> = {
  value: T
  label: string
  description: string
  disabled?: boolean
  maxWidth?: string | number
}

export const defaultSlipage = 0.1
export const defaultBlockTradeSlipage = 0.1

export type ForexMap<C = sdk.Currency> = { [k in keyof C]?: number }

export const enum InvestMapType {
  Token = 'Token',
  AMM = 'AMM',
  STAKE = 'STAKE',
  DUAL = 'DUAL',
  STAKELRC = 'STAKELRC',
  LEVERAGEETH = 'LEVERAGEETH',
  // BTradeInvest = "BTradeInvest",
}

export const enum InvestAssetRouter {
  AMM = 'amm',
  STAKE = 'stake',
  DUAL = 'dual',
  STAKELRC = 'sideStake',
  LEVERAGEETH = 'leverageeth',
  // BTradeInvest = "BTradeInvest",
}

export const InvestOpenType = [
  InvestMapType.AMM,
  InvestMapType.STAKE,
  InvestMapType.DUAL,
  InvestMapType.STAKELRC,
  InvestMapType.LEVERAGEETH,
  // InvestMapType.BTradeInvest,
]

export const enum InvestDuration {
  Flexible = 'Flexible',
  Duration = 'Duration',
  All = 'All',
}

export type InvestItem = {
  type: InvestMapType
  i18nKey: `labelInvestType_${InvestMapType}` | ''
  apr: [start: number, end: number]
  durationType: InvestDuration
  duration: string
}
export type InvestDetail = {
  token: sdk.TokenInfo
  apr: [start: number, end: number]
  durationType: InvestDuration
  duration: string
}

export enum CreateCollectionStep {
  // CreateTokenAddress,
  // Loading,
  // CreateTokenAddressFailed,
  ChooseMethod,
  ChooseMintMethod,
  ChooseCollectionEdit,
  // AdvancePanel,
  // CommonPanel,
}

export type TradeDefi<C> = {
  type: string
  market?: MarketType // eg: ETH-LRC, Pair from loopring market
  isStoB: boolean
  sellVol: string
  buyVol: string
  sellToken: sdk.TokenInfo
  buyToken: sdk.TokenInfo
  deFiCalcData?: DeFiCalcData<C>
  fee: string
  feeRaw: string
  depositPrice?: string
  withdrawPrice?: string
  maxSellVol?: string
  maxBuyVol?: string
  maxFeeBips?: number
  miniSellVol?: string
  request?: sdk.DefiOrderRequest
  defiBalances?: { [key: string]: string }
  lastInput?: DeFiChgType
  withdrawFeeBips?: number
}
export type TradeStake<C> = {
  sellToken: sdk.TokenInfo
  sellVol: string
  deFiSideCalcData?: DeFiSideCalcData<C>
  request?: {
    accountId: number
    hash: string
    token: sdk.TokenVolumeV3
  }
}

export type RedeemStake<C> = {
  sellToken: sdk.TokenInfo
  sellVol?: string
  deFiSideRedeemCalcData: DeFiSideRedeemCalcData<C>
  request?: {
    accountId: number
    hash: string
    token: sdk.TokenVolumeV3
  }
}

export type L2CollectionFilter = {
  isMintable?: boolean
  isLegacy?: boolean
  tokenAddress?: string
  owner?: string
}
export type MyNFTFilter = {
  favourite?: boolean
  hidden?: boolean
}

export enum MY_NFT_VIEW {
  LIST_COLLECTION = 'byCollection',
  LIST_NFT = 'byList',
}

export const LIVE_FEE_TIMES = 60000
export const L1_UPDATE = 15000

export type DualCurrentPrice = {
  quote: string
  base: string
  precisionForPrice: number
  currentPrice?: number
}
export type DualViewBase = {
  apy: `${string}%`
  settleRatio: string //targetPrice
  term: string
  strike: string
  isUp: boolean
  expireTime: number
  currentPrice: DualCurrentPrice
  productId: string
  sellSymbol: string
  buySymbol: string
  amount?: string
  enterTime?: number
  stepLength: string
  __raw__?: any
}

export type DualViewInfo = DualViewBase & {
  __raw__: {
    info: sdk.DualProductAndPrice
    index: sdk.DualIndex
    rule: sdk.DualRulesCoinsInfo
  }
}
export type ClaimToken = sdk.UserBalanceInfo & {
  isNft?: boolean
  nftTokenInfo?: sdk.UserNFTBalanceInfo
  luckyTokenHash?: string
}
export type DualViewOrder = DualViewBase & {
  __raw__: {
    order: sdk.UserDualTxsHistory
  }
}

export enum TRADE_TYPE {
  TOKEN = 'TOKEN',
  NFT = 'NFT',
}

export enum CLAIM_TYPE {
  redPacket = 'redPacket',
  lrcStaking = 'lrcStaking',
  allToken = 'allToken',
}

export type BanxaOrder = {
  id: string
  account_id: string
  account_reference: string
  order_type: 'CRYPTO-SELL'
  payment_type: string | null
  ref: number | null
  fiat_code: string
  fiat_amount: number
  coin_code: string
  coin_amount: number
  wallet_address: string | null
  wallet_address_tag: string | null
  fee: number | null
  fee_tax: number | null
  payment_fee: number | null
  payment_fee_tax: number | null
  commission: number | null
  tx_hash: string | null
  tx_confirms: number | null
  created_date: string
  created_at: string
  status: string
  completed_at: string | null
  merchant_fee: number | null
  merchant_commission: number | null
  meta_data: string | null
  blockchain: { id: number; code: 'LRC'; description: 'Loopring ' | null }
}

export const LuckyRedPacketList: LuckyRedPacketItem[] = [
  {
    labelKey: 'labelLuckyRelayToken',
    desKey: 'labelLuckyRelayTokenDes',
    showInERC20: true,
    hideForExclusive: true,
    value: {
      value: 0,
      partition: sdk.LuckyTokenAmountType.RANDOM,
      mode: sdk.LuckyTokenClaimType.RELAY,
    },
  },
  {
    labelKey: 'labelLuckyRandomToken',
    desKey: 'labelRedPacketsSplitLuckyDetail',
    showInNFTS: true,
    showInERC20: true,
    defaultForERC20: true,
    defaultForNFT: true,
    value: {
      value: 1,
      partition: sdk.LuckyTokenAmountType.RANDOM,
      mode: sdk.LuckyTokenClaimType.COMMON,
    },
  },
  {
    labelKey: 'labelLuckyCommonToken',
    desKey: 'labelLuckyCommonTokenDes',
    showInNFTS: true,
    showInERC20: true,
    value: {
      value: 2,
      partition: sdk.LuckyTokenAmountType.AVERAGE,
      mode: sdk.LuckyTokenClaimType.COMMON,
    },
  },
  {
    labelKey: 'labelAssetTokens',
    desKey: '',
    showInBlindbox: true,
    defaultForBlindbox: true,
    icon: sdk.SoursURL + '/images/blindboxSelectToken.png',
    value: {
      value: 4,
      partition: sdk.LuckyTokenAmountType.RANDOM,
      mode: sdk.LuckyTokenClaimType.BLIND_BOX,
    },
    toolgleWithShowERC20Blindbox: true,
  },
  {
    labelKey: 'labelRedpacketNFTS',
    desKey: '',
    showInBlindbox: true,
    defaultForBlindboxNotShowERC20Blindbox: true,
    icon: sdk.SoursURL + '/images/blindboxSelectNFT.png',
    isBlindboxNFT: true,
    value: {
      value: 5,
      partition: sdk.LuckyTokenAmountType.RANDOM,
      mode: sdk.LuckyTokenClaimType.BLIND_BOX,
    },
  },
  {
    labelKey: 'labelRedpacketBlindBox',
    desKey: 'labelLuckyBlindBoxDes',
    defaultForFromNFT: true,
    showInFromNFT: true,
    value: {
      value: 6,
      partition: sdk.LuckyTokenAmountType.RANDOM,
      mode: sdk.LuckyTokenClaimType.BLIND_BOX,
    },
  },
  {
    labelKey: 'labelLuckyRandomToken',
    desKey: 'labelLuckyRandomTokenDes',
    showInFromNFT: true,
    value: {
      value: 7,
      partition: sdk.LuckyTokenAmountType.RANDOM,
      mode: sdk.LuckyTokenClaimType.COMMON,
    },
  },
  {
    labelKey: 'labelLuckyCommonToken',
    desKey: 'labelLuckyCommonTokenDes',
    showInFromNFT: true,
    value: {
      value: 8,
      partition: sdk.LuckyTokenAmountType.AVERAGE,
      mode: sdk.LuckyTokenClaimType.COMMON,
    },
  },
]

export const QRCODE_REGION_ID = 'qrcodeRegionId'

export type ACCOUNT_ADDRESS = string
export type TX_HASH = string
export type RedPacketHashItems = {
  [key: TX_HASH]: {
    claim: string
    luckToken: sdk.LuckyTokenItemForReceive
    blindboxClaimed: any
  }
}
export type RedPacketHashInfo = {
  [key: ACCOUNT_ADDRESS]: RedPacketHashItems
}
export type RedPacketHashInfos = {
  [key in sdk.ChainId extends string ? string : string]: RedPacketHashInfo
}

export enum OffRampStatus {
  // waitingForPayment = "waitingForPayment",
  watingForCreateOrder = 'watingForCreateOrder',
  waitingForWithdraw = 'waitingForWithdraw',
  expired = 'expired',
  cancel = 'cancel',
  done = 'done',
  refund = 'refund',
}

export type OffRampHashItem = {
  orderId: string
  chainId: sdk.ChainId
  address: string
  product: VendorProviders
  status: OffRampStatus
  wallet_address?: string | undefined
  checkout_iframe?: string
  account_reference?: string
  [key: string]: any
}
export type OffRampHashItemObj = {
  pending: OffRampHashItem
  payments: OffRampHashItem[]
}
export type OffRampHashItems<T = VendorProviders> = {
  [K in keyof T]: OffRampHashItemObj
}
export type OffRampHashInfo = {
  [key: ACCOUNT_ADDRESS]: OffRampHashItems
}
export type OffRampHashInfos = {
  [key in sdk.ChainId extends string ? string : string]: OffRampHashInfo
}

export enum RedPacketOrderType {
  TOKEN = 'TOKEN',
  NFT = 'NFT',
  BlindBox = 'BlindBox',
  FromNFT = 'FromNFT',
}

export type RedPacketOrderData<I> = {
  tradeType: RedPacketOrderType
  isNFT: boolean
  tradeValue?: number
  fee: FeeInfo | undefined
  __request__: any
  target?: {
    redpacketHash: string
    addressListString: string
    popupChecked: boolean
  }
  showNFT: boolean
} & Partial<IBData<I>> &
  Partial<NFTWholeINFO> &
  Partial<sdk.LuckyTokenItemForSendV3>

export enum TabTokenTypeIndex {
  ERC20 = 'ERC20',
  NFT = 'NFT',
}

export interface SnackbarMessage {
  message: string
  key: number | string
  svgIcon?: string
}

export const BTRDE_PRE = 'BTRADE-'

export enum TradeProType {
  sell = 'sell',
  buy = 'buy',
}

export enum TradeBaseType {
  price = 'price',
  quote = 'quote',
  base = 'base',
  tab = 'tab',
  slippage = 'slippage',
  stopPrice = 'stopPrice',
  checkMarketPrice = 'checkMarketPrice',
}

export type AmmHistoryItem = {
  close: number
  timeStamp: number
}

export enum DualStep {
  ChooseType = 'ChooseType',
  ShowBase = 'ShowBase',
  ShowSellBuy = 'ShowSellBuy',
  ShowQuote = 'ShowQuote',
  ShowList = 'ShowList',
}
export enum DualViewType {
  DualGain = 'DualGain',
  DualDip = 'DualDip',
  DualBegin = 'DualBegin',
  All = 'All',
}
export const DualGain = [
  // { step: DualStep.ChooseType, type: 'Card' },
  { step: DualStep.ShowBase, type: 'Tab', labelKey: 'labelDualChooseTokenDUAL_BASE' },
  {},
  { step: DualStep.ShowQuote, type: 'Tab', labelKey: 'labelDualChooseTargetPriceDUAL_BASE' },
]
export const DualDip = [
  // { step: DualStep.ChooseType, type: 'Card' },
  { step: DualStep.ShowBase, type: 'Tab', labelKey: 'labelDualChooseTokenDUAL_CURRENCY' },
  {},
  { step: DualStep.ShowQuote, type: 'Tab', labelKey: 'labelDualChooseTargetPriceDUAL_CURRENCY' },
]
export const DualBegin = [
  { step: DualStep.ShowBase, type: 'Tab', labelKey: 'labelDualBeginnerStep1Title' },
  { step: DualStep.ChooseType, type: 'Tab', labelKey: 'labelDualBeginnerSellHigh' },
  { step: DualStep.ShowQuote, type: 'Tab', labelKey: 'labelDualBeginnerStep2Title' },
]
