import * as sdk from "@loopring-web/loopring-sdk";
import {
  ClaimToken,
  CoinInfo,
  ForexMap,
  TokenType,
} from "@loopring-web/common-resources";

export type RawDataRedPacketRecordsItem = {
  token: CoinInfo<any> & { type: TokenType };
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
  token: CoinInfo<any> & { type: TokenType };
  amount: string;
  type: sdk.LuckyTokenType;
  status: sdk.LuckyTokenItemStatus;
  claimAt: number;
  sender: string;
};
export type RawDataRedPacketClaimItem = {
  token: CoinInfo<any> & { type: TokenType };
  amountStr: string;
  volume: number;
  rawData: any;
};
export type RawDataRedPacketDetailItem = {
  accountStr: string;
  isSelf: boolean;
  amountStr: string;
  createdAt: number;
  rawData: any;
  isMax: boolean;
};

export interface RedPacketClaimTableProps<R, C = sdk.Currency> {
  rawData: R[];
  showloading: boolean;
  forexMap: ForexMap<C>;
  onItemClick: (item: ClaimToken) => void;
  etherscanBaseUrl: string;
  getClaimRedPacket: (props: any) => void;
}

export interface RedPacketRecordsTableProps<R, C = sdk.Currency> {
  rawData: R[];
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
  showloading: boolean;
  forexMap: ForexMap<C>;
  etherscanBaseUrl: string;
  pagination?: {
    pageSize: number;
    total: number;
  };
  getRedPacketReceiveList: (props: any) => void;
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
