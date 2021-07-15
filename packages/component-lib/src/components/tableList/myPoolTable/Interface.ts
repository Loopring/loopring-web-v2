import { AmmDetail, MyAmmLP } from 'static-resource';

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
    wait?: number
} & Method<R>
