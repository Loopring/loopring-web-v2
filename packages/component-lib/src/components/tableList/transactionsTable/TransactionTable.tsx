import React from 'react'
import styled from '@emotion/styled'
import { Box, Link, Modal } from '@material-ui/core'
import { TFunction, WithTranslation, withTranslation } from 'react-i18next';
import moment from 'moment'
import { useDeepCompareEffect } from 'react-use'
import { Column, Table, TablePagination } from '../../basic-lib'
import {
    AlertIcon,
    CheckIcon,
    EmptyValueTag,
    getFormattedHash,
    // PendingIcon,
    TableType,
    AssetsIcon, // temporayily replacement
} from '@loopring-web/common-resources'
import { Filter } from './components/Filter'
import { TxnDetailPanel, TxnDetailProps } from './components/modal'
import { TableFilterStyled, TablePaddingX } from '../../styled';
import { RawDataTransactionItem, TransactionStatus, TransactionTradeTypes } from './Interface'
import { DateRange } from '@material-ui/lab'
import { UserTxTypes } from 'loopring-sdk'

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

/**
 *
 * @param value
 * @param minFractionDigits
 * @returns
 */
const getThousandFormattedNumbers = (value: number, minFractionDigits: number = 2) => {
    if (!Number.isFinite(value)) return value
    return value.toLocaleString('en', {
        minimumFractionDigits: minFractionDigits
    })
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
        cursor: pointer;
        color: ${({theme}) => theme.colorBase[ `${TYPE_COLOR_MAPPING.find(o => o.type === status)?.color}` ]};

        & svg {
            width: 20px;
            height: 20px;
        }
    `
    const svg = status === 'processed' ? <CheckIcon width={14} height={14} /> : status === 'processing' ? <AssetsIcon/> : <AlertIcon/>
    const RenderValueWrapper =
        <RenderValue>
            {/* {svg}{status} */}
            {svg}
        </RenderValue>

    return <>
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
    </>
}

const TableStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    flex: 1;

    .rdg {
        --template-columns: 120px auto auto auto 100px 120px !important;

        // .rdg-cell.action {
        // display: flex;
        // justify-content: center;
        // align-items: center;
        // }
        .rdg-cell {
            display: flex;
            align-items: center;
        }
    }
    // .textAlignRight {
    //     text-align: right;
    // }
    

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box

export interface TransactionTableProps {
    rawData: RawDataTransactionItem[];
    pagination?: {
        pageSize: number;
        total: number;
    };
    getTxnList: ({ tokenSymbol, start, end, limit, offset, types }: TxsFilterProps) => Promise<void>;
    showFilter?: boolean;
    showLoading: boolean;
}

export const TransactionTable = withTranslation('tables')((props: TransactionTableProps & WithTranslation) => {
    const {rawData, pagination, showFilter, getTxnList, showLoading} = props
    const [page, setPage] = React.useState(1)
    const [totalData, setTotalData] = React.useState<RawDataTransactionItem[]>(rawData)
    const [filterType, setFilterType] = React.useState(TransactionTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState<DateRange<Date | string>>(['', ''])
    const [filterToken, setFilterToken] = React.useState<string>('All Tokens')
    const [modalState, setModalState] = React.useState(false)
    const [txnDetailInfo, setTxnDetailInfo] = React.useState<TxnDetailProps>({
        hash: '',
        status: 'processed',
        time: '',
        from: '',
        to: '',
        amount: '',
        fee: '',
        memo: '',
    })

    const pageSize = pagination ? pagination.pageSize : 10;

    useDeepCompareEffect(() => {
        setTotalData(rawData);
    }, [rawData])

    // const getRenderData = React.useCallback(() => pagination
    //     ? totalData.slice((page - 1) * pageSize, page * pageSize)
    //     : totalData
    //     , [page, pagination, pageSize, totalData])

    const updateData = React.useCallback(async ({
                                              TableType,
                                              currFilterType = filterType,
                                              currFilterDate = filterDate,
                                              currFilterToken = filterToken,
                                              currPage = page,
                                          }) => {
        // let resultData = rawData || []
        // if (currFilterType !== TransactionTradeTypes.allTypes) {
        //     resultData = resultData.filter(o => o.side === currFilterType)
        // }
        // if (currFilterDate[ 0 ] && currFilterDate[ 1 ]) {
        //     const startTime = Number(moment(currFilterDate[ 0 ]).format('x'))
        //     const endTime = Number(moment(currFilterDate[ 1 ]).format('x'))
        //     resultData = resultData.filter(o => o.time < endTime && o.time > startTime)
        // }
        // if (currFilterToken !== 'All Tokens') {
        //     resultData = resultData.filter(o => o.amount.unit === currFilterToken)
        // }
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
    }, [])

    const getColumnModeTransaction = React.useCallback((t: TFunction): Column<any, unknown>[] => [
        {
            key: 'side',
            name: t('labelTxSide'),
            formatter: ({row}) => {
                const value = row[ 'side' ]
                const renderValue = value === TransactionTradeTypes.deposit ? t('labelDeposit') : value === TransactionTradeTypes.transfer ? t('labelTransfer') : t('labelWithdraw');
                return (
                    <div className="rdg-cell-value">
                        {renderValue}
                    </div>
                )
            }
        },
        {
            key: 'amount',
            name: t('labelTxAmount'),
            formatter: ({row}) => {
                const {unit, value} = row[ 'amount' ]
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue ? `${getThousandFormattedNumbers(Number(value), 5)}` : EmptyValueTag
                return (
                    <div className="rdg-cell-value">
                        {renderValue} {unit || ''}
                    </div>
                )
            },
        },
        {
            key: 'fee',
            name: t('labelTxFee'),
            formatter: ({row}) => {
                const fee = row[ 'fee' ]
                const hasValue = fee ? Number.isFinite(fee.value) : ''
                const renderValue = hasValue && fee.value !== 0 ? `${fee.value.toFixed(6)} ${fee.unit}` : EmptyValueTag
                return (
                    <div className="rdg-cell-value">
                        <span>{renderValue}</span>
                    </div>
                )
            },
        },
        {
            key: 'txnHash',
            name: t('labelTxTxnHash'),
            formatter: ({row}) => {
                const path = row[ 'path' ] || ''
                const value = row[ 'txnHash' ]
                const RenderValue = styled(Box)`
                    color: ${({theme}) => theme.colorBase[ value ? 'secondary' : 'textSecondary' ]};
                    cursor: pointer;
                `
                const {
                    hash,
                    status,
                    time,
                    recipient,
                    senderAddress,
                    amount,
                    fee,
                    memo,
                } = row
                const formattedDetail = {
                    hash,
                    status,
                    time,
                    from: recipient,
                    to: senderAddress,
                    fee: `${fee.value} ${fee.unit}`,
                    amount: `${amount.value} ${amount.unit}`,
                    memo,
                }
                return (
                    <div className="rdg-cell-value">
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
            formatter: ({row, column, rowIdx}) => (
                <div className="rdg-cell-value">
                    <CellStatus {...{row, column, rowIdx}} />
                </div>
            )
        },
        {
            key: 'time',
            name: t('labelTxTime'),
            formatter: ({row}) => {
                const value = row[ 'time' ]
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue
                    ? moment(new Date(row[ 'time' ]), "YYYYMMDDHHMM").fromNow()
                    : EmptyValueTag
                return (
                    <div className="rdg-cell-value">
                        <span>{renderValue}</span>
                    </div>
                )
            },
        },
    ], [handleTxnDetail])

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
            <TxnDetailPanel {...txnDetailInfo} />
        </Modal>
        <Table {...{...defaultArgs, ...props, rawData, showLoading }}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={pagination.total} onPageChange={handlePageChange}/>
        )}
    </TableStyled>
})
