import { useCallback, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { Box, Modal, Typography } from '@mui/material'
import { DateRange } from '@mui/lab'
import { TFunction, WithTranslation, withTranslation } from 'react-i18next';
import moment from 'moment'
import {  usePopupState } from 'material-ui-popup-state/hooks';
import { DropDownIcon, EmptyValueTag, TableType, TradeStatus, TradeTypes, getValuePrecisionThousand, myLog } from '@loopring-web/common-resources'
import { Column, Table, TablePagination } from '../../basic-lib'
import { Filter, FilterOrderTypes } from './components/Filter'
import { OrderDetailPanel } from './components/modal'
import { TableFilterStyled, TablePaddingX } from '../../styled'
// import { useSettings } from '../../../stores';
import { GetOrdersRequest, Side, OrderType } from 'loopring-sdk'

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
    orderType: keyof typeof OrderType
    amount: OrderPair
    average: number
    filledAmount: OrderPair
    // filledPrice: {
    //     key: string;
    //     value: number;
    // };
    time: number;
    hash: string;
    status: keyof typeof TradeStatus;
    sortColumn: string
    filterColumn: string
    actionsStatus: object
    tradeChannel: string
}

export enum DetailRole {
    maker = 'maker',
    taker = 'taker'
}

export type OrderHistoryTableDetailItem = {
    amount: OrderPair;
    // tradingPrice: number;
    filledPrice: {
        value: string | number;
        precision?: number;
    } 
    fee: {
        key: string;
        value: string | number;
        precision?: number;
    }
    role: string;
    time: number;
    volume?: number;
    orderId: string;
}

export type OrderHistoryRawDataItem = {
    market: string;
    side: TradeTypes;
    amount: OrderPair;
    average: number | string;
    // filledAmount: OrderPair;
    price: {
        key: string;
        value: number;
    }
    time: number;
    status: TradeStatus;
    hash: string;
    orderId: string;
}
//
// const LastDayPriceChangedCell: any = styled(Box)`
//     color: ${(props: any) => {
//         const {
//         value,
//         theme: {colorBase},
//         } = props
//         return value === TradeTypes.Buy ? colorBase.success : colorBase.error
//     }};
// `

const TableStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    flex: 1;

    .rdg {
        --template-columns: ${({isopen, ispro}: any) => isopen === 'open' 
            ? ispro === 'pro'
                ? 'auto auto 250x 150px auto auto auto'
                : 'auto auto 240px 130px 130px 120px 100px' 
            : ispro === 'pro' 
                ? 'auto auto 250px 150px 150px auto auto'
                : 'auto auto 240px 130px 130px 120px 130px'
        };

        .rdg-cell:last-of-type {
            display: flex;
            justify-content: flex-end;
        }
    }
    .textAlignRight{
        text-align: right;

        // .rdg-header-sort-cell {
        //     justify-content: flex-end;
        // }
    }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as any

// const RenderPopover = styled.div`
//         width: 700px;
//         margin: 12px;
//         max-height: 250px;

//         .contentWrapper {
//             max-height: 250px;
//             overflow: scroll;
//         }
// `

// const getPopoverContent = (detail: any[]) =>
//         <RenderPopover>
//             <div className="arrowPopover"/>
//             <div className="contentWrapper">
//                 <SingleOrderHistoryTable showloading={false} rawData={detail}/>
//             </div>
//         </RenderPopover>

export interface OrderHistoryTableProps {
    rawData: OrderHistoryRawDataItem[];
    pagination?: {
        pageSize: number;
        total: number;
    };
    showFilter?: boolean;
    getOrderList: (props: Omit<GetOrdersRequest, "accountId">) => Promise<any>;
    showLoading?: boolean;
    marketArray?: string[];
    showDetailLoading?: boolean;
    getOrderDetail: (orderHash: string, t: TFunction) => Promise<any>;
    orderDetailList: OrderHistoryTableDetailItem[];
    isOpenOrder?: boolean;
    cancelOrder: ({orderHash, clientOrderId}: any) => void
    isScroll?: boolean;
    isPro?: boolean;
    handleScroll?: (event: React.UIEvent<HTMLDivElement>, isOpen?: boolean) => Promise<void>;
}

