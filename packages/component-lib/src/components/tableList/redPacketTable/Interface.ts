import * as sdk from "@loopring-web/loopring-sdk";
import { ForexMap } from "@loopring-web/common-resources";

export type RawDataRedPacketRecordsItem = {};
export type RawDataRedPacketReceivesItem = {};
export type RawDataRedPacketClaimItem = {};

export interface RedPacketClaimTableProps<R, C = sdk.Currency> {
  rawData: R[];
  showloading: boolean;
  forexMap: ForexMap<C>;
  onItemClick: (item: R) => void;
  etherscanBaseUrl: string;
  getMyRedPacketClaimList: (props: any) => void;
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
