export enum TransactionTradeTypes {
    allTypes = 'All Types',
    deposit = 'Deposit',
    withdraw = 'Withdraw',
    transfer = 'Transfer'
}

// export type TransactionSide = {
//     address: string;
//     env: string;
// }

export enum TransactionStatus {
    processing = "processing",
    processed = "processed",
    received = "received",
    failed = "failed"
}

export type RawDataTransactionItem = {
    token?: string,
    tradeType: TransactionTradeTypes,
    from: string;
    to: string;
    amount: number;
    fee: {
        unit: string;
        value: number;
    };
    memo?: string;
    time: number;
    txnHash: string;
    status: TransactionStatus;
    path?: string;
}