export const OrderHistoryTable = withTranslation('tables')((props: OrderHistoryTableProps & WithTranslation) => {
    const { t, rawData, pagination, showFilter, getOrderList, showLoading, marketArray, showDetailLoading, getOrderDetail, orderDetailList, cancelOrder, isOpenOrder = false, isScroll, handleScroll, isPro = false } = props
    const actionColumns = ['status']
    // const { language } = useSettings()
    // const [orderDetail, setOrderDetail] = useState([]);
    const [filterType, setFilterType] = useState(FilterOrderTypes.allTypes)
    const [filterDate, setFilterDate] = useState<DateRange<Date | string>>([null, null])
    const [filterToken, setFilterToken] = useState<string>('All Pairs')
    const [page, setPage] = useState(1)
    const [modalState, setModalState] = useState(false)
    const [currOrderId, setCurrOrderId] = useState('')
    const pageSize = pagination ? pagination.pageSize : 0

    useEffect(() => {
        if (isOpenOrder) {
            setPage(1)
        }
    }, [isOpenOrder])
    
    const updateData = useCallback(({
                                        isOpen = isOpenOrder,
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
            status: isOpen ? 'processing' : 'processed,failed,cancelled,cancelling,expired',
        })
    }, [filterDate, filterType, filterToken, getOrderList, page, pageSize, isOpenOrder])

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

    const CellStatus = useCallback(({row, column, rowIdx}: any) => {
        // const [isOpen, setIsOpen] = useState(false)
        // const [orderDetail, setOrderDetail] = useState<any[]>([])
        const hash = row['hash']
        const value = row[ column.key ]
        // const [currentE, setCurrentE] = useState<any>(undefined)
        const popupId = `${column.key}-orderTable-${rowIdx}`
        const rightState = usePopupState({variant: 'popover', popupId: popupId});
        const RenderValue: any = styled.span`
          position: relative;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          
          & span {
            color: ${({theme}) => {
                const {colorBase} = theme
                return value === TradeStatus.Processed
                        ? colorBase.success
                        : value === TradeStatus.Expired ? colorBase.textSecondary
                                : colorBase.textPrimary
              }};
          }
          height: 100%;
        //   width: 100px;
        //   padding-right: 10px;
    
          & svg {
            font-size: 14px;
            transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            transform: ${() => rightState.isOpen ? 'rotate(180deg)' : ''};
          }
        `
    
        let actualValue = ''
        switch (value) {
            case TradeStatus.Processing:
                actualValue = t('labelOrderProcessing');
                break;
            case TradeStatus.Processed:
                actualValue =t('labelOrderProcessed');
                break;
            case TradeStatus.Cancelling:
                actualValue = t('labelOrderCancelling');
                break;
            case TradeStatus.Cancelled:
                actualValue = t('labelOrderCancelled');
                break;
            case TradeStatus.Expired:
                actualValue = t('labelOrderExpired');
                break;
            case TradeStatus.Waiting:
                actualValue = t('labelOrderWaiting');
                break;
            default:
                break;
        }
    
        const handleOrderClick = useCallback((hash: string) => {
            setCurrOrderId(row['orderId'])
            getOrderDetail(hash, t)
            setModalState(true)
        }, [row])
    
    
        // useEffect(() => {
        //     console.log(isOpen, rightState.isOpen, currentE)
        //     if (isOpen && !rightState.isOpen && currentE) {
        //         // bindTrigger(rightState).onClick(currentE)
        //     }
        // }, [rightState, currentE, isOpen])
    
        // useEffect(() => {
        //     if (rightState.isOpen) {
        //         getOrderDetail(hash)
        //         rightState.setOpen(true)
        //     }
        // }, [getOrderDetail, hash, rightState.isOpen])
        
    
        return <RenderValue className="rdg-cell-value textAlignRight" onClick={() => handleOrderClick(hash)}>
            {/* <div {...bindTrigger(rightState)} style={{width: 110}} onClick={(e) => handleOrderClick(e, hash)}>
                <RenderValue>
                    {actualValue}
                    <DropDownIcon/>
                </RenderValue>
            </div> */}
            {/* <RenderValue > */}
            <Typography component={'span'} marginRight={1}>
                {actualValue}
            </Typography>
            <DropDownIcon htmlColor={'var(--color-text-third)'} fontSize={'large'} />
            {/* </RenderValue> */}
            {/* <PopoverPure
                className={'arrow-right'}
                {...bindPopper(rightState)}
                // popupId={popupId}
                // children={triggerContent}
                // popoverContent={popoverContent}
                // handleStateChange={(state) => handleStateChange(state, hash)}
                // handleStateChange={setIsOpen}
                
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <ClickAwayListener onClickAway={() => rightState.setOpen(false)}>
                    <RenderPopover>
                        <div className="arrowPopover"/>
                        <div className="contentWrapper">
                            <SingleOrderHistoryTable showloading={false} rawData={orderDetailList}/>
                        </div>
                    </RenderPopover>
                </ClickAwayListener>
            </PopoverPure> */}
        </RenderValue>
    }, [getOrderDetail])

    const handleCancel = useCallback((orderHash: string, clientOrderId: string) => {
        cancelOrder({
            orderHash,
            clientOrderId
        })
    }, [cancelOrder])

    const getColumnModeOrderHistory = (t: any): Column<OrderHistoryRow, unknown>[] => [
        {
            key: 'types',
            name: t('labelOrderTypes'),
            formatter: ({row}) => {
                const value = row['orderType'] as any
                let renderValue = ''
                switch(value) {
                    case 'AMM':
                        renderValue = t('labelOrderAmm')
                        break;
                    case 'LIMIT_ORDER':
                        renderValue = t('labelOrderLimitOrder')
                        break;
                    case 'MAKER_ONLY':
                        renderValue = t('labelOrderMaker')
                        break;
                    case 'TAKER_ONLY':
                        renderValue = t('labelOrderTaker')
                        break;
                    default:
                        break;
                }
                return <div className="rdg-cell-value">{renderValue}</div>
            }
        },
        {
            key: 'channels',
            name: t('labelOrderChannels'),
            formatter: ({row}) => {
                const value = row['tradeChannel']
                let renderChannel = ''
                switch(value) {
                    case 'MIXED': 
                        renderChannel = t('labelOrderChannelsMixed')
                        break
                    case 'AMM_POOL':
                        renderChannel = t('labelOrderChannelsAMM')
                        break
                    case 'ORDER_BOOK':
                        renderChannel = t('labelOrderChannelsOrderBook')
                        break
                    default:
                        break
                }
                return <div className="rdg-cell-value">{renderChannel}</div>
            },
        },
        {
            key: 'amount',
            name: t('labelOrderAmount'),
            formatter: ({row, column}) => {
                const {from, to} = row[ column.key ]
                const precisionFrom = row.amount.from?.['precision']
                const precisionTo = row.amount.to?.['precision']
                const {key: keyFrom, value: valueFrom} = from
                const {key: keyTo, value: valueTo} = to
                const renderValue = `${getValuePrecisionThousand(valueFrom, precisionFrom, precisionFrom)} ${keyFrom} \u2192 ${getValuePrecisionThousand(valueTo, precisionTo, precisionTo)} ${keyTo}`
                return <div className="rdg-cell-value">{renderValue}</div>
            },
        },
        
        {
            key: 'average',
            name: t('labelOrderAverage'),
            headerCellClass: 'textAlignRight',
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                const precisionMarket = row['precisionMarket']
                // const hasValue = Number.isFinite(value)
                // const renderValue = hasValue ? getValuePrecisionThousand(value, 6, 2) : EmptyValueTag
                const renderValue = value ? getValuePrecisionThousand(value, undefined, undefined, precisionMarket, true) : EmptyValueTag
                return <div className="rdg-cell-value textAlignRight">{renderValue}</div>
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
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const value = row['price'].value
                const precisionMarket = row['precisionMarket']
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue ? getValuePrecisionThousand(value, undefined, undefined, precisionMarket, true) : EmptyValueTag
                return (
                    <div className="rdg-cell-value textAlignRight">
                        <span>{renderValue}</span>
                    </div>
                )
            },
        },
        {
            key: 'time',
            name: t('labelOrderTime'),
            headerCellClass: 'textAlignRight',
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                const renderValue = Number.isFinite(value)
                    ? moment(new Date(row[ 'time' ]), "YYYYMMDDHHMM").fromNow()
                    : EmptyValueTag
                return (
                    <div className="rdg-cell-value textAlignRight">
                        <span>{renderValue}</span>
                    </div>
                )
            },
        },
        {
            key: 'status',
            headerCellClass: 'textAlignRight',
            name: t('labelOrderStatus'),
            formatter: ({row, column, rowIdx}) => <>
                <CellStatus {...{row, column, rowIdx}} />
            </>
        },
        
    ]

    const getColumnModeOpenHistory= (t: any): Column<OrderHistoryRow, unknown>[] => [
        {
            key: 'types',
            name: t('labelOrderTypes'),
            formatter: ({row}) => {
                const value = row['orderType'] as any
                let renderValue = ''
                switch(value) {
                    case 'AMM':
                        renderValue = t('labelOrderAmm')
                        break;
                    case 'LIMIT_ORDER':
                        renderValue = t('labelOrderLimitOrder')
                        break;
                    case 'MAKER_ONLY':
                        renderValue = t('labelOrderMaker')
                        break;
                    case 'TAKER_ONLY':
                        renderValue = t('labelOrderTaker')
                        break;
                    default:
                        break;
                }
                return <div className="rdg-cell-value">{renderValue}</div>
            }
        },
        {
            key: 'channels',
            name: t('labelOrderChannels'),
            formatter: ({row}) => {
                const value = row['tradeChannel']
                let renderChannel = ''
                switch(value) {
                    case 'MIXED': 
                        renderChannel = t('labelOrderChannelsMixed')
                        break
                    case 'AMM_POOL':
                        renderChannel = t('labelOrderChannelsAMM')
                        break
                    case 'ORDER_BOOK':
                        renderChannel = t('labelOrderChannelsOrderBook')
                        break
                    default:
                        break
                }
                return <div className="rdg-cell-value">{renderChannel}</div>
            },
        },
        {
            key: 'amount',
            name: t('labelOrderAmount'),
            formatter: ({row, column}) => {
                const {from, to} = row[ column.key ]
                const {key: keyFrom, value: valueFrom} = from
                const {key: keyTo, value: valueTo} = to
                const precisionFrom = row.amount.from?.['precision']
                const precisionTo = row.amount.to?.['precision']
                const renderValue = `${getValuePrecisionThousand(valueFrom, precisionFrom, precisionFrom)} ${keyFrom} \u2192 ${getValuePrecisionThousand(valueTo, precisionTo, precisionTo)} ${keyTo}`
                return <div className="rdg-cell-value">{renderValue}</div>
            },
        },
        {
            key: 'price',
            name: t('labelOrderPrice'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const value = row['price'].value
                const precisionMarket = row['precisionMarket']
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue ? getValuePrecisionThousand(value, precisionMarket, precisionMarket, precisionMarket, true) : EmptyValueTag
                return (
                    <div className="rdg-cell-value textAlignRight">
                        <span>{renderValue}</span>
                    </div>
                )
            },
        },
        {
            key: 'completion',
            name: t('labelOrderCompletion'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const rawValue = row['completion']
                const renderValue = `${(rawValue * 100).toFixed(2)}%`
                return <div className="rdg-cell-value textAlignRight">{renderValue}</div>
            }
        },
        {
            key: 'time',
            name: t('labelOrderTime'),
            headerCellClass: 'textAlignRight',
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                const renderValue = Number.isFinite(value)
                    ? moment(new Date(row[ 'time' ]), "YYYYMMDDHHMM").fromNow()
                    : EmptyValueTag
                return (
                    <div className="rdg-cell-value textAlignRight">
                        <span>{renderValue}</span>
                    </div>
                )
            },
        },
        {
            key: 'cancel',
            headerCellClass: 'textAlignRight',
            name: t('labelOrderCancelAll'),
            formatter: ({row}: any) => {
                const orderHash = row['hash']
                const clientOrderId = row['orderId']
                return (
                    <>
                        <Box style={{ cursor: 'pointer' }} className="rdg-cell-value textAlignRight" onClick={() => handleCancel(orderHash, clientOrderId)}>
                            <Typography component={'span'} color={'var(--color-primary)'}>{t('labelOrderCancel')}</Typography>
                        </Box>
                    </>
                )
            } 
        }
    ]

    const actualColumns = isOpenOrder ? getColumnModeOpenHistory(t): getColumnModeOrderHistory(t)

    const defaultArgs: any = {
        // rawData: [],
        // columnMode: getColumnModeOrderHistory(t, showDetailLoading, getOrderDetail).filter(o => !o.hidden),
        columnMode: actualColumns,
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}: any) => columnsRaw as Column<OrderHistoryRawDataItem, unknown>[],
        actionColumns,
        // style: {
        //     backgroundColor: ({colorBase}: any) => `${colorBase.box}`
        // }
    }

    return <TableStyled isopen={isOpenOrder ? 'open' : 'history'} ispro={isPro ? 'pro' : 'lite'}>
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
        <Table 
            className={isScroll ? 'scrollable' : undefined}
            onScroll={handleScroll ? (e) => handleScroll(e, isOpenOrder) : undefined}
            {...{...defaultArgs, ...props, rawData, showloading: showLoading}}
        />
        <Modal
            open={modalState}
            onClose={() => setModalState(false)}
        >
            <OrderDetailPanel rawData={orderDetailList} showLoading={showDetailLoading} orderId={currOrderId} />
        </Modal>
        {
            pagination && !!rawData.length && (
                <TablePagination page={page} pageSize={pageSize} total={pagination.total}
                    onPageChange={handlePageChange}/>
            )
        }
    </TableStyled>
})
