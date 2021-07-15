import React from 'react'
import { Box } from '@material-ui/core'
import styled from '@emotion/styled'
import { WithTranslation, withTranslation, TFunction } from 'react-i18next'
import moment from 'moment'
import { Table, Column } from '../../basic-lib/tables'
import { TablePagination } from '../../basic-lib'
import { TablePaddingX } from '../../styled';
import { Filter, FilterTradeTypes } from './components/Filter'
import { TableType, TradeTypes } from 'static-resource';
import { useSettings } from '../../../stores';
import { useDeepCompareEffect } from 'react-use';
import { Row } from '../poolsTable/Interface';

// interface Row {
//     side: TradeTypes;
//     amount: {
//         from: {
//             key: string;
//             value: number;
//         },
//         to: {
//             key: string;
//             value: number
//         }
//     };
//     price: number;
//     fee: number;
//     time: number;
//     cellExpend?: {
//         value: string
//         children: []
//         isExpanded: boolean
//     };
//     children?: Row[];
//     isExpanded?: boolean;
//     formatter?: any;
// }



export type RawDataTradeItem = {
    side: keyof typeof TradeTypes;
    amount: {
        from: {
            key: string;
            value: number|undefined;
        },
        to: {
            key: string;
            value: number|undefined;
        }
    };
    price:{
        key:string
        value:number|undefined,
    }
    // priceDollar: number;
    // priceYuan: number;
    fee: {
        key: string;
        value: number|undefined;
    };
    time: number;
}

export type TradeTableProps = {
    rawData: RawDataTradeItem[];
    pagination?: {
        pageSize: number
    }
    showFilter?: boolean
}

// enum TableType {
//     filter = 'filter',
//     page = 'page'
// }

const TableStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    flex: 1;

    .rdg{
        // --template-columns: 240px auto auto auto 68px 120px !important;
        .rdg-cell.action{
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    ${({theme}) => TablePaddingX({pLeft:theme.unit * 3,pRight:theme.unit * 3})}
` as typeof Box

const StyledSideCell: any = styled(Box)`
    color: ${(props: any) => {
        const {
            value,
            theme: {colorBase},
        } = props
        return value === TradeTypes.Buy ? colorBase.success : colorBase.error
    }}
`

const getColumnModeAssets = (t: TFunction, _currency: 'USD'|'CYN'): Column<RawDataTradeItem, unknown>[] => [
    {
        key: 'side',
        name: t('labelTradeSide'),
        formatter: ({row}) => {
            const tradeType = row['side'] === TradeTypes.Buy?t('labelBuy'): t('labelSell')
            return (
                <div className="rdg-cell-value">
                    <StyledSideCell value={row['side']}>
                        {tradeType}
                    </StyledSideCell>
                </div>
            )
        }
    },
    {
        key: 'amount',
        name: t('labelTradeAmount'),
        formatter: ({row}) => {
            const {from, to} = row['amount']
            return (
                <div className="rdg-cell-value">
                    {`${from.value} ${from.key} -> ${to.value} ${to.key}`}
                </div>
            )
        }
    },
    {
        key: 'price',
        name: t('labelTradePrice'),
        formatter: ({row}) => {
            const {value} = row['price']
            return (
                <div className="rdg-cell-value">
                    {value}
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
            const {key, value} = row['fee']
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
        formatter: ({ row }) => {
            const time = moment(new Date(row['time']), "YYYYMMDDHHMM").fromNow()
            return (
                <div className="rdg-cell-value">
                    {time}
                </div>
            )
        }
    },
]

export const TradeTable = withTranslation('tables')((props: WithTranslation & TradeTableProps) => {
    const { t, pagination, showFilter, rawData } = props
    // const formattedRawData = rawData && Array.isArray(rawData) ? rawData.map(o => Object.values(o)) : []
    const [filterType, setFilterType] = React.useState(FilterTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState(null)
    const [page, setPage] = React.useState(1)
    const [totalData, setTotalData] = React.useState<RawDataTradeItem[]>(rawData)
    const {currency} = useSettings();
    const defaultArgs: any = {
        // rawData: rawData,
        columnMode: getColumnModeAssets(t,currency).filter(o => !o.hidden),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}:any) => columnsRaw as Column<Row<any>, unknown>[],
        style: {
            backgroundColor: ({colorBase}: any) => `${colorBase.backgroundBox}`
        }
    }
    useDeepCompareEffect(()=>{
        setTotalData(rawData);
    },[rawData])

    const pageSize = pagination ? pagination.pageSize : 10;

    const getRenderData = React.useCallback(() => pagination
            ? totalData.slice((page - 1) * pageSize, page * pageSize)
            : totalData
    , [page, pageSize, pagination, totalData])

    const updateData = React.useCallback(({ 
        TableType,
        currFilterType = filterType,
        currFilterDate = filterDate,
    }) => {
        let resultData = rawData ?rawData: []
        // o[0]: tradeType
        if (currFilterType !== FilterTradeTypes.allTypes) {
            resultData = resultData.filter(o => o[ 0 ] === currFilterType)
        }
        if (currFilterDate) {
            const diff = moment(moment()).diff(currFilterDate, 'days')
            // o[4]: date
            resultData = resultData.filter(o => o[ 4 ] === diff)
        }
        if (TableType === 'filter') {
            setPage(1)
        }
        setTotalData(resultData)
    }, [rawData, filterDate, filterType])

    const handleFilterChange = React.useCallback(({ filterType, filterDate }) => {
        setFilterType(filterType)
        setFilterDate(filterDate)
        updateData({ TableType: TableType.filter, currFilterType: filterType, currFilterDate: filterDate })
    }, [updateData])

    const handlePageChange = React.useCallback((page: number) => {
        setPage(page)
        updateData({ TableType: TableType.page, currPage: page })
    }, [updateData])

    const FilterStyled = styled(Box)`
        margin-left: 26px;
    `

    return <TableStyled>
        {showFilter && (
            <FilterStyled>
                <Filter handleFilterChange={handleFilterChange} />
            </FilterStyled>
        )}
        <Table className={'scrollable'} {...{...defaultArgs, ...props, rawData: getRenderData() }}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={totalData.length} onPageChange={handlePageChange}/>
        )}
    </TableStyled>
})
