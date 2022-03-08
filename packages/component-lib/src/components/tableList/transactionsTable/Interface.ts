import * as sdk from "@loopring-web/loopring-sdk";
export enum TransactionTradeTypes {
  allTypes = "All Types",
  deposit = "DEPOSIT",
  withdraw = "WITHDRAW",
  transfer = "TRANSFER",
}

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
