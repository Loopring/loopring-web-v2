import {
  CoinInfo,
  ForexMap,
  GET_IPFS_STRING,
  NFTWholeINFO,
  PriceTag,
  RedPacketQRPropsExtends,
  TradeBtnStatus,
  TradeFloat,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { RawDataRedPacketDetailItem } from '../tableList'

export type MarketBlockProps<C> = {
  coinAInfo: CoinInfo<C>
  coinBInfo: CoinInfo<C>
  tradeFloat: TradeFloat
  forexMap: ForexMap<sdk.Currency>
  chartData?: {
    close: number
    timeStamp: number
  }[]
}

export type AssetTitleProps = {
  assetInfo: {
    isShow?: boolean
    totalAsset: number
    priceTag: (typeof PriceTag)[keyof typeof PriceTag]
    [key: string]: any
  }
  accountId: number
  onShowReceive: (token?: string) => void
  onShowSend: (token?: string) => void
  hideL2Assets: boolean
  setHideL2Assets: (value: boolean) => void
  assetBtnStatus: TradeBtnStatus
  isWebEarn?: boolean
}

export type AssetTitleMobileProps = AssetTitleProps & {
  // onShowNFTDeposit: () => void;
  // onShowNFTMINT: () => void;
  btnShowNFTDepositStatus?: keyof typeof TradeBtnStatus
  btnShowNFTMINTStatus?: keyof typeof TradeBtnStatus
}

export type NFTMedaProps = {
  item: Partial<NFTWholeINFO>
  index?: number
  onNFTError: (popItem: Partial<NFTWholeINFO>, index?: number) => void
  isOrigin?: boolean
  shouldPlay?: boolean
  getIPFSString: GET_IPFS_STRING
  baseURL: string
}
export type RedPacketDefaultBg = RedPacketDefault & {
  content: JSX.Element
  className?: string
}
export type RedPacketDefault = {
  type?: 'default' | 'official' | 'blindbox'
  size?: 'middle' | 'large'
  ImageEle?: JSX.Element | undefined
}
export type RedPacketTimeoutProps = RedPacketDefault & {
  sender: string
  memo?: string
  viewDetail?: () => void
}
export type RedPacketQRCodeProps = {
  url: string
  imageEleUrl?: string
} & RedPacketQRPropsExtends
export type RedPacketOpenProps = {
  sender: string
  amountStr: string
  memo: string
  viewDetail?: () => void
  onOpen: () => void
}
export type RedPacketUnreadyProps = {
  sender: string
  amountStr: string
  memo: string
  validSince: number
  // viewDetail: () => void;
  onClickOpen: () => void
}
export type RedPacketOpenedProps = {
  sender: string
  amountStr: string
  myAmountStr: string | undefined
  memo: string
  viewDetail: () => void
}
export const RedPacketDetailLimit = 5
export const RedPacketNFTDetailLimit = 5
export const RedPacketBlindBoxLimit = 8
export type RedPacketDetailProps = {
  redPacketType: 'normal' | 'lucky' | 'relay'
  sender: string
  amountStr: string
  amountClaimStr: string
  memo: string
  myAmountStr: string
  claimList: RawDataRedPacketDetailItem[]
  detail: sdk.LuckTokenClaimDetail
  isShouldSharedRely: boolean
  totalCount: number
  remainCount: number
  onShared: () => void
  page: number
  relyAmount?: string
  relyNumber?: string
  handlePageChange: (page: number, limit?: number) => void
  ImageEle?: JSX.Element | undefined
  showRelayText: boolean
  showShareBtn: boolean
  tokenSymbol?: string
  ended: boolean
  bottomButton: 'ended' | 'share' | 'hidden'
  claimButton: 'claim' | 'claimed' | 'expired' | 'hidden' | 'claiming'
  onClickClaim?: () => void
  totalNumber: number
  showReceiptListBtn: boolean
}
export type RedPacketBlindBoxDetailTypes =
  | 'Not Started'
  | 'Blind Box Started'
  | 'Lottery Started'
  | 'Lottery Started and Win Lottery'
  | 'Lottery Started and Not Win Lottery'
  | 'BlindBox Claime Detail'
export type RedPacketBlindBoxDetailProps = {
  sender: string
  memo: string
  NFTURL?: string
  // Not Started: Phase 1, can't get blind boxs, only red packet sender can view this detail
  // Blind Box Started: Phase 2, can get blind boxs, everyone can view this detail
  // Lottery Started: Phase 3, users can participate in lottery if they have blind boxs, everyone can view this detail
  // Lottery Started And Open: Phase 3, Same as 'Lottery Started' but one more Popup to show if win NFTs
  // BlindBox Claime Detail: Phase 2 or Phase 3, shows detail of blindboxs distribution.
  type: RedPacketBlindBoxDetailTypes
  blindBoxStartTime?: number
  lotteryStartTime?: number
  lotteryEndTime?: number
  opendBlindBoxAmount: number
  totalBlindBoxAmount: number
  deliverdGiftsAmount: number
  totalGiftsAmount: number
  imageEle?: JSX.Element | undefined
  onShared?: () => void
  onClickViewDetail?: () => void
  NFTClaimList?: {
    who: string
    isMe: boolean
    when: number
    amount: number
    showLuckiest?: boolean
    showMultiplier: boolean
  }[]
  BlindBoxClaimList?: {
    who: string
    isMe: boolean
    when: number
    amount: number
  }[]
  showOpenLottery?: boolean
  wonPrizeInfo?:
    | {
        name: string
        url: string
        isNFT: true
      }
    | {
        amountStr: string
        tokenName: string
        isNFT: false
      }
  onClickClaim?: () => void
  onCloseOpenModal?: () => void
  onClickClaimDetailBack?: () => void
  description: string
  shareButton: 'hidden' | 'share'
  claimButton: 'claimed' | 'claim' | 'claiming' | 'expired' | 'hidden' | 'ended'
  didClaimABlindBox: boolean
  wonInfo:
    | {
        participated: boolean
        won: boolean
        amount: number
        isNFT: true
      }
    | {
        participated: boolean
        won: boolean
        amount: string
        total: string
        symbol: string
        isNFT: false
      }
  page: number
  totalCount: number
  remainCount: number
  handlePageChange: (page: number, limit?: number) => void
  totalClaimedNFTsCount: number
  totalBlindboxCount: number
  pageForBlindbox: number
  handlePageChange_BlindBox: (page: number, limit?: number) => void
  // didClaimABlindBox: boolean;
  onClickClaimPopViewDetail: () => void
  expired: boolean
  isTokenBlindbox: boolean
  remainGiftsAmount: string
  showReceiptListBtn: boolean
  targets?: string[]
}
export type RedPacketClockProps = RedPacketDefault & {
  validSince: number
  sender: string
  amountStr: string
  memo: string
  showRedPacket: () => void
  // viewDetail: () => void;
  // onOpen: () => void;
}
