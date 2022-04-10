import {
  ChainId,
  NFTTokenInfo,
  UserNFTBalanceInfo,
} from "@loopring-web/loopring-sdk";
import { FeeInfo, IBData } from "../loopring-interface";
import * as sdk from "@loopring-web/loopring-sdk";

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
  isApproved?: boolean;
  cid?: string;
  nftId?: string;
  nftBalance?: number;
  nftIdView?: string;
  royaltyPercentage?: number;
} & Partial<IBData<I>> &
  Partial<Omit<NFTTokenInfo, "creatorFeeBips" | "nftData">>;

export type TradeNFT<I> = MintTradeNFT<I> & Partial<NFTWholeINFO>;

export const TOAST_TIME = 3000;

export const EmptyValueTag = "--";

export const IPFS_META_URL = "ipfs://";
export const MINT_LIMIT = 100000;
export const PROPERTY_LIMIT = 5;
export const PROPERTY_KET_LIMIT = 20;
export const PROPERTY_Value_LIMIT = 40;
