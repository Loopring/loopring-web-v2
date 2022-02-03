// export enum TsNFTTradeTypes {
//   deposit = "DEPOSIT",
//   withdraw = "WITHDRAW",
//   transfer = "TRANSFER",
// }

import { TxType } from "@loopring-web/loopring-sdk";

export enum TsTradeStatus {
  processing = "processing",
  processed = "processed",
  received = "received",
  failed = "failed",
}

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
  fee: {
    unit: string;
    value: number;
  };
  blockIdInfo: {
    blockId: number;
    indexInBlock: number;
  };
  storageInfo: {
    accountId: number;
    storageId: number;
    tokenId: number;
  };
  blockId: number;
  indexInBlock: number;
  memo?: string;
  createdAt: string;
  nftData: string;
  etherscanBaseUrl?: string;
};

export interface NFTTableProps {
  etherscanBaseUrl?: string;
  rawData: TxnDetailProps[];
  pagination?: {
    pageSize: number;
    total: number;
  };
  txType: TxType;
  getTxnList: (page: number) => Promise<void>;
  // showFilter?: boolean;
  showloading: boolean;
  // accAddress?: string;
}
