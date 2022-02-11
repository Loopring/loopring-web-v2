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
export type ChainHashInfos = {
  [key in ChainId extends string ? string : string]: AccountHashInfo;
};

export type NFTWholeINFO = NFTTokenInfo &
  UserNFTBalanceInfo & {
    image: string;
    name: string;
    nftIdView: string;
    description: string;
    nftBalance: number;
    isDeployed: boolean;
    etherscanBaseUrl: string;
  } & { fee?: FeeInfo };
export type TradeNFT<I> = {
  balance?: number;
  fee?: FeeInfo;
  isApproved?: boolean;
} & Partial<NFTWholeINFO> &
  Partial<IBData<I>> &
  Partial<Omit<NFTTokenInfo, "creatorFeeBips" | "nftData">>;

export const TOAST_TIME = 3000;

export const EmptyValueTag = "--";

export const IPFS_META_URL = "ipfs://";
