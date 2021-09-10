import React from 'react'
import { Box, BoxProps } from '@mui/material'
import styled from '@emotion/styled'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import moment from 'moment'
import { Column, Table } from '../../basic-lib/tables'
import { TablePagination } from '../../basic-lib'
import { TableFilterStyled, TablePaddingX } from '../../styled';
import { Filter, FilterTradeTypes } from './components/Filter'
import { EmptyValueTag, getValuePrecisionThousand, TableType, TradeTypes } from '@loopring-web/common-resources';
import { useSettings } from '../../../stores';
import { useDeepCompareEffect } from 'react-use';
import { Row } from '../poolsTable/Interface';
import { DateRange } from '@mui/lab'

export type RawDataTradeItem = {
    side: keyof typeof TradeTypes;
    amount: {
        from: {
            key: string;
            value: number | undefined;
        },
        to: {
            key: string;
            value: number | undefined;
        }
    };
    price: {
        key: string
        value: number | undefined,
    }
    // priceDollar: number;
    // priceYuan: number;
    fee: {
        key: string;
        value: number | undefined;
    };
    time: number;
}

export type TradeTableProps = {
    rawData: RawDataTradeItem[];
    pagination?: {
        pageSize: number,
        total: number,
    }
    showFilter?: boolean;
    currentheight?: number;
    rowHeight?: number;
    headerRowHeight?: number;
}

// enum TableType {
//     filter = 'filter',
//     page = 'page'
// }

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${(props: any) => props.currentheight}px;
    --template-columns: 320px auto auto auto !important;

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .rdg-header-row {
      // background-color: inherit !important;
    }
  }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as (props: { currentheight?:number } & BoxProps) => JSX.Element;

const StyledSideCell: any = styled(Box)`
`

const getColumnModeAssets = (t: TFunction, _currency: 'USD' | 'CYN'): Column<RawDataTradeItem, unknown>[] => [
    {
        key: 'side',
        name: t('labelTradeSide'),
        formatter: ({row}) => {
            // const tradeType = row[ 'side' ] === TradeTypes.Buy ? t('labelBuy') : t('labelSell')
            const {from, to} = row[ 'amount' ]
            const fromValue = from.value ? getValuePrecisionThousand(from.value, 4, 2) : EmptyValueTag
            const toValue = to.value ? getValuePrecisionThousand(to.value, 4, 2) : EmptyValueTag

            return (
                <div className="rdg-cell-value">
                    <StyledSideCell value={row[ 'side' ]}>
                        {`${fromValue} ${from.key} \u2192 ${toValue} ${to.key}`}
                    </StyledSideCell>
                </div>
            )
        }
    },
    // {
    //     key: 'amount',
    //     name: t('labelTradeAmount'),
    //     formatter: ({row}) => {
    //         const {from, to} = row[ 'amount' ]
    //         const fromValue = from.value ? getThousandFormattedNumbers(Number(from.value)) : EmptyValueTag
    //         const toValue = to.value ? getThousandFormattedNumbers(Number(to.value)) : EmptyValueTag
    //         return (
    //             <div className="rdg-cell-value">
    //                 {`${fromValue} ${from.key} \u279E ${toValue} ${to.key}`}
    //             </div>
    //         )
    //     }
    // },
    {
        key: 'price',
        name: t('labelTradePrice'),
        formatter: ({row}) => {
            const {value} = row[ 'price' ]
            const renderValue = value ? (getValuePrecisionThousand(Number(value), 6, 2)) : EmptyValueTag
            return (
                <div className="rdg-cell-value">
                    {renderValue}
                    {/*{currency === Currency.dollar ?*/}
                    {/*    PriceTag.Dollar + getThousandFormattedNumbers(priceDollar)*/}
                    {/*    : PriceTag.Yuan + getThousandFormattedNumbers(priceYuan)}*/}
                </div>
            )
        }
    },
    {
        key: 'fee',
        name: t('labelTradeFee'),
        formatter: ({row}) => {
            const {key, value} = row[ 'fee' ]
            return (
                <div className="rdg-cell-value">
                    {`${value} ${key}`}
                </div>
            )
        }
    },
    {
        key: 'time',
        name: t('labelTradeTime'),
        // minWidth: 400,
        formatter: ({row}) => {
            const time = moment(new Date(row[ 'time' ]), "YYYYMMDDHHMM").fromNow()
            return (
                <div className="rdg-cell-value">
                    {time}
                </div>
            )
        }
    },
]

