import * as sdk from "@loopring-web/loopring-sdk";
import {
  ClaimToken,
  CoinInfo,
  ForexMap,
  TokenType,
} from "@loopring-web/common-resources";
import { XOR } from "../../../types/lib";

export type RawDataRedPacketRecordsItem = {
  token: (CoinInfo<any> | sdk.UserNFTBalanceInfo) & { type: TokenType };
  type: sdk.LuckyTokenType;
  status: sdk.LuckyTokenItemStatus;
  validSince: number;
  validUntil: number;
  totalCount: number;
  remainCount: number;
  totalAmount: string;
  remainAmount: string;
  createdAt: number;
  rawData: sdk.LuckyTokenItemForReceive;
};
export type RawDataRedPacketReceivesItem = {
  token: (CoinInfo<any> | sdk.UserNFTBalanceInfo) & { type: TokenType };
  amount: string;
  type: sdk.LuckyTokenType;
  status: sdk.LuckyTokenItemStatus;
  claimAt: number;
  sender: string;
  rawData: any;
};
export type RawDataRedPacketBlindBoxReceivesItem = {
  token: (CoinInfo<any> | sdk.UserNFTBalanceInfo) & { type: TokenType };
  amount: string;
  type: sdk.LuckyTokenType;
  status: sdk.LuckyTokenItemStatus;
  claimAt: number;
  sender: string;
  rawData: any;
};

export type RawDataRedPacketClaimItem = {
  token: CoinInfo<any> & { type: TokenType };
  amountStr: string;
  volume: number;
  rawData: any;
};
export type RawDataNFTRedPacketClaimItem = Omit<
  RawDataRedPacketClaimItem,
  "token"
> & {
  token: sdk.UserNFTBalanceInfo & { type: TokenType.nft };
};
export type RawDataRedPacketDetailItem = {
  accountStr: string;
  isSelf: boolean;
  amountStr: string;
  createdAt: number;
  rawData: any;
  isMax: boolean;
  helper?: string;
};

export type RedPacketClaimTableProps<R, C = sdk.Currency> = {
  rawData: R[];
  showloading: boolean;
  forexMap: ForexMap<C>;
  onItemClick: (item: ClaimToken) => void;
  onViewMoreClick?: (type: 'NFTs' | 'blindbox') => void;
  etherscanBaseUrl: string;
  isNFT?: boolean;
  getClaimRedPacket: (props: any) => void;
  totalLuckyTokenNFTBalance?: number;
  hideAssets?: boolean;
} & XOR<
  {
    pagination?: {
      pageSize: number;
      total: number;
    };
    page?: number;
  },
  {}
>;

export interface RedPacketRecordsTableProps<R, C = sdk.Currency> {
  rawData: R[];
  tokenType: TokenType;
  showloading: boolean;
  forexMap: ForexMap<C>;
  onItemClick: (item: sdk.LuckyTokenItemForReceive) => void;
  etherscanBaseUrl: string;
  pagination?: {
    pageSize: number;
    total: number;
  };
  getMyRedPacketRecordTxList: (props: any) => void;
}

export interface RedPacketReceiveTableProps<R, C = sdk.Currency> {
  rawData: R[];
  tokenType: TokenType;
  showloading: boolean;
  forexMap: ForexMap<C>;
  etherscanBaseUrl: string;
  pagination?: {
    pageSize: number;
    total: number;
  };
  onItemClick: (
    item: sdk.LuckTokenHistory,
    refreshCallback?: () => void
  ) => void;
  onClaimItem: (
    item: sdk.LuckTokenHistory,
    successCallback: () => void
  ) => void;
  getRedPacketReceiveList: (props: any) => void;
  showActionableRecords: boolean;
  isUncliamedNFT?: boolean
}

export interface RedPacketBlindBoxReceiveTableProps<R, C = sdk.Currency> {
  rawData: R[];
  showloading: boolean;
  forexMap: ForexMap<C>;
  etherscanBaseUrl: string;
  pagination?: {
    pageSize: number;
    total: number;
  };
  onItemClick: (
    item: sdk.LuckyTokenBlindBoxItemReceive,
    pageInfo?: { offset: number; limit: number; filter: any }
  ) => any;
  getRedPacketReceiveList: (props: any) => void;
  showActionableRecords: boolean;
  isUnclaimed?: boolean;
}

export enum LuckyTokenItemStatusMap {
  SUBMITTING = 0,
  NOT_EFFECTIVE = 1,
  PENDING = 2,
  COMPLETED = 3,
  OVER_DUE = 4,
  FAILED = 5,
}

export interface aRedPacketDetailTableProps<R, C = sdk.Currency> {
  rawData: R[];
  showloading: boolean;
  forexMap: ForexMap<C>;
  onItemClick: (item: R) => void;
  etherscanBaseUrl: string;
  getClaimRedPacket: (props: any) => void;
}
