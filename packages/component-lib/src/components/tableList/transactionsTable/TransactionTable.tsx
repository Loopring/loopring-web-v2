import React from 'react'
import styled from '@emotion/styled'
import { Box, Link, Modal } from '@mui/material'
import { TFunction, WithTranslation, withTranslation } from 'react-i18next';
import moment from 'moment'
import { useDeepCompareEffect } from 'react-use'
import { Column, Table, TablePagination } from '../../basic-lib'
import {
    EmptyValueTag,
    getFormattedHash,
    TableType,
    WaitingIcon,
    WarningIcon,
    CompleteIcon,
    getValuePrecisionThousand,
    myLog,
} from '@loopring-web/common-resources'
import { Filter } from './components/Filter'
import { TxnDetailPanel, TxnDetailProps } from './components/modal'
import { TableFilterStyled, TablePaddingX } from '../../styled';
import { RawDataTransactionItem, TransactionStatus, TransactionTradeTypes } from './Interface'
import { DateRange, StaticDatePicker } from '@mui/lab'
import { TxType, UserTxTypes } from 'loopring-sdk'

export type TxsFilterProps = {
    // accountId: number;
    tokenSymbol?: string;
    start?: number;
    end?: number;
    offset?: number;
    limit?: number;
    types?: UserTxTypes[] | string;
}

interface Row extends RawDataTransactionItem {
    filterColumn: string
    cellExpend: {
        value: string
        children: []
        isExpanded: boolean
    }
    children?: Row[]
    isExpanded?: boolean
    format?: any
}

const TYPE_COLOR_MAPPING = [
    {type: TransactionStatus.processed, color: 'success'},
    {type: TransactionStatus.processing, color: 'warning'},
    {type: TransactionStatus.failed, color: 'error'},
]

const CellStatus = ({row, column}: any) => {
    const status = row[ column.key ]
    // const popupId = `${column.key}-${rowIdx}`
    // const popoverContent = <div style={{padding: 12}}>
    //     Because the pool price changes dynamically, the price you see when placing an order may be inconsistent with the
    //     final transaction price.
    // </div>
    const RenderValue = styled.div`
        display: flex;
        align-items: center;
        // cursor: pointer;
        color: ${({theme}) => theme.colorBase[ `${TYPE_COLOR_MAPPING.find(o => o.type === status)?.color}` ]};

        & svg {
            width: 24px;
            height: 24px;
        }
    `
    const svg = status === 'processed' 
        ? <CompleteIcon /> 
        : status === 'processing' 
            ? <WaitingIcon /> 
            : <WarningIcon />
    const RenderValueWrapper =
        <RenderValue>
            {/* {svg}{status} */}
            {svg}
        </RenderValue>

    return <Box className="rdg-cell-value rdgCellCenter">
        {/* <Popover
            type={PopoverType.hover}
            popupId={popupId}
            popoverContent={popoverContent}
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
            {RenderValueWrapper}
        </Popover> */}
        {RenderValueWrapper}
    </Box>
}

const TableStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    flex: 1;

    .rdg {
        --template-columns: 120px auto auto auto 120px 150px !important;

        // .rdg-cell.action {
        // display: flex;
        // justify-content: center;
        // align-items: center;
        // }
        .rdgCellCenter {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .textAlignRight {
            text-align: right;
        }
        .textAlingCenter {
            text-align: center;
        }
    }
    // .textAlignRight {
    //     text-align: right;
    // }
    

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box

export interface TransactionTableProps {
    etherscanBaseUrl?: string;
    rawData: RawDataTransactionItem[];
    pagination?: {
        pageSize: number;
        total: number;
    };
    getTxnList: ({ tokenSymbol, start, end, limit, offset, types }: TxsFilterProps) => Promise<void>;
    showFilter?: boolean;
    showloading: boolean;
}

export const TransactionTable = withTranslation(['tables', 'common'])((props: TransactionTableProps & WithTranslation) => {
    const { rawData, pagination, showFilter, getTxnList, showloading, etherscanBaseUrl, ...rest } = props
    const [page, setPage] = React.useState(1)
    // const [totalData, setTotalData] = React.useState<RawDataTransactionItem[]>(rawData)
    const [filterType, setFilterType] = React.useState(TransactionTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState<DateRange<Date | string>>(['', ''])
    const [filterToken, setFilterToken] = React.useState<string>('All Tokens')
    const [modalState, setModalState] = React.useState(false)
    const [txnDetailInfo, setTxnDetailInfo] = React.useState<TxnDetailProps>({
        hash: '',
        txHash: '',
        status: 'processed',
        time: '',
        from: '',
        to: '',
        amount: '',
        fee: '',
        memo: '',
    })

    const pageSize = pagination ? pagination.pageSize : 10;

    // useDeepCompareEffect(() => {
    //     setTotalData(rawData);
    // }, [rawData])

    const updateData = React.useCallback(({
                                              TableType,
                                              currFilterType = filterType,
                                              currFilterDate = filterDate,
                                              currFilterToken = filterToken,
                                              currPage = page,
                                          }) => {
        let actualPage = currPage
        if (TableType === 'filter') {
            actualPage = 1
            setPage(1)
        }
        const tokenSymbol = currFilterToken === 'All Tokens' 
            ? '' 
            : currFilterToken
        const formattedType = currFilterType.toUpperCase()
        const types = currFilterType === TransactionTradeTypes.allTypes 
            ? '' 
            : formattedType === TransactionTradeTypes.deposit
                ? 'deposit'
                : formattedType === TransactionTradeTypes.transfer
                    ? 'transfer'
                    : 'offchain_withdrawal'
        const start = Number(moment(currFilterDate[ 0 ]).format('x'))
        const end = Number(moment(currFilterDate[ 1 ]).format('x'))
        getTxnList({
            limit: pageSize,
            offset: (actualPage - 1) * pageSize,
            types: types,
            tokenSymbol: tokenSymbol,
            start: Number.isNaN(start) ? -1 : start,
            end: Number.isNaN(end) ? -1 : end,
        })
    }, [filterDate, filterType, filterToken, getTxnList, page, pageSize])

    const handleFilterChange = React.useCallback(({type = filterType, date = filterDate, token = filterToken}) => {
        setFilterType(type)
        setFilterDate(date)
        setFilterToken(token)
        updateData({
            TableType: TableType.filter,
            currFilterType: type,
            currFilterDate: date,
            currFilterToken: token
        })
    }, [updateData, filterDate, filterType, filterToken])

    const handleReset = React.useCallback(() => {
        setFilterType(TransactionTradeTypes.allTypes)
        setFilterDate([null, null])
        setFilterToken('All Tokens')
        updateData({
            TableType: TableType.filter,
            currFilterType: TransactionTradeTypes.allTypes,
            currFilterDate: [null, null],
            currFilterToken: 'All Tokens',
        })
    }, [updateData])

    const handlePageChange = React.useCallback((currPage: number) => {
        if (currPage === page) return
        setPage(currPage)
        updateData({TableType: TableType.page, currPage: currPage})
    }, [updateData, page])

    const handleTxnDetail = React.useCallback((prop: TxnDetailProps) => {
        setModalState(true)
        setTxnDetailInfo(prop)
    }, [setModalState, setTxnDetailInfo])

    const getColumnModeTransaction = React.useCallback((t: TFunction): Column<any, unknown>[] => [
        {
            key: 'side',
            name: t('labelTxSide'),
            formatter: ({row}) => {
                const value = row[ 'side' ]
                const renderValue = value === TransactionTradeTypes.deposit ? t('labelDeposit') : value === TransactionTradeTypes.transfer ? t('labelTransfer') : t('labelWithdraw');
                return (
                    <Box className="rdg-cell-value">
                        {renderValue}
                    </Box>
                )
            }
        },
        {
            key: 'amount',
            name: t('labelTxAmount'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const {unit, value} = row[ 'amount' ]
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue ? `${getValuePrecisionThousand(value, undefined, undefined, undefined, false, { isTrade: true })}` : EmptyValueTag
                return (
                    <Box className="rdg-cell-value textAlignRight">
                        {renderValue} {unit || ''}
                    </Box>
                )
            },
        },
        {
            key: 'fee',
            name: t('labelTxFee'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const fee = row[ 'fee' ]
                const feePrecision = row['feePrecision']
                // const hasValue = fee ? Number.isFinite(fee.value) : ''
                // const renderValue = hasValue && fee.value !== 0 ? `${fee.value.toFixed(6)} ${fee.unit}` : EmptyValueTag
                const renderValue = `${getValuePrecisionThousand(fee.value, feePrecision, feePrecision, undefined, false, { floor: false })} ${fee.unit}`
                return (
                    <Box className="rdg-cell-value textAlignRight">
                        {renderValue}
                    </Box>
                )
            },
        },
        {
            key: 'txnHash',
            name: t('labelTxTxnHash'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const path = row[ 'path' ] || ''
                const value = row[ 'txnHash' ]
                const RenderValue = styled(Box)`
                    color: ${({theme}) => theme.colorBase[ value ? 'secondary' : 'textSecondary' ]};
                    cursor: pointer;
                `

                const {
                    hash,
                    txHash,
                    txType,
                    status,
                    time,
                    receiverAddress,
                    recipient,
                    senderAddress,
                    amount,
                    fee,
                    memo,
                } = row

                // const hashShow = (txType === TxType.DEPOSIT) ? txHash : hash
                
                const receiver = txType === TxType.TRANSFER ? receiverAddress 
                : txType === TxType.OFFCHAIN_WITHDRAWAL ? recipient : ''

                const formattedDetail = {
                    txType,
                    hash,
                    txHash,
                    status,
                    time,
                    from: senderAddress,
                    to: receiver,
                    fee: `${fee.value} ${fee.unit}`,
                    amount: `${amount.value} ${amount.unit}`,
                    memo,
                    etherscanBaseUrl,
                }
                return (
                    <div className="rdg-cell-value textAlignRight">
                        {path ? <Link href={path}>
                                <RenderValue title={value}>{value || EmptyValueTag}</RenderValue>
                            </Link> :
                            <RenderValue onClick={() => handleTxnDetail(formattedDetail)} title={value}>{value ? getFormattedHash(value) : EmptyValueTag}</RenderValue>}
                    </div>
                )
            }
        },
        {
            key: 'status',
            name: t('labelTxStatus'),
            headerCellClass: 'textAlingCenter',
            formatter: ({row, column, rowIdx}) => (
                // <Box component={'div'} className="rdg-cell-value rdgCellCenter">
                    <CellStatus {...{row, column, rowIdx}} />
                // </Box>
            )
        },
        {
            key: 'time',
            name: t('labelTxTime'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const value = row[ 'time' ]
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue
                    ? moment(new Date(row[ 'time' ]), "YYYYMMDDHHMM").fromNow()
                    : EmptyValueTag
                return (
                    <Box className="rdg-cell-value textAlignRight">
                        {renderValue}
                    </Box>
                )
            },
        },
    ], [handleTxnDetail, etherscanBaseUrl])

    const defaultArgs: any = {
        // rawData: [],
        columnMode: getColumnModeTransaction(props.t).filter(o => !o.hidden),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}: any) => columnsRaw as Column<any, unknown>[],
    }

    return <TableStyled>
        {showFilter && (
            <TableFilterStyled>
                <Filter
                    originalData={rawData}
                    filterDate={filterDate}
                    filterType={filterType}
                    filterToken={filterToken}
                    handleFilterChange={handleFilterChange}
                    handleReset={handleReset}
                />
            </TableFilterStyled>
        )}
        <Modal
            open={modalState}
            onClose={() => setModalState(false)}
        >
            <TxnDetailPanel {...{...txnDetailInfo}} />
        </Modal>
        <Table {...{...defaultArgs, ...props, rawData, showloading }}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={pagination.total} onPageChange={handlePageChange}/>
        )}
    </TableStyled>
})
