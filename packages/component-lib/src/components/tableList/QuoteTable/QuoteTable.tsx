import {  useCallback } from 'react'
import styled from '@emotion/styled'
import { Button, Box } from '@material-ui/core'
import { withTranslation, WithTranslation } from 'react-i18next'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { EmptyValueTag, FloatTag, getThousandFormattedNumbers } from 'static-resource'
import { Column, Table } from '../../basic-lib/tables/index'
import { TablePaddingX } from '../../styled'
import { Typography } from '@material-ui/core/';



const TableStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    flex: 1;

    .rdg{
        height: 750px;
        --template-columns: 240px auto auto auto auto auto 92px !important;
        .rdg-cell.action{
        display: flex;
        justify-content: center;
        align-items: center;
        }
    }
    ${({theme}) => TablePaddingX({pLeft:theme.unit * 3,pRight:theme.unit * 3})}
` as typeof Box

// interface Row {
//     price: string
//     size: string
//     volume: string
//     number: string
//     sortColumn: string
//     filterColumn: string
//     cellExpend: {
//         value: string
//         children: []
//         isExpanded: boolean
//     }
//     children?: Row[]
//     isExpanded?: boolean
//     format?: any
// }

// export type QuoteTableRawDataItem = (string | number | string[] | number[])[]
export type QuoteTableRawDataItem = {
    pair: {
        coinA: string;
        coinB: string;
    }
    close: number;
    change: number;
    high: number;
    low: number;
    floatTag:keyof typeof FloatTag
    volume: number;
}

// const CoinPairCell: any = styled.span`
// 	display: flex;
// 	align-items: center;
// `

const QuoteTableChangedCell: any = styled.span`
	color: ${(props: any) => {
        const {theme: {colorBase}} = props
        return props.value > 0
            ? colorBase.success
            : props.value < 0
                ? colorBase.error
                : colorBase.textSecondary
    }
}
`

