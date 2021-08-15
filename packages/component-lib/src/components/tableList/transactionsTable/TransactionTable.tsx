import React from 'react'
import styled from '@emotion/styled'
import { Box, Link } from '@material-ui/core'
import { TFunction, WithTranslation, withTranslation } from 'react-i18next';
import moment from 'moment'
import { useDeepCompareEffect } from 'react-use'
import { Column, Table, TablePagination } from '../../basic-lib'
import {
    AlertIcon,
    CheckIcon,
    EmptyValueTag,
    getFormattedHash,
    PendingIcon,
    TableType
} from '@loopring-web/common-resources'
import { Filter } from './components/Filter'
import { TableFilterStyled, TablePaddingX } from '../../styled';
import { RawDataTransactionItem, TransactionStatus, TransactionTradeTypes } from './Interface'
import { DateRange } from '@material-ui/lab'

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
        width: 28px;
        height: 28px
      }
    `
    const svg = status === 'processed' ? <CheckIcon/> : status === 'processing' ? <PendingIcon/> : <AlertIcon/>
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

const getColumnModeTransaction = (t: TFunction): Column<Row, unknown>[] => [
    // {
    //     key: 'token',
    //     name: t('labelTxToken'),
    // },
    // {
    //     key: 'from',
    //     name: t('labelTxFrom'),
    //     formatter: ({row}) => {
    //         const valueFrom = row['from']
    //         const isMyWallet = valueFrom === 'My Loopring'
    //         const actualValue = isMyWallet ? valueFrom : getFormattedHash(valueFrom)
    //         const RenderValue = styled.div`
    // 			height: 100%;
    // 			display: flex;
    // 			flex-direction: column;
    // 			justify-content: center;
    // 			color: ${({theme}) => valueFrom && !isMyWallet ? theme.colorBase.primaryLight : theme.colorBase.textPrimary};

    // 			// & p:last-child {
    // 			// 	color:var(--color-text-primary);
    // 			// }

    // 			// p {
    // 			// 	line-height: 100%;
    // 			// }

    // 		`

    //         return (
    //             <>
    //                 <RenderValue title={valueFrom}>
    //                     {actualValue || EmptyValueTag}
    //                 </RenderValue>
    //             </>
    //         )
    //     },
    // },
    // {
    //     key: 'to',
    //     name: t('labelTxTo'),
    //     formatter: ({row}) => {
    //         const valueTo = row['to']
    //         const isMyWallet = valueTo === 'My Loopring'
    //         const actualValue = isMyWallet ? valueTo : getFormattedHash(valueTo)
    //         const RenderValue = styled.div`
    // 			height: 100%;
    // 			display: flex;
    // 			flex-direction: column;
    // 			justify-content: center;
    // 			color: ${({theme}) => valueTo && !isMyWallet ? theme.colorBase.primaryLight : theme.colorBase.textPrimary};

    // 			// & p:last-child {
    // 			// 	color:var(--color-text-primary);
    // 			// }

    // 			// p {
    // 			// 	line-height: 100%;
    // 			// }

    // 		`
    //         // const value = typeof to === 'string'
    //         //     ? <p>{to}</p>
    //         //     : <>
    //         //         <p>{to.address}</p>
    //         //         <p>/ {to.env}</p>
    //         //     </>

    //         return (
    //             <>
    //                 <RenderValue title={valueTo}>
    //                     {actualValue || EmptyValueTag}
    //                 </RenderValue>
    //             </>
    //         )
    //     },
    // },
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
    // {
    //     key: 'memo',
    //     name: t('labelTxMemo'),
    //     formatter: ({row, column}) => {
    //         const value = row[ column.key ]
    //         const renderValue = value || EmptyValueTag
    //         const Wrapper = styled.div`
    //             color: var(--color-text-secondary);
    //             max-width: 90%;
    //             overflow: hidden;
    //             text-overflow: ellipsis;
    //             white-space: nowrap;
    //         `
    //         return (
    //             <div className="rdg-cell-value">
    //                 <Wrapper title={renderValue}>{renderValue}</Wrapper>
    //             </div>
    //         )
    //     },
    // },
    {
        key: 'txnHash',
        name: t('labelTxTxnHash'),
        formatter: ({row}) => {
            // let path = ''
            // if ((row as any)._rawData.length === 9) {
            //     path = ((row as any)._rawData[ 8 ])
            // }
            const path = row[ 'path' ] || ''
            const value = row[ 'txnHash' ]
            const RenderValue = styled.div`
              color: ${({theme}) => theme.colorBase[ value ? 'primary' : 'textSecondary' ]};
              // overflow: hidden;
              // text-overflow: ellipsis;
              // white-space: nowrap;
              // max-width: 90%;
            `
            return (
                <div className="rdg-cell-value">
                    {path ? <Link href={path}>
                            <RenderValue title={value}>{value || EmptyValueTag}</RenderValue>
                        </Link> :
                        <RenderValue title={value}>{value ? getFormattedHash(value) : EmptyValueTag}</RenderValue>}
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
]

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    --template-columns: 120px auto auto auto 100px 120px !important;

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .rdg-cell {
    display: flex;
    align-items: center;
  }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box

export interface TransactionTableProps {
    rawData: RawDataTransactionItem[];
    pagination?: {
        pageSize: number;
    }
    showFilter?: boolean;
}


export const TransactionTable = withTranslation('tables')((props: TransactionTableProps & WithTranslation) => {
    const defaultArgs: any = {
        // rawData: [],
        columnMode: getColumnModeTransaction(props.t).filter(o => !o.hidden),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}: any) => columnsRaw as Column<any, unknown>[],
    }
    const {rawData, pagination, showFilter} = props
    const [page, setPage] = React.useState(1)
    const [totalData, setTotalData] = React.useState<RawDataTransactionItem[]>(rawData)
    const [filterType, setFilterType] = React.useState(TransactionTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState<DateRange<Date | string>>(['', ''])
    const [filterToken, setFilterToken] = React.useState<string>('All Tokens')

    const pageSize = pagination ? pagination.pageSize : 10;

    useDeepCompareEffect(() => {
        setTotalData(rawData);
    }, [rawData])

    const getRenderData = React.useCallback(() => pagination
        ? totalData.slice((page - 1) * pageSize, page * pageSize)
        : totalData
        , [page, pagination, pageSize, totalData])

    const updateData = React.useCallback(({
                                              TableType,
                                              currFilterType = filterType,
                                              currFilterDate = filterDate,
                                              currFilterToken = filterToken,
                                          }) => {
        let resultData = rawData || []
        if (currFilterType !== TransactionTradeTypes.allTypes) {
            resultData = resultData.filter(o => o.side === currFilterType)
        }
        if (currFilterDate[ 0 ] && currFilterDate[ 1 ]) {
            const startTime = Number(moment(currFilterDate[ 0 ]).format('x'))
            const endTime = Number(moment(currFilterDate[ 1 ]).format('x'))
            resultData = resultData.filter(o => o.time < endTime && o.time > startTime)
        }
        if (currFilterToken !== 'All Tokens') {
            resultData = resultData.filter(o => o.amount.unit === currFilterToken)
        }
        if (TableType === 'filter') {
            setPage(1)
        }
        setTotalData(resultData)
    }, [rawData, filterDate, filterType, filterToken])

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

    const handlePageChange = React.useCallback((page: number) => {
        setPage(page)
        updateData({TableType: TableType.page, currPage: page})
    }, [updateData])

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
        <Table {...{...defaultArgs, ...props, rawData: getRenderData()}}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={totalData.length} onPageChange={handlePageChange}/>
        )}
    </TableStyled>
})
