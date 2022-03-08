import React from 'react'
import { Box, BoxProps, Typography } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next';
import moment from 'moment'
import {  TablePagination, TableProps } from '../../basic-lib'
import { Column, Table, } from '../../basic-lib'
import {
    EmptyValueTag,
    getValuePrecisionThousand,
    globalSetup,
    PriceTag
} from '@loopring-web/common-resources'
import { AmmRecordRow as Row, AmmRecordTableProps, AmmTradeType } from './Interface'
import { FormatterProps } from 'react-data-grid';
import styled from '@emotion/styled';
import { TablePaddingX } from '../../styled';
import { Currency } from '@loopring-web/loopring-sdk';

// enum ActionType {
//     // filter = 'filter',
//     page = 'page'
// }

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${(props: any) =>   {
      if(props.currentheight && props.currentheight>350) {
        return props.currentheight+'px';
      }else{
        return '100%'
      }
    }};
    --template-columns: 420px auto auto !important;

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .textAlignRight {
    text-align: right;
  }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as (props: { currentheight?:number } & BoxProps) => JSX.Element;

const columnMode = ({t}: WithTranslation, currency: Currency): Column<Row<any>, unknown>[] => [
    {
        key: 'style',
        sortable: false,
        width: 'auto',
        minWidth: 240,
        name: t('labelAmmTableType'),
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            const {type, coinA, coinB, amountA, amountB} = row
            const isAdd = type === AmmTradeType.add
            const side = isAdd ? t('labelAmmJoin') : t('labelAmmExit')
            return (
                <Box display={'flex'} alignItems={'center'}>
                    <Typography color={isAdd ? 'var(--color-success)' : 'var(--color-error)'}>{side}</Typography>
                    &nbsp;&nbsp;
                    <Typography component={'span'}>
                        {`${getValuePrecisionThousand(amountA, undefined, undefined, undefined, false, { isTrade: true })} ${coinA.simpleName}`}
                    </Typography>
                    &nbsp;  +  &nbsp;
                    <Typography component={'span'}>
                        {`${getValuePrecisionThousand(amountB, undefined, undefined, undefined, false, { isTrade: true })} ${coinB.simpleName}`}
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
                    currency === Currency.usd ? PriceTag.Dollar + getValuePrecisionThousand(totalDollar, undefined, undefined, undefined, true, { isFait: true }) : PriceTag.Yuan + getValuePrecisionThousand(totalYuan, 2, 2)}
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
                                                                                                 currentheight,
                                                                                                 rowHeight = 44,
                                                                                                 headerRowHeight = 44,
                                                                                                 showFilter = true,
                                                                                                 rawData,
                                                                                                 wait = globalSetup.wait,
                                                                                                 currency =  Currency.usd,
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
        if (handlePageChange) {
            handlePageChange({
                limit: pageSize,
                offset: (currPage - 1) * pageSize,
            });
        }
    }, [handlePageChange, page, pageSize])

    const height = (currentheight || 0) + (!!rawData.length ? 0 : 44)

    return <TableStyled currentheight={height}>
        <Table /* className={'scrollable'}  */ {...{
            ...defaultArgs, t, i18n, tReady,
            ...rest,
            rowHeight,
            headerRowHeight,
            rawData: rawData
        }}/>
        {pagination && !!rawData.length && (
            <TablePagination page={page} pageSize={pageSize} total={pagination.total} onPageChange={_handlePageChange}/>
        )}
    </TableStyled>
})