// const getColumnModelQuoteTable = (t: TFunction, history: any): Column<Row, unknown>[] => [
const  columnMode = ({t}: WithTranslation,history: any): Column<QuoteTableRawDataItem, unknown>[] => [
    {
        key: 'pair',
        name: t('labelQuotaPair'),
        // sortable: true,
        formatter: ({row}) => {
            // const RenderValue = styled.span`
			// 	color: ${({theme}) => theme.colorBase.textSecondary}
			// `
            const {coinA, coinB} = row['pair']
            return (
                <Box className="rdg-cell-value" >
                        {/* <StarIcon/> */}
                        <Typography component={'span'}> {coinA}<Typography component={'span'} color={'textSecondary'}> / {coinB}</Typography>
                        </Typography>

                </Box>
            )
        },
    },
    {
        key: 'close',
        name: t('labelQuotaLastPrice'),
        // sortable: true,
        formatter: ({row}) => {
            const value = row[ 'close' ]
            // const [valueFirst, valueLast] = value
            // const getRenderValue = (value: number) => {
            //     return Number.isFinite(value) ? value.toFixed(2) : EmptyValueTag;
            // }
            // const RenderValue = styled.span`
			// 	color: ${({theme}) => theme.colorBase.textSecondary}
			// `
            return (
                <div className="rdg-cell-value">
                    <span>{typeof value !== 'undefined'? getThousandFormattedNumbers(value):EmptyValueTag}</span>
                </div>
            )
        },
    },
    {
        key: 'change',
        name: t('labelQuota24hChange'),
        // sortable: true,
        formatter: ({row}) => {
            const value = row.change

            // const hasValue = Number.isFinite(value)
            // const isPositive = value > 0
            // const sign = isPositive ? '+' : ''
            // const renderValue = hasValue ? `${sign}${value.toFixed(2)}%` : 'N/A%'
            return (
                <div className="rdg-cell-value">
                    <QuoteTableChangedCell value={value}>
                        {typeof value !== 'undefined'? (
                            (row.floatTag === FloatTag.increase?'+': '') + getThousandFormattedNumbers(value) + '%'):EmptyValueTag}
                    </QuoteTableChangedCell>
                </div>
            )
        },
    },
    {
        key: 'high',
        name: t('labelQuota24hHigh'),
        // sortable: true,
        formatter: ({row, column}) => {
            const value = row[ column.key ]
            // const hasValue = Number.isFinite(value)
            // const renderValue = hasValue ? value.toFixed(2) : EmptyValueTag
            return (
                <div className="rdg-cell-value">
                    <span>{typeof value !== 'undefined'? getThousandFormattedNumbers(value):EmptyValueTag}</span>
                </div>
            )
        },
    },
    {
        key: 'low',
        name: t('labelQuota24hLow'),
        // sortable: true,
        formatter: ({row, column}) => {
            const value = row[ column.key ]
            // const hasValue = Number.isFinite(value)
            // const renderValue = hasValue ? value.toFixed(2) : EmptyValueTag
            return (
                <div className="rdg-cell-value">
                    <span>{typeof value !== 'undefined'? getThousandFormattedNumbers(value):EmptyValueTag}</span>
                </div>
            )
        },
    },
    {
        key: 'volume',
        name: t('labelQuota24Volume'),
        // sortable: true,
        formatter: ({row}) => {
            const value = row[ 'volume' ]
            return (
                <div className="rdg-cell-value">
                    <span>{typeof value !== 'undefined'? getThousandFormattedNumbers(value):EmptyValueTag}</span>
                </div>
            )
        },
    },
    {
        key: 'trade',
        name: '',
        formatter: ({row}) => {
            const {coinA, coinB} = row['pair']
            const tradePair = `${coinA}-${coinB}`
            return (
                <div className="rdg-cell-value">
                    <Button variant="outlined" onClick={() => history.push({
                        pathname: `/trading/lite/${tradePair}`
                    })}>Trade</Button>
                </div>
            )
        }
    }
]

export interface QuoteTableProps {
    rawData: QuoteTableRawDataItem[],
    rowHeight?: number
    onVisibleRowsChange?: (startIndex: number) => void,
    // generateColumns: ({
    //                       columnsRaw,
    //                       t,
    //                       ...rest
    //                   }: { columnsRaw: readonly Column<R,unknown>[], [ key: string ]: any } & WithT) => Array<RdgColumns<R>>;
}

export type VisibleDataItem = {
    coinA: string;
    coinB: string;
}

export const QuoteTable = withTranslation('tables')(withRouter(({ t, rowHeight = 44,onVisibleRowsChange, rawData, history, ...rest } : QuoteTableProps & WithTranslation & RouteComponentProps) => {
    //const formattedRawData = rawData && Array.isArray(rawData) ? rawData : []
    const getScrollIndex = useCallback((e) => {
        const startIndex =  parseInt(String(e.target.scrollTop / rowHeight))
        // const data = rawData && Array.isArray(rawData) ? rawData : []
        // const viewportRows = data.slice(startIndex, startIndex + 10).map(o => ({
        //     coinA: o.pair.coinA,
        //     coinB: o.pair.coinB
        // }))
        if (onVisibleRowsChange) {
            onVisibleRowsChange(startIndex)
        }
    }, [onVisibleRowsChange, rawData])

   // const finalData = formattedRawData.map(o => Object.values(o))
    const defaultArgs: any = {
        rawData: [],
        columnMode: columnMode({t, ...rest}, history),//getColumnModelQuoteTable(t, history),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}:any) => columnsRaw as Column<QuoteTableRawDataItem, unknown>[],
    }

    return (
        <TableStyled>
            <Table className={'scrollable'} {...{...defaultArgs, ...rest,onVisibleRowsChange , rawData , rowHeight}} onScroll={getScrollIndex} />
        </TableStyled>
    )
}))
