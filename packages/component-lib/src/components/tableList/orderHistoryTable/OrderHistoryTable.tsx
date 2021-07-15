import { useCallback, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Box } from '@material-ui/core'
import { TFunction, WithTranslation, withTranslation } from 'react-i18next';
import moment from 'moment'
import { DropDownIcon, EmptyValueTag, TableType, TradeStatus, TradeTypes } from '@loopring-web/common-resources'
import { Column, generateColumns, generateRows, Popover, PopoverType, Table, TablePagination } from '../../basic-lib'
import { SingleOrderHistoryTable } from './SingleOrderHistoryTable'
import { Filter, FilterTradeTypes } from './components/Filter'
import { TableFilterStyled, TablePaddingX } from '../../styled'

// export enum OrderSide {
//     sell = 'Sell',
//     buy = 'Buy'
// }


// enum ActionType {
//     filter = 'filter',
//     page = 'page'
// }

export type OrderPair = {
    from: {
        key: string;
        value: number;
    };
    to: {
        key: string;
        value: number;
    }
}

export interface OrderHistoryRow {
    side: keyof typeof TradeTypes
    amount: OrderPair
    average: number
    filledAmount: OrderPair
    filledPrice: number
    time: number
    status: keyof typeof TradeStatus;
    sortColumn: string
    filterColumn: string
    actionsStatus: object
}

export type OrderHistoryTableDetailItem = {
    amount: OrderPair;
    tradingPrice: number;
    filledPrice: number;
    time: number;
    total: {
        key: string;
        value: number;
    }
}

export type OrderHistoryRawDataItem = {
    side: TradeTypes;
    amount: OrderPair;
    average: number;
    filledAmount: OrderPair;
    filledPrice: {
        key: string;
        value: number;
    }
    time: number;
    status: TradeStatus;
    detailTable: OrderHistoryTableDetailItem[]
}

const LastDayPriceChangedCell: any = styled(Box)`
  color: ${(props: any) => {
    const {
      value,
      theme: {colorBase},
    } = props
    return value === TradeTypes.Buy ? colorBase.success : colorBase.error
  }};
`

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    --template-columns: 80px 150px auto 150px auto auto 130px !important;

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box

export interface OrderHistoryTableProps {
    rawData: OrderHistoryRawDataItem[];
    pagination?: {
        pageSize: number;
    }
    showFilter?: boolean
}

const getColumnModeOrderHistory = (t: TFunction): Column<OrderHistoryRow, unknown>[] => [
    {
        key: 'side',
        name: t('labelOrderSide'),
        formatter: ({row, column}) => {
            const value = row[ column.key ]
            return (
                <div className="rdg-cell-value">
                    <LastDayPriceChangedCell value={value}>
                        {value}
                    </LastDayPriceChangedCell>
                </div>
            )
        },
    },
    {
        key: 'amount',
        name: t('labelOrderAmount'),
        formatter: ({row, column}) => {
            const {from, to} = row[ column.key ]
            const {key: keyFrom, value: valueFrom} = from
            const {key: keyTo, value: valueTo} = to
            const renderValue = `${valueFrom} ${keyFrom}->${valueTo} ${keyTo}`
            return <div className="rdg-cell-value">{renderValue}</div>
        },
    },
    {
        key: 'average',
        name: t('labelOrderAverage'),
        formatter: ({row, column}) => {
            const value = row[ column.key ]
            const hasValue = Number.isFinite(value)
            const renderValue = hasValue ? value.toFixed(6) : EmptyValueTag
            return <div className="rdg-cell-value">{renderValue}</div>
        },
    },
    {
        key: 'filledAmount',
        name: t('labelOrderFilledAmount'),
        formatter: ({row, column}) => {
            const {from, to} = row[ column.key ]
            const {key: keyFrom, value: valueFrom} = from
            const {key: keyTo, value: valueTo} = to
            const renderValue = `${valueFrom} ${keyFrom}->${valueTo} ${keyTo}`
            return <div className="rdg-cell-value">{renderValue}</div>
        },
    },
    {
        key: 'filledPrice',
        name: t('labelOrderFilledPrice'),
        formatter: ({row, column}) => {
            const {value, key} = row[ column.key ]
            // const unit = (row as any).amount[ 0 ].key;
            const hasValue = Number.isFinite(value)
            const renderValue = hasValue ? `${value.toFixed(6)} ${key}` : EmptyValueTag
            return (
                <div className="rdg-cell-value">
                    <span>{renderValue}</span>
                </div>
            )
        },
    },
    {
        key: 'time',
        name: t('labelOrderTime'),
        formatter: ({row, column}) => {
            const value = row[ column.key ]
            const renderValue = Number.isFinite(value)
                ? moment(new Date(row[ 'time' ]), "YYYYMMDDHHMM").fromNow()
                : EmptyValueTag
            return (
                <div className="rdg-cell-value">
                    <span>{renderValue}</span>
                </div>
            )
        },
    },
    {
        key: 'status',
        name: t('labelOrderStatus'),
        formatter: ({row, column, rowIdx}) => <>
            <CellStatus {...{row, column, rowIdx}} />
        </>
    }, {
        key: 'detail',
        name: '',
        hidden: true
    }
]

