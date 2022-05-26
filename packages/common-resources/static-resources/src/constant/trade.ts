import {
  ChainId,
  NFTTokenInfo,
  UserNFTBalanceInfo,
} from "@loopring-web/loopring-sdk";
import { FeeInfo, IBData } from "../loopring-interface";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTranslation } from "react-i18next";

export type WithdrawType =
  | sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL
  | sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
  | sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL;

export type WithdrawTypes = {
  [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: "Fast";
  [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard";
};

export type PriceTagType = "$" | "￥";

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
  [key in ChainId extends string ? string : string]: AccountHashInfo;
};
export type LAYER1_ACTION_HISTORY = {
  [key in ChainId extends string ? string : string]: Layer1ActionHistory;
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
  collection?: string;
  properties?: Array<MetaProperty>;
};

export type NFTWholeINFO = NFTTokenInfo &
  UserNFTBalanceInfo &
  NFTMETA & {
    nftBalance?: number;
    nftIdView?: string;
    fee?: FeeInfo;
    isFailedLoadMeta?: boolean;
    etherscanBaseUrl: string;
  };

export type MintTradeNFT<I> = {
  balance?: number;
  fee?: FeeInfo;
  cid?: string;
  nftId?: string;
  nftBalance?: number;
  nftIdView?: string;
  royaltyPercentage?: number;
} & Partial<IBData<I>> &
  Partial<Omit<NFTTokenInfo, "creatorFeeBips" | "nftData">>;
export type MintReadTradeNFT<I> = {
  balance?: number;
  fee?: FeeInfo;
  readonly cid?: string;
  readonly nftId?: string;
  readonly nftIdView?: string;
  readonly nftBalance?: number;
  readonly royaltyPercentage?: number;
} & Partial<IBData<I>> &
  Partial<Omit<NFTTokenInfo, "creatorFeeBips" | "nftData">>;

export type TradeNFT<I> = MintTradeNFT<I> &
  Partial<NFTWholeINFO> & { isApproved?: boolean };

export const TOAST_TIME = 3000;

export const EmptyValueTag = "--";
export const DEAULT_NFTID_STRING =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const IPFS_META_URL = "ipfs://";
export const MINT_LIMIT = 100000;
export const PROPERTY_LIMIT = 5;
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

export const NFTLimit = 12;

export const AddAssetList = {
  BuyWithCard: {
    key: "BuyWithCard",
    svgIcon: "CardIcon",
    enableKey: "legal",
  },
  FromMyL1: {
    key: "FromMyL1",
    svgIcon: "IncomingIcon",
    enableKey: "deposit",
  },
  FromOtherL1: {
    key: "FromOtherL1",
    svgIcon: "IncomingIcon",
    enableKey: null,
  },
  FromOtherL2: {
    key: "FromOtherL2",
    svgIcon: "IncomingIcon",
    enableKey: null,
  },
  FromExchange: {
    key: "FromExchange",
    svgIcon: "IncomingIcon",
    enableKey: null,
  },
};

export const SendAssetList = {
  SendAssetToL2: {
    key: "SendTOL2",
    svgIcon: "IncomingIcon",
    enableKey: "transfer",
  },
  SendAssetToMyL1: {
    key: "SendToMyL1",
    svgIcon: "IncomingIcon",
    enableKey: "withdraw",
  },
  SendAssetToOtherL1: {
    key: "SendToOtherL1",
    svgIcon: "IncomingIcon",
    enableKey: "withdraw",
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
