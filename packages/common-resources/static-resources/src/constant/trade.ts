// import {
//   ChainId,
//   NFTTokenInfo,
//   TokenInfo,
//   UserNFTBalanceInfo,
// } from "@loopring-web/loopring-sdk";
import {
  CollectionMeta,
  DeFiCalcData,
  FeeInfo,
  IBData,
} from "../loopring-interface";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTranslation } from "react-i18next";
import { MarketType } from "./market";

export enum DeFiChgType {
  coinSell = "coinSell",
  coinBuy = "coinBuy",
  exchange = "exchange",
}
export type WithdrawType =
  | sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL
  | sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
  | sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL;

export type WithdrawTypes = {
  [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: "Fast";
  [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard";
};

export type PriceTagType = "$" | "￥";

export enum CurrencyToTag {
  usd = "Dollar",
  cny = "Yuan",
}

export enum PriceTag {
  Dollar = "$",
  Yuan = "￥",
}

export enum TradeTypes {
  Buy = "Buy",
  Sell = "Sell",
}

export enum TradeStatus {
  // Filled = 'Filled',
  // Cancelled = 'Cancelled',
  // Succeeded = 'Succeeded',
  Processing = "processing",
  Processed = "processed",
  Cancelling = "cancelling",
  Cancelled = "cancelled",
  Expired = "expired",
  Waiting = "waiting",
}

export type TxInfo = {
  hash: string;
  timestamp?: number | undefined;
  status?: "pending" | "success" | "failed" | undefined;
  [key: string]: any;
};

export interface AccountHashInfo {
  depositHashes: { [key: string]: TxInfo[] };
}

export interface NFTHashInfo {
  nftDataHashes: { [key: string]: Required<TxInfo> };
}

// export type GuardianLock
export enum Layer1Action {
  GuardianLock = "GuardianLock",
  NFTDeploy = "NFTDeploy",
}

// GuardianLock
export type Layer1ActionHistory = {
  [key: string]: {
    [key in keyof typeof Layer1Action]?: { [key: string]: number };
    // NFTDeploy?: { [key: string]: number };
  };
};

export type ChainHashInfos = {
  [key in sdk.ChainId extends string ? string : string]: AccountHashInfo;
};

export type NFTHashInfos = {
  [key in sdk.ChainId extends string ? string : string]: NFTHashInfo;
};
export type LAYER1_ACTION_HISTORY = {
  [key in sdk.ChainId extends string ? string : string]: Layer1ActionHistory;
} & { __timer__: -1 | NodeJS.Timeout };

export type MetaProperty = {
  key: string;
  value: string;
};
export type MetaDataProperty = { [key: string]: string };
export type AttributesProperty = {
  trait_type: string;
  value: string;
};

export type NFTMETA = {
  image: string;
  name: string;
  royaltyPercentage: number; // 0 - 10 for UI
  description: string;
  collection_metadata: string;
  properties?: Array<MetaProperty>;
  animationUrl?: string;
  attributes?: AttributesProperty[];
};
export enum Media {
  Audio = "Audio",
  Image = "Image",
  Video = "Video",
}

export type NFTWholeINFO<Co = CollectionMeta> = sdk.NFTTokenInfo &
  sdk.UserNFTBalanceInfo &
  NFTMETA & {
    nftBalance?: number;
    nftIdView?: string;
    fee?: FeeInfo;
    isFailedLoadMeta?: boolean;
    etherscanBaseUrl: string;
    __mediaType__?: Media;
    collectionMeta?: Partial<Co>;
  };

export type MintTradeNFT<I> = {
  balance?: number;
  fee?: FeeInfo;
  cid?: string;
  nftId?: string;
  nftBalance?: number;
  nftIdView?: string;
  royaltyPercentage?: number;
  // tokenAddress?:string;
} & Partial<IBData<I>> &
  Partial<Omit<sdk.NFTTokenInfo, "creatorFeeBips" | "nftData">>;
export type MintReadTradeNFT<I> = {
  balance?: number;
  fee?: FeeInfo;
  readonly cid?: string;
  readonly nftId?: string;
  readonly nftIdView?: string;
  readonly nftBalance?: number;
  readonly royaltyPercentage?: number;
} & Partial<IBData<I>> &
  Partial<Omit<sdk.NFTTokenInfo, "creatorFeeBips" | "nftData">>;

export type TradeNFT<I, Co> = MintTradeNFT<I> &
  Partial<NFTWholeINFO<Co>> & { isApproved?: boolean };

export const TOAST_TIME = 3000;

export enum NFT_TYPE_STRING {
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

export const EmptyValueTag = "--";
export const DEAULT_NFTID_STRING =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const MINT_LIMIT = 100000;
export const PROPERTY_LIMIT = 64;
export const PROPERTY_KET_LIMIT = 20;
export const PROPERTY_Value_LIMIT = 40;
export const LOOPRING_TAKE_NFT_META_KET = {
  name: "name",
  image: "image",
  royaltyPercentage: "royaltyPercentage",
  description: "description",
  properties: "properties",
};
export type LOOPRING_NFT_METADATA = {
  [key in keyof typeof LOOPRING_TAKE_NFT_META_KET]?: string | undefined;
};

export const NFTLimit = 12,
  CollectionLimit = 12;

export const AddAssetList = {
  FromMyL1: {
    key: "FromMyL1",
    svgIcon: "IncomingIcon",
    enableKey: "deposit",
  },
  BuyWithCard: {
    key: "BuyWithCard",
    svgIcon: "CardIcon",
    enableKey: "legal",
  },
  FromOtherL2: {
    key: "FromOtherL2",
    svgIcon: "L2l2Icon",
    enableKey: null,
  },
  FromOtherL1: {
    key: "FromOtherL1",
    svgIcon: "OutputIcon",
    enableKey: null,
  },
  FromExchange: {
    key: "FromExchange",
    svgIcon: "ExchangeAIcon",
    enableKey: null,
  },
};

export const SendAssetList = {
  SendAssetToMyL1: {
    key: "SendToMyL1",
    svgIcon: "IncomingIcon",
    enableKey: "withdraw",
  },
  SendAssetToL2: {
    key: "SendTOL2",
    svgIcon: "L2l2Icon",
    enableKey: "transfer",
  },
  SendAssetToOtherL1: {
    key: "SendToOtherL1",
    svgIcon: "L1l2Icon",
    enableKey: "withdraw",
  },
};

export const SendNFTAssetList = {
  SendAssetToMyL1: {
    key: "SendToMyL1",
    svgIcon: "IncomingIcon",
    enableKey: "withdrawNFT",
  },
  SendAssetToL2: {
    key: "SendTOL2",
    svgIcon: "L2l2Icon",
    enableKey: "transferNFT",
  },
  SendAssetToOtherL1: {
    key: "SendToOtherL1",
    svgIcon: "L1l2Icon",
    enableKey: "withdrawNFT",
  },
};

export enum AddressError {
  NoError = "NoError",
  EmptyAddr = "EmptyAddr",
  InvalidAddr = "InvalidAddr",
  ENSResolveFailed = "ENSResolveFailed",
  IsNotLoopringContract = "IsNotLoopringContract",
  TimeOut = "TimeOut",
}

export enum WALLET_TYPE {
  EOA = "EOA",
  Loopring = "Loopring",
  OtherSmart = "OtherSmart",
  Exchange = "Exchange",
}

export enum EXCHANGE_TYPE {
  NonExchange = "NonExchange",
  Binance = "Binance",
  Huobi = "Huobi",
  Coinbase = "Coinbase",
  Others = "Others",
}

export type AddressItemType<T> = {
  value: T;
  label: string;
  description: string;
  disabled?: boolean;
  maxWidth?: string | number;
};

export const useAddressTypeLists = <
  T extends WALLET_TYPE | EXCHANGE_TYPE
>() => {
  const { t } = useTranslation("common");
  const walletList: AddressItemType<T>[] = [
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.EOA}`),
      }),
      value: WALLET_TYPE.EOA as T,
      description: t(`label${WALLET_TYPE.EOA}Des`),
    },
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.Loopring}`),
      }),
      value: WALLET_TYPE.Loopring as T,
      description: t(`label${WALLET_TYPE.Loopring}Des`),
    },
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.OtherSmart}`),
      }),
      disabled: true,
      value: WALLET_TYPE.OtherSmart as T,
      description: t(`label${WALLET_TYPE.OtherSmart}Des`),
    },
    {
      label: t(WALLET_TYPE.Exchange),
      value: WALLET_TYPE.Exchange as T,
      disabled: true,
      description: t(`label${WALLET_TYPE.Exchange}Des`),
    },
  ];
  const nonExchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelNonExchangeType`),
      value: EXCHANGE_TYPE.NonExchange as T,
      disabled: false,
      description: t(`labelNonExchangeTypeDes`),
    },
  ];
  const exchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Binance}`),
      value: EXCHANGE_TYPE.Binance as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Binance}Des`),
      maxWidth: "initial",
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`),
      value: EXCHANGE_TYPE.Huobi as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Huobi}Des`),
      maxWidth: "initial",
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Others}`),
      value: EXCHANGE_TYPE.Others as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Others}Des`),
      maxWidth: "initial",
    },
  ];
  return {
    walletList,
    nonExchangeList,
    exchangeList,
  };
};

