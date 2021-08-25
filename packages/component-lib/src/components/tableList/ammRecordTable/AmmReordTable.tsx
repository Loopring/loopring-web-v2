import React from 'react'
import { Box, Typography } from '@material-ui/core'
import { Trans, withTranslation, WithTranslation } from 'react-i18next';
import moment from 'moment'
import { TablePagination, TableProps } from '../../basic-lib'
import { Column, Table, } from '../../basic-lib/'
import { Currency, EmptyValueTag, getThousandFormattedNumbers, globalSetup, PriceTag } from '@loopring-web/common-resources'
import { AmmRecordRow as Row, AmmRecordTableProps, AmmTradeType } from './Interface'
import { FormatterProps } from 'react-data-grid';
import styled from '@emotion/styled';
import { TablePaddingX } from '../../styled';
import { useDeepCompareEffect } from 'react-use';
import { getValuePrecision } from '@loopring-web/common-resources'

// enum ActionType {
//     // filter = 'filter',
//     page = 'page'
// }

const TableStyled = styled(Box)`
    flex: 1;
    .rdg {
        --template-columns: 420px auto auto !important;

        .rdg-cell.action {
        display: flex;
        justify-content: center;
        align-items: center;
        }
    }
    .textAlignRight{
        text-align: right;
    }
    ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box

const columnMode = ({t}: WithTranslation, currency: 'USD' | 'CYN'): Column<Row<any>, unknown>[] => [
    {
        key: 'style',
        sortable: false,
        width: 'auto',
        minWidth: 240,
        name: t('labelPool'),
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            const {type, coinA, coinB, amountA, amountB} = row
            const isAdd = type === AmmTradeType.add
            const side = isAdd ? 'Add' : 'Remove'
            return (
                <Box display={'flex'} alignItems={'center'}>
                    <Typography color={isAdd ? 'var(--color-success)' : 'var(--color-error)'}>{side}</Typography>
                    &nbsp;
                    <Typography component={'span'}>
                        {`${getValuePrecision(amountA, 4)} ${coinA.simpleName}`}
                    </Typography>
                    &nbsp;  +  &nbsp;
                    <Typography component={'span'}>
                        {`${getValuePrecision(amountB, 4)} ${coinB.simpleName}`}
                    </Typography>
                </Box>
            )
        }
    },
    {
        key: 'totalValue',
        sortable: false,
        width: 'auto',
        name: t('labelAmmTotalValue'),
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            const {totalDollar, totalYuan} = row
            return <Typography
                component={'span'}> {
                typeof totalDollar === 'undefined' ? EmptyValueTag :
                    currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(totalDollar) : PriceTag.Yuan + getThousandFormattedNumbers(totalYuan)}
            </Typography>

        }
    },
    // {
    //     key: 'tokenAmount',
    //     sortable: false,
    //     width: 'auto',
    //     name: t('labelAmmTokenAmount'),
    //     formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
    //         const {amountA, amountB, coinA, coinB} = row;
    //         return <Typography component={'span'}>
    //             {typeof amountA === 'undefined' ? EmptyValueTag : amountA} {coinA.simpleName} + {typeof amountB === 'undefined' ? EmptyValueTag : amountA} {coinB.simpleName}
    //         </Typography>
    //     }
    // },
    // {
    //     key: 'status',
    //     sortable: false,
    //     width: 'auto',
    //     name: t('labelStatus'),
    //     formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
    //         // const {amountA, amountB, coinA, coinB} = row;
    //         return <Typography component={'span'}>
    //             {row.status}
    //             {/*{ typeof amountA === 'undefined'? EmptyValueTag : amountA } {coinA.simpleName} + { typeof amountB === 'undefined'? EmptyValueTag : amountA } {coinB.simpleName}*/}
    //         </Typography>
    //     }
    // },
    {
        key: 'time',
        sortable: false,
        width: 'auto',
        headerCellClass: 'textAlignRight',
        cellClass: 'textAlignRight',
        name: t('labelAmmTime'),
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            const {time} = row;
            let timeString;
            if (typeof time === 'undefined') {
                timeString = EmptyValueTag
            } else {
                timeString = moment(new Date(time), "YYYYMMDDHHMM").fromNow();
            }
            return <Typography component={'span'} textAlign={'right'}>
                {timeString}
            </Typography>
            // 10 年前

        }
    },
]


export const AmmRecordTable = withTranslation('tables')(<T extends { [ key: string ]: any }>({
                                                                                                 t, i18n,
                                                                                                 tReady,
                                                                                                 handlePageChange,
                                                                                                 pagination,
                                                                                                 showFilter = true,
                                                                                                 rawData,
                                                                                                 wait = globalSetup.wait,
                                                                                                 currency = 'USD',
                                                                                                 ...rest
                                                                                             }: AmmRecordTableProps<T> & WithTranslation) => {
    const [page, setPage] = React.useState(1);
    // const [totalData, setTotalData] = React.useState<Row<T>[]>(rawData && Array.isArray(rawData) ? rawData : []);
    // useDeepCompareEffect(() => {
    //     setTotalData(rawData)
    // }, [rawData])

    const defaultArgs: TableProps<any, any> = {
        rawData,
        columnMode: columnMode({t, i18n, tReady}, currency),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}) => columnsRaw as Column<Row<any>, unknown>[],
    }


    const pageSize = pagination ? pagination.pageSize : 10;

    // const getRenderData = React.useCallback(() => pagination
    //     ? totalData.slice((page - 1) * pageSize, page * pageSize)
    //     : totalData
    //     , [page, pageSize, pagination, totalData])

    const _handlePageChange = React.useCallback((currPage: number) => {
        if (currPage === page) return
        setPage(currPage);
        // updateData({actionType: ActionType.page, currPage: page})
        handlePageChange({
            limit: pageSize,
            offset: (currPage - 1) * pageSize,
        });
    }, [handlePageChange, page, pageSize])

    return <TableStyled>
        <Table /* className={'scrollable'}  */ {...{
            ...defaultArgs, t, i18n, tReady, ...rest,
            rawData: rawData
        }}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={pagination.total} onPageChange={_handlePageChange}/>
        )}
    </TableStyled>
})
