import React from 'react'
import { Box } from '@material-ui/core'
import styled from '@emotion/styled'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import moment from 'moment'
import { Column, Table } from '../../basic-lib/tables'
import { TablePagination } from '../../basic-lib'
import { TableFilterStyled, TablePaddingX } from '../../styled';
import { Filter, FilterTradeTypes } from './components/Filter'
import { getThousandFormattedNumbers, TableType } from 'static-resource';
import { useSettings } from '../../../stores';
import { useDeepCompareEffect } from 'react-use';
import { Row } from '../poolsTable/Interface';
import { AmmSideTypes } from './interface'

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

export type RawDataAmmItem = {
    side: AmmSideTypes;
    amount: {
        from: {
            key: string;
            value?: string;
        },
        to: {
            key: string;
            value?: string;
        }
    };
    lpTokenAmount?: string;
    fee: {
        key: string;
        value?: string;
    };
    time: number;
}

export type AmmTableProps = {
    rawData: RawDataAmmItem[];
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

  .rdg {
    // --template-columns: 240px auto auto auto 68px 120px !important;
    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box

const StyledSideCell: any = styled(Box)`
  color: ${(props: any) => {
    const {
      value,
      theme: {colorBase},
    } = props
    return value === AmmSideTypes.Join ? colorBase.success : colorBase.error
  }}
`

const getColumnModeAssets = (t: TFunction, _currency: 'USD' | 'CYN'): Column<RawDataAmmItem, unknown>[] => [
    {
        key: 'side',
        name: t('labelAmmSide'),
        formatter: ({row}) => {
            const tradeType = row[ 'side' ] === AmmSideTypes.Exit ? t('labelAmmExit') : t('labelAmmJoin')
            return (
                <div className="rdg-cell-value">
                    <StyledSideCell value={row[ 'side' ]}>
                        {tradeType}
                    </StyledSideCell>
                </div>
            )
        }
    },
    {
        key: 'amount',
        name: t('labelAmmAmount'),
        formatter: ({row}) => {
            const {from, to} = row[ 'amount' ]
            return (
                <div className="rdg-cell-value">
                    {`${from.value} ${from.key} + ${to.value} ${to.key}`}
                </div>
            )
        }
    },
    {
        key: 'lpTokenAmount',
        name: t('labelAmmLpTokenAmount'),
        formatter: ({row}) => {
            const amount = row[ 'lpTokenAmount' ]
            const renderValue = row[ 'side' ] === AmmSideTypes.Join
                ? `+${getThousandFormattedNumbers(Number(amount))}`
                : `-${getThousandFormattedNumbers(Number(amount))}`
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
        name: t('labelAmmFee'),
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
        name: t('labelAmmRecordTime'),
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

export const AmmTable = withTranslation('tables')((props: WithTranslation & AmmTableProps) => {
    const {t, pagination, showFilter, rawData} = props
    // const formattedRawData = rawData && Array.isArray(rawData) ? rawData.map(o => Object.values(o)) : []
    const [filterType, setFilterType] = React.useState(FilterTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState(null)
    const [page, setPage] = React.useState(1)
    const [totalData, setTotalData] = React.useState<RawDataAmmItem[]>(rawData)
    const {currency} = useSettings();
    const defaultArgs: any = {
        // rawData: rawData,
        columnMode: getColumnModeAssets(t, currency).filter(o => !o.hidden),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}: any) => columnsRaw as Column<Row<any>, unknown>[],
        style: {
            backgroundColor: ({colorBase}: any) => `${colorBase.backgroundBox}`
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
                                          }) => {
        let resultData = rawData ? rawData : []
        if (currFilterType !== FilterTradeTypes.allTypes) {
            resultData = resultData.filter(o => o.side === currFilterType)
        }
        if (currFilterDate) {
            // const _diff = moment(moment()).diff(currFilterDate, 'days')
            resultData = resultData.filter(o => o.time)
        }
        if (TableType === 'filter') {
            setPage(1)
        }
        setTotalData(resultData)
    }, [rawData, filterDate, filterType])

    const setFilterItems = React.useCallback(({filterType, filterDate}) => {
        setFilterType(filterType)
        setFilterDate(filterDate)
    }, [])

    const handleFilterChange = React.useCallback(({filterType, filterDate}) => {
        setFilterItems({filterType, filterDate})
        updateData({TableType: TableType.filter, currFilterType: filterType, currFilterDate: filterDate})
    }, [updateData, setFilterItems])

    const handlePageChange = React.useCallback((page: number) => {
        setPage(page)
        updateData({TableType: TableType.page, currPage: page})
    }, [updateData])

    return <TableStyled>
        {showFilter && (
            <TableFilterStyled>
                <Filter
                    handleFilterChange={handleFilterChange}
                    setFilterItems={setFilterItems}
                    filterType={filterType}
                    filterDate={filterDate}
                />
            </TableFilterStyled>
        )}
        <Table {...{...defaultArgs, ...props, rawData: getRenderData()}}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={totalData.length} onPageChange={handlePageChange}/>
        )}
    </TableStyled>
})
