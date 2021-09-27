import { AmmDetail, MyAmmLP } from '@loopring-web/common-resources';
import { Currency } from 'loopring-sdk';

export type MyPoolRow<R> = MyAmmLP<R> & {
    ammDetail: AmmDetail<R>
}


export  type  Method<R> = {
    handleWithdraw: (row: R) => void,
    handleDeposit: (row: R) => void,
}


export type MyPoolTableProps<T, R = MyPoolRow<T>> = {
    rawData: R[];
    pagination?: {
        pageSize: number
    },
    page?: number,
    handlePageChange: (page: number) => void,
    showFilter?: boolean,
    wait?: number;
    showloading?: boolean;
    currency?: Currency
} & Method<R>