const CellStatus = ({row, column, rowIdx}: any) => {
    const value = row[ column.key ]
    const popupId = `${column.key}-${rowIdx}`
    const [isOpen, setIsOpen] = useState(false)
    const RenderValue: any = styled.span`
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: ${({theme}) => {
        const {colorBase} = theme
        return value === TradeStatus.Processed
                ? colorBase.success
                : value === TradeStatus.Expired ? colorBase.textSecondary
                        : colorBase.textPrimary
      }};
      width: 110px;
      padding-right: 10px;

      & svg {
        font-size: 14px;
        transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        transform: ${() => isOpen ? 'rotate(180deg)' : ''};
      }
    `
    const popupContent = [
        {
            amount: {
                from: {
                    key: 'ETH',
                    value: 1.05
                },
                to: {
                    key: 'LRC',
                    value: 2454.33
                }
            },
            tradingPrice: 2934.07,
            filledPrice: 2935.00,
            time: 1,
            total: {
                key: 'LRC',
                value: 850
            }
        },
        {
            amount: {
                from: {
                    key: 'ETH',
                    value: 1.05
                },
                to: {
                    key: 'LRC',
                    value: 2454.33
                }
            },
            tradingPrice: 2934.07,
            filledPrice: 2935.00,
            time: 1,
            total: {
                key: 'LRC',
                value: 850
            }
        },
        {
            amount: {
                from: {
                    key: 'ETH',
                    value: 1.05
                },
                to: {
                    key: 'LRC',
                    value: 2454.33
                }
            },
            tradingPrice: 2934.07,
            filledPrice: 2935.00,
            time: 1,
            total: {
                key: 'LRC',
                value: 850
            }
        },
    ]

    const RenderPopover = styled.div`
      width: 700px;
      margin: 12px;
      max-height: 250px;

      .contentWrapper {
        max-height: 250px;
        overflow: scroll;
      }
    `
    let actualValue = ''
    switch (value) {
        case TradeStatus.Processing:
            actualValue = 'Processing';
            break;
        case TradeStatus.Processed:
            actualValue = 'Processed';
            break;
        case TradeStatus.Cancelling:
            actualValue = 'Cancelling';
            break;
        case TradeStatus.Cancelled:
            actualValue = 'Cancelled';
            break;
        case TradeStatus.Expired:
            actualValue = 'Expired'
            break;
        case TradeStatus.Waiting:
            actualValue = 'Waiting'
            break;
        default:
            actualValue = ''
    }
    const triggerContent =
        <div style={{width: 110}}>
            <RenderValue>
                {actualValue}
                <DropDownIcon/>
            </RenderValue>
        </div>

    const popoverContent =
        <RenderPopover>
            <div className="arrowPopover"/>
            <div className="contentWrapper">
                <SingleOrderHistoryTable rawData={popupContent}/>
            </div>
        </RenderPopover>

    return <div className="rdg-cell-value">
        <Popover
            type={PopoverType.click}
            popupId={popupId}
            // children={triggerContent}
            popoverContent={popoverContent}
            handleStateChange={setIsOpen}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            arrowHorizon={{
                right: 10
            }}
        >
            {triggerContent}
        </Popover>
    </div>
}

export const OrderHistoryTable = withTranslation('tables')((props: OrderHistoryTableProps & WithTranslation) => {
    const {t, rawData, pagination, showFilter} = props
    const actionColumns = ['status']
    const defaultArgs: any = {
        rawData: [],
        columnMode: getColumnModeOrderHistory(t).filter(o => !o.hidden),
        generateRows,
        generateColumns,
        actionColumns,
        style: {
            backgroundColor: ({colorBase}: any) => `${colorBase.backgroundBox}`
        }
    }

    const formattedRawData = rawData && Array.isArray(rawData) ? rawData.map(o => Object.values(o)) : []
    const [filterType, setFilterType] = useState(FilterTradeTypes.allTypes)
    const [filterDate, setFilterDate] = useState(null)
    const [page, setPage] = useState(1)
    const [totalData, setTotalData] = useState(formattedRawData)

    useEffect(() => {
        setTotalData(rawData && Array.isArray(rawData) ? rawData.map(o => Object.values(o)) : [])
    }, [rawData])

    const pageSize = pagination ? pagination.pageSize : 10

    const getRenderData = useCallback(() => pagination
        ? totalData.slice((page - 1) * pageSize, page * pageSize)
        : totalData
        , [page, pageSize, pagination, totalData])

    const updateData = useCallback(({
                                        actionType,
                                        currFilterType = filterType,
                                        currFilterDate = filterDate,
                                    }) => {
        // let resultData = cloneDeep(formattedRawData)
        let resultData = rawData && Array.isArray(rawData) ? rawData.map(o => Object.values(o)) : []
        // o[0]: tradeType
        if (currFilterType !== FilterTradeTypes.allTypes) {
            resultData = resultData.filter(o => o[ 0 ] === currFilterType)
        }
        if (currFilterDate) {
            const diff = moment(moment()).diff(currFilterDate, 'days')
            // o[5]: date
            resultData = resultData.filter(o => o[ 5 ] === diff)
        }
        if (actionType === 'filter') {
            setPage(1)
        }
        setTotalData(resultData)
    }, [rawData, filterDate, filterType])

    const handleFilterChange = useCallback(({filterType, filterDate}) => {
        setFilterType(filterType)
        setFilterDate(filterDate)
        updateData({actionType: TableType.filter, currFilterType: filterType, currFilterDate: filterDate})
    }, [updateData])

    const handlePageChange = useCallback((page: number) => {
        setPage(page)
        updateData({actionType: TableType.page, currPage: page})
    }, [updateData])

    return <TableStyled>
        {showFilter && (
            <TableFilterStyled>
                <Filter handleFilterChange={handleFilterChange}/>
            </TableFilterStyled>
        )}
        <Table {...{...defaultArgs, ...props, rawData: getRenderData()}} />
        {
            pagination && (
                <TablePagination page={page} pageSize={pageSize} total={totalData.length}
                                 onPageChange={handlePageChange}/>
            )
        }
    </TableStyled>
})