export const defalutSlipage = 0.1;
export type ForexMap<C> = { [k in keyof C]?: number };

export const enum InvestMapType {
  Token = "Token",
  AMM = "AMM",
  STAKE = "STAKE",
  DUAL = "DUAL",
}

export const InvestOpenType = [
  InvestMapType.AMM,
  InvestMapType.STAKE,
  InvestMapType.DUAL,
];

export const enum InvestDuration {
  Flexible = "Flexible",
  Duration = "Duration",
  All = "All",
}

export type InvestItem = {
  type: InvestMapType;
  i18nKey: `labelInvestType_${InvestMapType}` | "";
  apr: [start: number, end: number];
  durationType: InvestDuration;
  duration: string;
};
export type InvestDetail = {
  token: sdk.TokenInfo;
  apr: [start: number, end: number];
  durationType: InvestDuration;
  duration: string;
};

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
  type: string;
  market?: MarketType; // eg: ETH-LRC, Pair from loopring market
  isStoB: boolean;
  sellVol: string;
  buyVol: string;
  sellToken: sdk.TokenInfo;
  buyToken: sdk.TokenInfo;
  deFiCalcData?: DeFiCalcData<C>;
  fee: string;
  feeRaw: string;
  depositPrice?: string;
  withdrawPrice?: string;
  maxSellVol?: string;
  maxBuyVol?: string;
  maxFeeBips?: number;
  miniSellVol?: string;
  request?: sdk.DefiOrderRequest;
  defiBalances?: { [key: string]: string };
  lastInput?: DeFiChgType;
};

export type L2CollectionFilter = {
  isMintable?: boolean;
  tokenAddress?: string;
  owner?: string;
};

export const LIVE_FEE_TIMES = 60000;
export const L1_UPDATE = 15000;

export type DualCurrentPrice = {
  quote: string;
  base: string;
  currentPrice?: number;
};
export type DualViewBase = {
  apy: string;
  settleRatio: string; //targetPrice
  term: string;
  strike: string;
  isUp: boolean;
  // targetPrice,
  // subscribeData,

  expireTime: number;
  currentPrice: DualCurrentPrice;
  productId: string;
  sellSymbol: string;
  buySymbol: string;
  amount?: string;
  enterTime?: number;

  // balance,
};

export type DualViewInfo = DualViewBase & {
  __raw__: {
    info: sdk.DualProductAndPrice;
    index: sdk.DualIndex;
    rule: sdk.DualRulesCoinsInfo;
  };
};
export type DualViewOrder = DualViewBase & {
  __raw__: {
    order: sdk.UserDualTxsHistory;
  };
};
