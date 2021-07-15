import { Column, generateColumns, generateRows, Table, } from '../../basic-lib'
import { OrderHistoryTableDetailItem, OrderPair } from './OrderHistoryTable'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';
import { EmptyValueTag } from '../../../static-resource';

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

const getColumnModeSingleHistory = (t: TFunction): Column<Row, unknown>[] => {
    return [
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
            key: 'tradingPrice',
            name: t('labelOrderTradingPrice'),
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue ? value.toFixed(5) : EmptyValueTag
                return <div className="rdg-cell-value">{renderValue}</div>
            },
        },
        {
            key: 'filledPrice',
            name: t('labelOrderFilledPrice'),
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue ? value.toFixed(5) : EmptyValueTag
                return <div className="rdg-cell-value">{renderValue}</div>
            },
        },
        {
            key: 'time',
            name: t('labelOrderTime'),
            formatter: ({row, column}) => {
                const value = row[ column.key ]
                const renderValue = Number.isFinite(value)
                    ? `${value} Days`
                    : EmptyValueTag
                return (
                    <div className="rdg-cell-value">
                        <span>{renderValue}</span>
                    </div>
                )
            },
        },
        {
            key: 'total',
            name: t('labelOrderTotal'),
            formatter: ({row, column}) => {
                const {key, value} = row[ column.key ]
                const hasValue = Number.isFinite(value)
                const renderValue = hasValue ? `${value.toFixed(4)} ${key}` : EmptyValueTag
                return (
                    <div className="rdg-cell-value">
                        <span>{renderValue}</span>
                    </div>
                )
            },
        },
    ];
}

export interface SingleOrderHistoryTableProps {
    rawData: OrderHistoryTableDetailItem[]
}

export const SingleOrderHistoryTable = withTranslation()((props: SingleOrderHistoryTableProps & WithTranslation) => {
    const defaultArgs: any = {
        rawData: [],
        columnMode: getColumnModeSingleHistory(props.t),
        generateRows,
        generateColumns,
    }
    const formattedRawData = props.rawData.map(o => Object.values(o))
    return <Table {...{...defaultArgs, ...props, rawData: formattedRawData}} />
})
