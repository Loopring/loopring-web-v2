import {
  CoinInfo,
  PriceTag,
  TradeFloat,
  ForexMap,
  NFTWholeINFO,
  GET_IPFS_STRING,
} from "@loopring-web/common-resources";
import { TradeBtnStatus } from "../tradePanel";
import { Currency } from "@loopring-web/loopring-sdk";

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
