import { AmmDetail, TradeFloat } from '@loopring-web/common-resources';

export type Row<T> = AmmDetail<T> & {
    // currency:  keyof typeof Currency,
    tradeFloat?: TradeFloat,
}
export type PoolTableProps<T, R = Row<T>> = {
    rawData: R[];
    // pagination?: {
    //     pageSize: number
    // },
    // page?: number,
    // handlePageChange: (page: number) => void,
    showFilter?: boolean,
    wait?: number;
    tableHeight?: number;
    sortMethod:( sortedRows: any[], sortColumn: string)=> any[],
}

