import { WithTranslation, withTranslation } from 'react-i18next'
import { Button, Column, generateColumns, Table, TableProps, } from '../../basic-lib/'
import { Default } from '../../basic-lib/tables/table.stories';
import { FormatterProps } from 'react-data-grid';
import { Typography } from '@mui/material';
import {  FloatTag, PriceTag } from '@loopring-web/common-resources';
import { HeaderCell } from './componnents/HeaderCell';
import React from 'react';
import styled from '@emotion/styled';
import { Currency } from '@loopring-web/loopring-sdk';

interface Row {
    sellData: string,
    buyData: string,
    volume: number,
    price: number,
    priceYuan: number,
    priceDollar: number,
    change24: string,
    showTag: Currency,
    floatTag: keyof typeof FloatTag,
}

const Styled = styled.div`
  ${({theme}) => `
  & .rdg{
    .rdg-cell.float-decrease {
      .btn-change24 {
        background-color: ${theme.colorBase.error};
      }
      .color-price {
        color: ${theme.colorBase.error};
      }
    }
    .rdg-cell.float-increase{
      .btn-change24{
        background-color: ${theme.colorBase.success};
      }
      .color-price {
        color: ${theme.colorBase.success};
      }

    }
  }`
}
`


const generateRows = <Row, SR = unknown>(rawData: Row[], _rest: TableProps<Row, SR>): Row[] => {
    return rawData && Array.isArray(rawData) ? rawData : [];
}
export type TradeFilterTableProps<R> = {
    rawData: R,
} & Partial<TableProps<R, unknown>>


export const TradeFilterTable = withTranslation('tables')(({
                                                               t,
                                                               rawData,
                                                               ...rest
                                                           }: WithTranslation & TradeFilterTableProps<Row>) => {
    // const formattedRawData = props.rawData.map(o => Object.values(o))
    // const [filterType, setFilterType] = React.useState(FilterTradeTypes.allTypes)
    // const [filterDate, setFilterDate] = React.useState(null)
    // const [page, setPage] = React.useState(1)
    // const [totalData, setTotalData] = React.useState(formattedRawData)
    // {
    //     key: 'county',
    //     name: 'County',
    //     width: 200,
    //     formatter({ row }) {
    //         if (row.id === 'id_0') {
    //             const actions = [
    //                 {
    //                     icon: '🗑️',
    //                     callback() {
    //                         alert('Deleting');
    //                     }
    //                 },
    //                 {
    //                     icon: '🔗',
    //                     actions: [
    //                         {
    //                             text: '✍️ Edit Cell',
    //                             callback() {
    //                                 alert('Edit Cell');
    //                             }
    //                         },
    //                         {
    //                             text: '📋 Copy Cell',
    //                             callback() {
    //                                 alert('Copied');
    //                             }
    //                         }
    //                     ]
    //                 }
    //             ];
    //
    //             return (
    //                 <>
    //                     <CellActionsFormatter actions={actions} />
    //                     <div>{row.county}</div>
    //                 </>
    //             );
    //         }
    //
    //         return <>{row.county}</>;
    //     }
    // },
    const [filterBy, setFilterBy] = React.useState('');
    const columnMode: readonly Column<Row, unknown>[] = [
        {
            key: 'tradePair', name: 'tradePair', sortable: true,
            cellClass: (row: Row) => `${row.floatTag}`,
            headerRenderer: (props: any) => <HeaderCell {...props} filterBy={filterBy} setFilterBy={setFilterBy}/>,
            formatter: ({row}: FormatterProps<Row, unknown>) => <>
                <Typography component={'p'} paddingTop={1 / 2}>
                    <Typography component={'span'} title={'sell'} className={'next-coin'}>
                        {row.sellData}
                    </Typography>
                    <Typography component={'i'}>/</Typography>
                    <Typography component={'span'} title={'buy'} variant={'body2'} color={'textSecondary'}>
                        {row.buyData}
                    </Typography>
                </Typography>
                <Typography component={'p'} variant={'body2'}>{t('labelVolume')} {row.volume}</Typography>
            </>
        },
        {
            key: 'price', name: 'labelTradePrice', sortable: true,
            cellClass: (row: Row) => `float-${row.floatTag}`,
            formatter: ({row}: FormatterProps<Row, unknown>) => <>
                <Typography component={'p'} className={'color-price'} paddingTop={1 / 2}>
                    {row.price}
                </Typography>
                <Typography component={'p'}
                            variant={'body2'}>{row.showTag === Currency.usd ? PriceTag.Dollar + row.priceDollar : PriceTag.Yuan + row.priceYuan}</Typography>
            </>
        },
        {
            key: 'change24', name: 'labelQuota24hChange', sortable: true,
            cellClass: (row: Row) => `float-${row.floatTag}`,
            formatter: ({row}: FormatterProps<Row, unknown>) => {
                return <Button className={'btn-change24'} variant={'contained'} size={'small'} color={'primary'}>
                    {row.change24}</Button>
            }
        },
    ]
    const defaultArgs = {
        ...Default.args,
        generateRows,
        generateColumns,
        columnMode,
        sortDefaultKey: 'sortColumn',
        frozeSort: false,
        sortMethod: (sortedRows: Row[], sortColumn: any) => {
            switch (sortColumn) {
                case 'tokenInfo':
                    sortedRows = sortedRows.sort((a, b) => a[ sortColumn ].localeCompare(b[ sortColumn ]));
                    break;
                case 'price':
                case 'change24':
                    sortedRows = sortedRows.sort((a: any, b: any) => Number(a[ sortColumn ]) - Number(b[ sortColumn ]));
                    break;
                default:
            }
            return sortedRows;
        }
    };
    return <Styled>
        <Table<any, unknown> {...{t, ...rest, ...defaultArgs, rawData}}/>
    </Styled>

})
