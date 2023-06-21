import * as sdk from '@loopring-web/loopring-sdk'

// export type TransactionSide = {
//     address: string;
//     env: string;
// }

export enum TransactionStatus {
  processing = 'processing',
  processed = 'processed',
  received = 'received',
  failed = 'failed',
}

export const TransactionTradeTypes = {
  allTypes:
    `${sdk.UserTxTypes.DEPOSIT},${sdk.UserTxTypes.TRANSFER},${sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW},${sdk.UserTxTypes.OFFCHAIN_WITHDRAWAL},` +
    `${sdk.UserTxTypes.FORCE_WITHDRAWAL},` +
    `${sdk.UserTxTypes.WITHDRAW_LUCKY_TOKEN},${sdk.UserTxTypes.SEND_LUCKY_TOKEN},${sdk.UserTxTypes.SEND_BACK_LUCKY_TOKEN},` +
    `${sdk.UserTxTypes.UNIFIED_CLAIM},${sdk.UserTxTypes.L2_STAKING},` +
    `${sdk.UserTxTypes.DUAL_INVESTMENT}`,
  receive: `${sdk.UserTxTypes.DEPOSIT}`,
  send: `${sdk.UserTxTypes.TRANSFER},${sdk.UserTxTypes.OFFCHAIN_WITHDRAWAL},${sdk.UserTxTypes.OFFCHAIN_WITHDRAWAL}`,
  forceWithdraw: `${sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW}`,
  redPacket: `${sdk.UserTxTypes.WITHDRAW_LUCKY_TOKEN},${sdk.UserTxTypes.SEND_LUCKY_TOKEN},${sdk.UserTxTypes.SEND_BACK_LUCKY_TOKEN}`,
}

export enum TransactionTradeViews {
  allTypes = 'ALL',
  receive = 'RECEIVE',
  send = 'SEND',
  forceWithdraw = 'FORCE_WITHDRAWAL',
  redPacket = 'RED_PACKET',
}

export type RawDataTransactionItem = {
  side: sdk.UserTxTypes
  // token?: string,
  // tradeType: TransactionTradeTypes,
  // from: string;
  // to: string;
  amount: {
    unit: string
    value: number
  }
  fee: {
    unit: string
    value: number
  }
  memo?: string
  time: number
  txnHash: string
  status: TransactionStatus
  path?: string
} & Partial<sdk.UserTx>
