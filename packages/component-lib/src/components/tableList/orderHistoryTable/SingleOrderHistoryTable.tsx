import { Box } from '@mui/material';
import { Column, generateColumns, generateRows, Table, } from '../../basic-lib'
import { OrderHistoryTableDetailItem, OrderPair } from './OrderHistoryTable'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';
import { EmptyValueTag, getValuePrecisionThousand } from '@loopring-web/common-resources';
import styled from '@emotion/styled'
import moment from 'moment'
import { TablePaddingX } from '../../styled'

interface Row {
    amount: OrderPair
    tradingPrice: number
    filledPrice: number
    time: number
    total: {
        key: string;
        value: number;
    }
    sortColumn: string
    filterColumn: string
    actionsStatus: object
}

const TableStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    flex: 1;
    height: auto;

    .rdg {
        --template-columns: 300px auto auto auto 180px !important;

    }
    .textAlignRight{
        text-align: right;

        // .rdg-header-sort-cell {
        //     justify-content: flex-end;
        // }
    }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box

const getColumnModeSingleHistory = (t: TFunction): Column<Row, unknown>[] => {
    return [
        {
            key: 'amount',
            name: t('labelOrderAmount'),
            formatter: ({row, column}) => {
                const {from, to} = row[ column.key ]
                const {key: keyFrom, value: valueFrom} = from
                const {key: keyTo, value: valueTo} = to
                const renderValue = `${getValuePrecisionThousand(valueFrom, 4, 4)} ${keyFrom} \u2192 ${getValuePrecisionThousand(valueTo, 4, 4)} ${keyTo}`
                return <div className="rdg-cell-value">{renderValue}</div>
            },
        },
        // {
        //     key: 'tradingPrice',
        //     name: t('labelOrderTradingPrice'),
        //     formatter: ({row, column}) => {
        //         const value = row[ column.key ]
        //         const hasValue = Number.isFinite(value)
        //         const renderValue = hasValue ? value.toFixed(5) : EmptyValueTag
        //         return <div className="rdg-cell-value">{renderValue}</div>
        //     },
        // },
        {
            key: 'filledPrice',
            name: t('labelOrderFilledPrice'),
            headerCellClass: 'textAlignRight',
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                const renderValue = value ? getValuePrecisionThousand(value, 4, 4) : EmptyValueTag
                return <div className="rdg-cell-value textAlignRight">{renderValue}</div>
            },
        },
        {
            key: 'fee',
            name: t('labelOrderFee'),
            headerCellClass: 'textAlignRight',
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue ? value.toFixed(5) : EmptyValueTag
                return <div className="rdg-cell-value textAlignRight">{renderValue}</div>
            },
        },
        {
            key: 'role',
            name: t('labelOrderRole'),
            headerCellClass: 'textAlignRight',
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                return <div className="rdg-cell-value textAlignRight">{value}</div>
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
        // {
        //     key: 'total',
        //     name: t('labelOrderTotal'),
        //     formatter: ({row, column}) => {
        //         const {key, value} = row[ column.key ]
        //         const hasValue = Number.isFinite(value)
        //         const renderValue = hasValue ? `${value.toFixed(4)} ${key}` : EmptyValueTag
        //         return (
        //             <div className="rdg-cell-value">
        //                 <span>{renderValue}</span>
        //             </div>
        //         )
        //     },
        // },
    ];
}

export interface SingleOrderHistoryTableProps {
    rawData: OrderHistoryTableDetailItem[];
    showloading?: boolean;
}

export const SingleOrderHistoryTable = withTranslation('tables')((props: SingleOrderHistoryTableProps & WithTranslation) => {
    const defaultArgs: any = {
        rawData: [],
        columnMode: getColumnModeSingleHistory(props.t),
        generateRows,
        generateColumns,
    }
    const formattedRawData = props.rawData.map(o => Object.values(o))
    return (
        <TableStyled>
            <Table {...{...defaultArgs, ...props, rawData: formattedRawData}} />
        </TableStyled>
    ) 
})
