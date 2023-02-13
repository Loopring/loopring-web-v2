import {
  CoinInfo,
  ForexMap,
  GET_IPFS_STRING,
  NFTWholeINFO,
  PriceTag,
  RedPacketQRPropsExtends,
  TradeFloat,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../tradePanel";
import * as sdk from "@loopring-web/loopring-sdk";
import { Currency } from "@loopring-web/loopring-sdk";
import { RawDataRedPacketDetailItem } from "../tableList";

export type MarketBlockProps<C> = {
  coinAInfo: CoinInfo<C>;
  coinBInfo: CoinInfo<C>;
  tradeFloat: TradeFloat;
  forexMap: ForexMap<Currency>;
  chartData?: {
    close: number;
    timeStamp: number;
  }[];
};

export type AssetTitleProps = {
  assetInfo: {
    isShow?: boolean;
    totalAsset: number;
    priceTag: typeof PriceTag[keyof typeof PriceTag];
    [key: string]: any;
  };
  accountId: number;
  onShowReceive: (token?: string) => void;
  onShowSend: (token?: string) => void;
  hideL2Assets: boolean;
  setHideL2Assets: (value: boolean) => void;
};

export type AssetTitleMobileProps = AssetTitleProps & {
  // onShowNFTDeposit: () => void;
  // onShowNFTMINT: () => void;
  assetBtnStatus: TradeBtnStatus;
  btnShowNFTDepositStatus?: keyof typeof TradeBtnStatus;
  btnShowNFTMINTStatus?: keyof typeof TradeBtnStatus;
};

export type NFTMedaProps = {
  item: Partial<NFTWholeINFO>;
  index?: number;
  onNFTError: (popItem: Partial<NFTWholeINFO>, index?: number) => void;
  isOrigin?: boolean;
  shouldPlay?: boolean;
  getIPFSString: GET_IPFS_STRING;
  baseURL: string;
};
export type RedPacketDefaultBg = RedPacketDefault & {
  content: JSX.Element;
};
export type RedPacketDefault = {
  type?: "default" | "official";
  size?: "middle" | "large";
  ImageEle?: JSX.Element | undefined;
};
export type RedPacketTimeoutProps = RedPacketDefault & {
  sender: string;
  memo?: string;
  viewDetail?: () => void;
};
export type RedPacketQRCodeProps = {
  url: string;
  imageEleUrl?: string;
} & RedPacketQRPropsExtends;
export type RedPacketOpenProps = {
  sender: string;
  amountStr: string;
  memo: string;
  viewDetail?: () => void;
  onOpen: () => void;
};
export type RedPacketUnreadyProps = {
  sender: string;
  amountStr: string;
  memo: string;
  validSince: number;
  // viewDetail: () => void;
  // onOpen: () => void;
};
export type RedPacketOpenedProps = {
  sender: string;
  amountStr: string;
  myAmountStr: string | undefined;
  memo: string;
  viewDetail: () => void;
};
export const RedPacketDetailLimit = 5;
export type RedPacketDetailProps = {
  sender: string;
  amountStr: string;
  amountClaimStr: string;
  memo: string;
  myAmountStr: string;
  claimList: RawDataRedPacketDetailItem[];
  detail: sdk.LuckTokenClaimDetail;
  isShouldSharedRely: boolean;
  totalCount: number;
  remainCount: number;
  onShared: () => void;
  page: number;
  relyAmount?: string;
  relyNumber?: string;
  handlePageChange: (page: number, limit?: number) => void;
  ImageEle?: JSX.Element | undefined;
};
export type RedPacketClockProps = RedPacketDefault & {
  validSince: number;
  sender: string;
  amountStr: string;
  memo: string;
  showRedPacket: () => void;
  // viewDetail: () => void;
  // onOpen: () => void;
};
