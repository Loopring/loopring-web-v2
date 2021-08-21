import { useCallback, useState } from 'react'
import styled from '@emotion/styled'
import { Box } from '@material-ui/core'
import { DateRange } from '@material-ui/lab'
import { TFunction, WithTranslation, withTranslation } from 'react-i18next';
import moment from 'moment'
import { DropDownIcon, EmptyValueTag, TableType, TradeStatus, TradeTypes, getThousandFormattedNumbers } from '@loopring-web/common-resources'
import { Column, Popover, PopoverType, Table, TablePagination } from '../../basic-lib'
import { SingleOrderHistoryTable } from './SingleOrderHistoryTable'
import { Filter, FilterOrderTypes } from './components/Filter'
import { TableFilterStyled, TablePaddingX } from '../../styled'
import { useSettings } from '../../../stores';
import { GetOrdersRequest, Side } from 'loopring-sdk'

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
    filledPrice: {
        key: string;
        value: number;
    };
    time: number
    status: keyof typeof TradeStatus;
    sortColumn: string
    filterColumn: string
    actionsStatus: object
}

export type OrderHistoryTableDetailItem = {
    amount: OrderPair;
    tradingPrice: number;
    filledPrice: {
        key: string;
        value: number;
    };
    time: number;
    total: {
        key: string;
        value: number;
    }
}

export type OrderHistoryRawDataItem = {
    market: string;
    side: TradeTypes;
    amount: OrderPair;
    average: number;
    // filledAmount: OrderPair;
    price: {
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
        --template-columns: 90px 260px auto 120px auto 150px !important;

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
        total: number;
    };
    showFilter?: boolean;
    getOrderList: (props: Omit<GetOrdersRequest, "accountId">) => Promise<void>;
    showLoading?: boolean;
    marketArray?: string[];
}

const getColumnModeOrderHistory = (t: TFunction, lan: 'en_US' | 'zh_CN'): Column<OrderHistoryRow, unknown>[] => [
    {
        key: 'side',
        name: t('labelOrderSide'),
        formatter: ({row, column}) => {
            const value = row[ column.key ]
            const renderValue = lan === 'en_US'
                ? value 
                : value === 'Buy'
                    ? '买'
                    : '卖'
            return (
                <div className="rdg-cell-value">
                    <LastDayPriceChangedCell value={value}>
                        {renderValue}
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
            const renderValue = `${Number(getThousandFormattedNumbers(valueFrom)).toFixed(6)} ${keyFrom} \u2192 ${Number(getThousandFormattedNumbers(valueTo)).toFixed(6)} ${keyTo}`
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
    // {
    //     key: 'filledAmount',
    //     name: t('labelOrderFilledAmount'),
    //     formatter: ({row, column}) => {
    //         const {from, to} = row[ column.key ]
    //         const {key: keyFrom, value: valueFrom} = from
    //         const {key: keyTo, value: valueTo} = to
    //         const renderValue = `${valueFrom} ${keyFrom}->${valueTo} ${keyTo}`
    //         return <div className="rdg-cell-value">{renderValue}</div>
    //     },
    // },
    {
        key: 'price',
        name: t('labelOrderPrice'),
        formatter: ({row}) => {
            const value = row['price'].value
            const hasValue = Number.isFinite(value)
            const renderValue = hasValue ? value.toFixed(6) : EmptyValueTag
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
                <SingleOrderHistoryTable rawData={[]}/>
            </div>
        </RenderPopover>

    return <div className="rdg-cell-value">
        <Popover
            type={PopoverType.click}
            popupId={popupId}
            className={'arrow-right'}
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
        >
            {triggerContent}
        </Popover>
    </div>
}

export const OrderHistoryTable = withTranslation('tables')((props: OrderHistoryTableProps & WithTranslation) => {
    const { t, rawData, pagination, showFilter, getOrderList, showLoading, marketArray } = props
    const actionColumns = ['status']
    const { language } = useSettings()
    const defaultArgs: any = {
        // rawData: [],
        columnMode: getColumnModeOrderHistory(t, language).filter(o => !o.hidden),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}: any) => columnsRaw as Column<OrderHistoryRawDataItem, unknown>[],
        actionColumns,
        // style: {
        //     backgroundColor: ({colorBase}: any) => `${colorBase.box}`
        // }
    }

    const [filterType, setFilterType] = useState(FilterOrderTypes.allTypes)
    const [filterDate, setFilterDate] = useState<DateRange<Date | string>>([null, null])
    const [filterToken, setFilterToken] = useState<string>('All Pairs')
    const [page, setPage] = useState(1)
    const pageSize = pagination ? pagination.pageSize : 0

    const updateData = useCallback(({
                                        actionType,
                                        currFilterType = filterType,
                                        currFilterDate = filterDate,
                                        currFilterToken = filterToken,
                                        currPage = page,
                                    }) => {
        let actualPage = currPage
        if (actionType === TableType.filter) {
            actualPage = 1
            setPage(1)
        }
        console.log(currFilterToken)
        const types = currFilterType === FilterOrderTypes.buy ? 'BUY' : currFilterType === FilterOrderTypes.sell ? 'SELL' : ''
        const start = Number(moment(currFilterDate[ 0 ]).format('x'))
        const end = Number(moment(currFilterDate[ 1 ]).format('x'))
        getOrderList({
            limit: pageSize,
            offset: (actualPage - 1) * pageSize,
            side: [types] as Side[],
            market: currFilterToken === 'All Pairs' ? '' : currFilterToken,
            start: Number.isNaN(start) ? -1 : start,
            end: Number.isNaN(end) ? -1 : end,
        })
    }, [filterDate, filterType, filterToken, getOrderList, page, pageSize])

    const handleFilterChange = useCallback(({type = filterType, date = filterDate, token = filterToken, currPage = page}) => {
        setFilterType(type)
        setFilterDate(date)
        setFilterToken(token)
        updateData({
            actionType: TableType.filter, 
            currFilterType: type, 
            currFilterDate: date,
            currFilterToken: token,
            currPage: currPage,
        })
    }, [updateData, filterDate, filterType, filterToken, page])

    const handlePageChange = useCallback((page: number) => {
        setPage(page)
        updateData({actionType: TableType.page, currPage: page})
    }, [updateData])

    const handleReset = useCallback(() => {
        setFilterType(FilterOrderTypes.allTypes)
        setFilterDate([null, null])
        setFilterToken('All Pairs')
        updateData({
            TableType: TableType.filter,
            currFilterType: FilterOrderTypes.allTypes,
            currFilterDate: [null, null],
            currFilterToken: 'All Pairs',
        })
    }, [updateData])

    return <TableStyled>
        {showFilter && (
            <TableFilterStyled>
                <Filter
                    marketArray={marketArray}
                    filterDate={filterDate}
                    filterType={filterType}
                    filterToken={filterToken}
                    handleReset={handleReset}
                    handleFilterChange={handleFilterChange}/>
            </TableFilterStyled>
        )}
        <Table {...{...defaultArgs, ...props, rawData, showLoading}} />
        {
            pagination && (
                <TablePagination page={page} pageSize={pageSize} total={pagination.total}
                    onPageChange={handlePageChange}/>
            )
        }
    </TableStyled>
})
