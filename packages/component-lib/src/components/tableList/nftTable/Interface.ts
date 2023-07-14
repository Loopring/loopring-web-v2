// export enum TsNFTTradeTypes {
//   deposit = "DEPOSIT",
//   withdraw = "WITHDRAW",
//   transfer = "TRANSFER",
// }

import { UserNFTTxsHistory, UserNFTTxTypes } from '@loopring-web/loopring-sdk'
import { DateRange } from '@mui/lab'

export enum TsTradeStatus {
  processing = 'processing',
  processed = 'processed',
  received = 'received',
  failed = 'failed',
}

export enum TxnDetailStatus {
  processed = 'PROCESSED',
  processing = 'PROCESSING',
  received = 'RECEIVED',
  failed = 'FAILED',
}

export type TxnDetailProps = UserNFTTxsHistory & { metadata?: any } & {
  time: string
  fee: {
    unit: string
    value: number
  }
  storageInfo: {
    accountId: number
    storageId: number
    tokenId: number
  }
  blockId: number
  indexInBlock: number
  memo?: string
  createdAt: string
  nftData: string
  etherscanBaseUrl?: string
}
export type NFTTableFilter = {
  txType?: UserNFTTxTypes
  limit?: number
  duration?: DateRange<Date | string>
  page: number
}

export type NFTTableProps<Row> = NFTTableFilter & {
  etherscanBaseUrl?: string
  rawData: Row[]
  showFilter?: boolean
  pagination?: {
    pageSize: number
    total: number
  }
  getTxnList: (filter: NFTTableFilter) => Promise<void>

  // showFilter?: boolean;
  showloading: boolean
  accAddress: string
  accountId: number
  // accAddress?: string;
}
