import React from 'react'
import { Box, Typography } from '@material-ui/core'
import { Trans, withTranslation, WithTranslation } from 'react-i18next';
import moment from 'moment'
import { TablePagination, TableProps } from '../../basic-lib'
import { Column, Table, } from '../../basic-lib/'
import { Currency, EmptyValueTag, getThousandFormattedNumbers, globalSetup, PriceTag } from 'static-resource'
import { AmmRecordRow as Row, AmmRecordTableProps, AmmTradeType } from './Interface'
import { FormatterProps } from 'react-data-grid';
import styled from '@emotion/styled';
import { TablePaddingX } from '../../styled';
import { useDeepCompareEffect } from 'react-use';


// enum ActionType {
//     // filter = 'filter',
//     page = 'page'
// }

const TableStyled = styled(Box)`
  .rdg {
    --template-columns: 280px 240px auto auto  !important;

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
            const {type, coinA, coinB} = row
            if (type === AmmTradeType.add) {
                return <Trans i18nKey={'valueAddTOAMM'}>
                    Add &nbsp;
                    <Typography component={'span'}>
                        {coinA.simpleName}
                    </Typography>
                    &nbsp;  and  &nbsp;
                    <Typography component={'span'}>
                        {coinB.simpleName}
                    </Typography>
                </Trans>
            } else if (type === AmmTradeType.swap) {
                return <Trans i18nKey={'valueSwapForAMM'}>
                    Swap &nbsp;
                    <Typography component={'span'}>
                        {coinA.simpleName}
                    </Typography>
                    &nbsp; for &nbsp;
                    <Typography component={'span'}>
                        {coinB.simpleName}
                    </Typography>
                </Trans>
            } else {
                return <Trans i18nKey={'valueRemoveTOAMM'}>
                    Swap &nbsp;
                    <Typography component={'span'}>
                        {coinA.simpleName}
                    </Typography>
                    &nbsp; remove  &nbsp;
                    <Typography component={'span'}>
                        {coinB.simpleName}
                    </Typography>
                </Trans>
            }

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
    {
        key: 'tokenAmount',
        sortable: false,
        width: 'auto',
        name: t('labelAmmTokenAmount'),
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            const {amountA, amountB, coinA, coinB} = row;
            return <Typography component={'span'}>
                {typeof amountA === 'undefined' ? EmptyValueTag : amountA} {coinA.simpleName} + {typeof amountB === 'undefined' ? EmptyValueTag : amountA} {coinB.simpleName}
            </Typography>
        }
    },
    {
        key: 'status',
        sortable: false,
        width: 'auto',
        name: t('labelStatus'),
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            // const {amountA, amountB, coinA, coinB} = row;
            return <Typography component={'span'}>
                {row.status}
                {/*{ typeof amountA === 'undefined'? EmptyValueTag : amountA } {coinA.simpleName} + { typeof amountB === 'undefined'? EmptyValueTag : amountA } {coinB.simpleName}*/}
            </Typography>
        }
    },
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
                                                                                                 ...rest
                                                                                             }: AmmRecordTableProps<T> & WithTranslation) => {
    const [page, setPage] = React.useState(rest?.page ? rest.page : 1);
    const [totalData, setTotalData] = React.useState<Row<T>[]>(rawData && Array.isArray(rawData) ? rawData : []);
    useDeepCompareEffect(() => {
        setTotalData(rawData)
    }, [rawData])

    const defaultArgs: TableProps<any, any> = {
        rawData,
        columnMode: columnMode({t, i18n, tReady}, Currency.dollar),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}) => columnsRaw as Column<Row<any>, unknown>[],
    }


    const pageSize = pagination ? pagination.pageSize : 10;

    const getRenderData = React.useCallback(() => pagination
        ? totalData.slice((page - 1) * pageSize, page * pageSize)
        : totalData
        , [page, pageSize, pagination, totalData])

    const _handlePageChange = React.useCallback((page: number) => {
        setPage(page);
        // updateData({actionType: ActionType.page, currPage: page})
        handlePageChange(page);
    }, [handlePageChange])

    return <TableStyled>
        <Table className={'scrollable'}  {...{
            ...defaultArgs, t, i18n, tReady, ...rest,
            rawData: getRenderData()
        }}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={totalData.length} onPageChange={_handlePageChange}/>
        )}
    </TableStyled>
})
