import React, { useEffect } from 'react'
import styled from '@emotion/styled'
import { Box, Link } from '@material-ui/core'
import { TFunction, WithTranslation, withTranslation } from 'react-i18next';
import moment from 'moment'
import { Popover, PopoverType, TablePagination } from '../../basic-lib'
import { Column, generateColumns, generateRows, Table } from '../../basic-lib/tables/index'
import { AlertIcon, CheckIcon, EmptyValueTag, PendingIcon, TableType } from 'static-resource'
import { Filter } from './components/Filter'
import { TablePaddingX } from '../../styled';
import { RawDataTransactionItem, TransactionStatus, TransactionTradeTypes } from './Interface'

interface Row {
    from: string
    to: string
    amount: string
    fee: string
    memo: string
    time: number
    txnHash: string
    status: string
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

const CellStatus = ({row, column, rowIdx}: any) => {
    const status = row[ column.key ]
    const popupId = `${column.key}-${rowIdx}`
    const popoverContent = <div style={{padding: 12}}>
        Because the pool price changes dynamically, the price you see when placing an order may be inconsistent with the
        final transaction price.
    </div>
    const RenderValue = styled.div`
        display: flex;
        align-items: center;
		cursor: pointer;
		color: ${({theme}) => theme.colorBase[ `${TYPE_COLOR_MAPPING.find(o => o.type === status)?.color}` ]};
        // width: 150px;

		& svg {
			font-size: 14px;
			margin: 0 5px 3px 0;
		}
	`
    const svg = status === 'processed' ? <CheckIcon/> : status === 'processing' ? <PendingIcon/> : <AlertIcon/>
    const RenderValueWrapper = <div style={{width: 150}}>
        <RenderValue>
            {svg}{status}
        </RenderValue>
    </div>

    return <div className="rdg-cell-value">
        <Popover
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
        </Popover>
    </div>
}

const getColumnModeTransaction = (t: TFunction): Column<Row, unknown>[] => [
    {
        key: 'token',
        name: t('labelTxToken'),
    },
    {
        key: 'from',
        name: t('labelTxFrom'),
        formatter: ({row, column}) => {
            const valueFrom = row[ column.key ]
            const isMyWallet = valueFrom === 'My Loopring'
            const RenderValue = styled.div`
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				color: ${({theme}) => isMyWallet ? theme.colorBase.textPrimary : theme.colorBase.primaryLight};

				// & p:last-child {
				// 	color: ${({theme}) => theme.colorBase.textPrimary};
				// }

				// p {
				// 	line-height: 100%;
				// }
				
			`

            return (
                <>
                    <RenderValue>
                        {valueFrom}
                    </RenderValue>
                </>
            )
        },
    },
    {
        key: 'to',
        name: t('labelTxTo'),
        formatter: ({row, column}) => {
            const valueTo = row[ column.key ]
            const isMyWallet = valueTo === 'My Loopring'
            const RenderValue = styled.div`
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: center;
				color: ${({theme}) => isMyWallet ? theme.colorBase.textPrimary : theme.colorBase.primaryLight};

				// & p:last-child {
				// 	color: ${({theme}) => theme.colorBase.textPrimary};
				// }

				// p {
				// 	line-height: 100%;
				// }
				
			`
            // const value = typeof to === 'string'
            //     ? <p>{to}</p>
            //     : <>
            //         <p>{to.address}</p>
            //         <p>/ {to.env}</p>
            //     </>

            return (
                <>
                    <RenderValue>
                        {valueTo}
                    </RenderValue>
                </>
            )
        },
    },
    {
        key: 'amount',
        name: t('labelTxAmount'),
        formatter: ({row, column}) => {
            const value = row[ column.key ]
            const hasValue = Number.isFinite(value)
            const renderValue = hasValue ? `${getThousandFormattedNumbers(value, 5)}` : EmptyValueTag
            return (
                <div className="rdg-cell-value">
                    {renderValue}
                </div>
            )
        },
    },
    {
        key: 'fee',
        name: t('labelTxFee'),
        formatter: ({row, column}) => {
            const fee = row[ column.key ]
            const hasValue = Number.isFinite(fee.value)
            const renderValue = hasValue ? `${fee.value.toFixed(4)} ${fee.unit}` : EmptyValueTag
            return (
                <div className="rdg-cell-value">
                    <span>{renderValue}</span>
                </div>
            )
        },
    },
    {
        key: 'memo',
        name: t('labelTxMemo'),
        formatter: ({row, column}) => {
            const value = row[ column.key ]
            const renderValue = value || '--'
            const Wrapper = styled.div`
                color: ${({theme}) => theme.colorBase.textSecondary};
                max-width: 90%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            `
            return (
                <div className="rdg-cell-value">
                    <Wrapper title={renderValue}>{renderValue}</Wrapper>
                </div>
            )
        },
    },
    {
        key: 'time',
        name: t('labelTxTime'),
        formatter: ({row, column}) => {
            const value = row[ column.key ]
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
    {
        key: 'txnHash',
        name: t('labelTxTxnHash'),
        minWidth: 130,
        formatter: ({row, column}) => {
            let path = ''
            if ((row as any)._rawData.length === 9) {
                path = ((row as any)._rawData[ 8 ])
            }
            const value = row[ column.key ]
            const RenderValue = styled.div`
				color: ${({theme}) => theme.colorBase[ value ? 'primaryLight' : 'textSecondary' ]};
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				max-width: 90%;
			`
            return (
                <div className="rdg-cell-value">
                    {path ? <Link href={path}>
                        <RenderValue title={value}>{value || EmptyValueTag}</RenderValue>
                    </Link> : <RenderValue title={value}>{value || EmptyValueTag}</RenderValue>}
                </div>
            )
        }
    },
    {
        key: 'status',
        name: t('labelTxStatus'),
        // minWidth: 150,
        formatter: ({row, column, rowIdx}) => (
            <div className="rdg-cell-value">
                <CellStatus {...{row, column, rowIdx}} />
            </div>
        )
    },
    {
        key: 'tradeType',
        name: 'TradeType',
        hidden: true
    },
]

const TableStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    flex: 1;

    .rdg{
        --template-columns: 80px auto auto auto auto auto auto auto 130px !important;
        .rdg-cell.action{
        display: flex;
        justify-content: center;
        align-items: center;
        }
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
        rawData: [],
        columnMode: getColumnModeTransaction(props.t).filter(o => !o.hidden),
        generateRows,
        generateColumns,
    }
    const {rawData, pagination, showFilter} = props
    const [page, setPage] = React.useState(1)
    const formattedRawData = rawData && Array.isArray(rawData) ? rawData.map(o => Object.values(o)) : []
    // const [totalData, setTotalData] = React.useState(formattedRawData)
    const [totalData, setTotalData] = React.useState<any[]>([])
    const [filterType, setFilterType] = React.useState(TransactionTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState(null)
    const [filterToken, setFilterToken] = React.useState('All Tokens')

    const pageSize = pagination ? pagination.pageSize : 10;

    useEffect(() => {
        setTotalData(rawData && Array.isArray(rawData) ? rawData.map(o => Object.values(o)) : [])
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
                                              // currPage = page
                                          }) => {
        // let resultData = cloneDeep(formattedRawData)
        let resultData = rawData && Array.isArray(rawData) ? rawData.map(o => Object.values(o)) : []
        // o[10]: tradeType
        if (currFilterType !== TransactionTradeTypes.allTypes) {
            resultData = resultData.filter(o => o[ 10 ] === currFilterType)
        }
        if (currFilterDate) {
            const diff = moment(moment()).diff(currFilterDate, 'days')
            // o[6]: date
            resultData = resultData.filter(o => o[ 6 ] === diff)
        }
        // o[0]: token
        if (currFilterToken !== 'All Tokens') {
            resultData = resultData.filter(o => o[ 0 ] === currFilterToken)
        }
        if (TableType === 'filter') {
            setPage(1)
        }
        setTotalData(resultData)
    }, [rawData, filterDate, filterToken, filterType])

    const handleFilterChange = React.useCallback(({filterType, filterDate, filterToken}) => {
        setFilterType(filterType)
        setFilterDate(filterDate)
        setFilterToken(filterToken)
        updateData({
            TableType: TableType.filter,
            currFilterType: filterType,
            currFilterDate: filterDate,
            currFilterToken: filterToken
        })
    }, [updateData])

    const handlePageChange = React.useCallback((page: number) => {
        setPage(page)
        updateData({TableType: TableType.page, currPage: page})
    }, [updateData])

    const FilterStyled = styled(Box)`
        margin-left: 26px;
    `

    return <TableStyled>
        {showFilter && (
            <FilterStyled>
                <Filter originalData={formattedRawData} handleFilterChange={handleFilterChange}/>
            </FilterStyled>
        )}
        <Table {...{...defaultArgs, ...props, rawData: getRenderData()}}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={totalData.length} onPageChange={handlePageChange}/>
        )}
    </TableStyled>
})