export const TradeTable = withTranslation('tables')(({
                                                         t,
                                                         pagination,
                                                         showFilter,
                                                         rawData,
                                                         currentheight,
                                                         rowHeight = 44,
                                                         headerRowHeight = 44,
                                                         ...rest
                                                     }: WithTranslation & TradeTableProps) => {
    const [filterType, setFilterType] = React.useState(FilterTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState<DateRange<string | Date>>([null, null])
    const [filterPair, setFilterPair] = React.useState('all')
    const [page, setPage] = React.useState(1)
    const [totalData, setTotalData] = React.useState<RawDataTradeItem[]>(rawData)
    const {currency} = useSettings();
    const defaultArgs: any = {
        columnMode: getColumnModeAssets(t, currency).filter(o => !o.hidden),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}: any) => columnsRaw as Column<Row<any>, unknown>[],
        style: {
            backgroundColor: ({colorBase}: any) => `${colorBase.box}`
        }
    }
    useDeepCompareEffect(() => {
        setTotalData(rawData);
    }, [rawData])

    const pageSize = pagination ? pagination.pageSize : 10;

    const getRenderData = React.useCallback(() => pagination
            ? totalData.slice((page - 1) * pageSize, page * pageSize)
            : totalData
        , [page, pageSize, pagination, totalData])

    const updateData = React.useCallback(({
                                              TableType,
                                              currFilterType = filterType,
                                              currFilterDate = filterDate,
                                              currFilterPair = filterPair
                                          }) => {
        let resultData = rawData ? rawData : []
        if (currFilterType !== FilterTradeTypes.allTypes) {
            resultData = resultData.filter(o => o.side === (currFilterType === TradeTypes.Buy ? TradeTypes.Buy : TradeTypes.Sell))
        }
        if (currFilterDate[ 0 ] && currFilterDate[ 1 ]) {
            const startTime = Number(moment(currFilterDate[ 0 ]).format('x'))
            const endTime = Number(moment(currFilterDate[ 1 ]).format('x'))
            resultData = resultData.filter(o => o.time < endTime && o.time > startTime)
        }
        if (currFilterPair !== 'all') {
            resultData = resultData.filter(o => {
                const pair = `${o.amount.from.key} - ${o.amount.to.key}`
                return pair === currFilterPair
            })
        }
        if (TableType === 'filter') {
            setPage(1)
        }
        setTotalData(resultData)
    }, [rawData, filterDate, filterType, filterPair])

    const handleFilterChange = React.useCallback(({type = filterType, date = filterDate, pair = filterPair}) => {
        setFilterType(type)
        setFilterDate(date)
        setFilterPair(pair)
        updateData({
            TableType: TableType.filter,
            currFilterType: type,
            currFilterDate: date,
            currFilterPair: pair
        })
    }, [updateData, filterDate, filterType, filterPair])

    const handlePageChange = React.useCallback((page: number) => {
        setPage(page)
        updateData({TableType: TableType.page, currPage: page})
    }, [updateData])

    const handleReset = () => {
        setFilterType(FilterTradeTypes.allTypes)
        setFilterDate([null, null])
        setFilterPair('all')
        updateData({
            TableType: 'filter',
            currFilterType: FilterTradeTypes.allTypes,
            currFilterDate: [null, null],
            currFilterPair: 'all'
        })
    }

    return <TableStyled currentheight={currentheight} >
        {showFilter && (
            <TableFilterStyled>
                <Filter {...{
                    rawData,
                    handleFilterChange,
                    filterType,
                    filterDate,
                    filterPair,
                    handleReset,
                }} />
            </TableFilterStyled>
        )}
        <Table className={'scrollable'}   {...{
            ...defaultArgs,
            rowHeight,
            headerRowHeight,
            ...rest, rawData: getRenderData()
        }}/>
        {pagination && (
            <TablePagination height={rowHeight} page={page} pageSize={pageSize} total={totalData.length} onPageChange={handlePageChange}/>
        )}
    </TableStyled>
})
