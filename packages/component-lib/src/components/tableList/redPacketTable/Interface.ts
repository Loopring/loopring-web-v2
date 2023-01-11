import * as sdk from "@loopring-web/loopring-sdk";
import { CoinInfo, ForexMap } from "@loopring-web/common-resources";

export type RawDataRedPacketRecordsItem = {
  token: CoinInfo<any> & { type: };
  type: sdk.LuckyTokenViewType;
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
export type RawDataRedPacketReceivesItem = {};
export type RawDataRedPacketClaimItem = {};

export interface RedPacketClaimTableProps<R, C = sdk.Currency> {
  rawData: R[];
  showloading: boolean;
  forexMap: ForexMap<C>;
  onItemClick: (item: R) => void;
  etherscanBaseUrl: string;
  getClaimRedPacket: (props: any) => void;
}

export interface RedPacketRecordsTableProps<R, C = sdk.Currency> {
  rawData: R[];
  showloading: boolean;
  forexMap: ForexMap<C>;
  onItemClick: (item: R) => void;
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
