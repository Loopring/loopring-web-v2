import { AmmDetail, TradeFloat } from 'static-resource';

export type Row<T> = AmmDetail<T> & {
    // currency:  keyof typeof Currency,
    tradeFloat?: TradeFloat,
}
export type PoolTableProps<T,R = Row<T>> = {
    rawData: R[];
    pagination?: {
        pageSize: number
    },
    page?: number,
    handlePageChange: (page: number) => void,
    showFilter?: boolean,
    wait?: number
}
