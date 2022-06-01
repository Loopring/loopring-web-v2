import * as sdk from "@loopring-web/loopring-sdk";

// export type TransactionSide = {
//     address: string;
//     env: string;
// }

export enum TransactionStatus {
  processing = "processing",
  processed = "processed",
  received = "received",
  failed = "failed",
}
export enum TransactionTradeTypes {
  allTypes = "all",
  deposit = "DEPOSIT",
  withdraw = "OFFCHAIN_WITHDRAWAL",
  transfer = "TRANSFER",
}

export type RawDataTransactionItem = {
  side: TransactionTradeTypes;
  // token?: string,
  // tradeType: TransactionTradeTypes,
  // from: string;
  // to: string;
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
  status: TransactionStatus;
  path?: string;
} & Partial<sdk.UserTx>;
