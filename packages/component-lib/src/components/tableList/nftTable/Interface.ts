// export enum TsNFTTradeTypes {
//   deposit = "DEPOSIT",
//   withdraw = "WITHDRAW",
//   transfer = "TRANSFER",
// }

import { TxType, UserTxTypes } from "@loopring-web/loopring-sdk";

export enum TsTradeStatus {
  processing = "processing",
  processed = "processed",
  received = "received",
  failed = "failed",
}
export type TxsFilterProps = {
  tokenSymbol?: string;
  start?: number;
  end?: number;
  offset?: number;
  limit?: number;
  types?: UserTxTypes[] | string;
};
export enum TxnDetailStatus {
  processed = "PROCESSED",
  processing = "PROCESSING",
  received = "RECEIVED",
  failed = "FAILED",
}

export type TxnDetailProps = {
  txType?: TxType;
  hash: string;
  txHash: string;
  status: keyof typeof TxnDetailStatus;
  time: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  memo?: string;
  etherscanBaseUrl?: string;
};

export type RawDataTsNFTItem = {
  amount: {
    unit: string;
    value: number;
  };
  fee: {
    unit: string;
    value: number;
  };
  memo?: string;
  time: number;
  txnHash: string;
  status: TsTradeStatus;
  path?: string;
};
