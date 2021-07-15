import { CoinInfo } from '../../../static-resource';


export enum AmmTradeType {
    add = 'add',
    swap = 'swap',
    remove = 'remove'
}

enum TxStatus {
    processing = "processing",
    processed = "processed",
    received = "received",
    failed = "failed"
}

export interface AmmRecordRow<C> {
    totalDollar: number;
    totalYuan: number;
    amountA: number;
    amountB: number;
    time: number;
    type: keyof typeof AmmTradeType;
    coinA: CoinInfo<C>;
    coinB: CoinInfo<C>;
    status?: keyof typeof TxStatus;
}

export type AmmRecordTableProps<T, R = AmmRecordRow<T>> = {
    rawData: R[];
    pagination?: {
        pageSize: number
    },
    page?: number,
    handlePageChange: (page: number) => void,
    showFilter?: boolean,
    wait?: number
}
