import * as sdk from "@loopring-web/loopring-sdk";

// export type TransactionSide = {
//     address: string;
//     env: string;
// }

// export enum TransactionStatus {
//   processing = "processing",
//   processed = "processed",
//   received = "received",
//   failed = "failed",
// }
// export enum TransactionTradeTypes {
//   allTypes = "all",
//   deposit = "DEPOSIT",
//   withdraw = "OFFCHAIN_WITHDRAWAL",
//   transfer = "TRANSFER",
//   forceWithdraw = "DELEGATED_FORCE_WITHDRAW",
// }
// export const TransactionTradeTypes = {
//   allTypes: `${sdk.UserTxTypes.DEPOSIT},${sdk.UserTxTypes.TRANSFER},${sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW},${sdk.UserTxTypes.OFFCHAIN_WITHDRAWAL},${sdk.UserTxTypes.FORCE_WITHDRAWAL}`,
//   receive: `${sdk.UserTxTypes.DEPOSIT}`,
//   send: `${sdk.UserTxTypes.TRANSFER},${sdk.UserTxTypes.OFFCHAIN_WITHDRAWAL},onchain_withdrawal`,
//   forceWithdraw: `${sdk.UserTxTypes.DELEGATED_FORCE_WITHDRAW}`,
// };
// export enum TransactionTradeViews {
//   allTypes = "ALL",
//   receive = "RECEIVE",
//   send = "SEND",
//   forceWithdraw = "FORCE_WITHDRAWAL",
// }

export type RawDataDefiTxsItem = Partial<sdk.UserDefiTxsHistory>;
