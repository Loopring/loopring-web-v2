import { Box, BoxProps, Typography } from '@mui/material'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import moment from 'moment'
import { Column, Table } from '../../basic-lib'
import {
    EmptyValueTag,
    getValuePrecisionThousand,
    MarketRowHeight,
    SECOND_FORMAT,
    TradeTypes,
} from '@loopring-web/common-resources'
import { RawDataTradeItem } from '../tradeTable'
import { useSettings } from '../../../stores'
import styled from '@emotion/styled'
import { TablePaddingX } from '../../styled'
import { Currency, MarketInfo } from '@loopring-web/loopring-sdk'

export type TradeProTableProps = {
    rawData: RawDataTradeItem[]
    precision: number
    marketInfo: MarketInfo
    currentheight?: number
    rowHeight?: number
    headerRowHeight?: number
}

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${(props: any) => props.currentheight}px;
    //--template-columns: 300px 120px auto auto !important;

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .rdg-header-row {
      font-size: ${({theme}) => theme.fontDefault.body2};
      color: var(--color-text-third);
      // background-color: inherit !important;
    }

    .text-align-right {
      text-align: right;
    }
  }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 2, pRight: theme.unit * 2})}
` as (props: { currentheight?: number } & BoxProps) => JSX.Element

export const TradePro = withTranslation('tables')(
    ({
         t,
         rawData,
         marketInfo,
         // quotePrecision,
         currentheight,
         rowHeight = MarketRowHeight,
         headerRowHeight = MarketRowHeight,
         // tokenMap,
         precision,
         ...rest
     }: WithTranslation & TradeProTableProps) => {
        const {currency, isMobile} = useSettings()
        // @ts-ignore
        const [, baseSymbol, quoteSymbol] = marketInfo?.market?.match(/(\w+)-(\w+)/i)
        const getColumnModeAssets = (
            t: TFunction,
            _currency: Currency,
            // quotePrecision,
            baseSymbol: string,
            quoteSymbol: string,
            precision: number,
        ): Column<Required<RawDataTradeItem>, unknown>[] => [
            ...[
                {
                    key: 'price',
                    name: t('labelTradeProPrice', {symbol: quoteSymbol}),
                    // @ts-ignore
                    formatter: ({row}) => {
                        const color =
                            row?.side === TradeTypes.Buy ? 'var(--color-error)' : 'var(--color-success)'
                        const {value} = row?.price ?? {}

                        // const precision = row['precision'] || 6
                        const renderValue = value
                            ? getValuePrecisionThousand(value, undefined, undefined, precision, true)
                            : EmptyValueTag

                        return (
                            <Box className='rdg-cell-value'>
                                <Typography
                                    textAlign={'left'}
                                    color={color}
                                    variant={'body2'}
                                    lineHeight={`${MarketRowHeight}px`}
                                >
                                    {renderValue}
                                </Typography>
                            </Box>
                        )
                    },
                },
                {
                    key: 'amount',
                    name: t('labelTradeProAmount', {symbol: baseSymbol}),
                    headerCellClass: 'text-align-right',
                    // @ts-ignore
                    formatter: ({row}) => {
                        const {volume} = row['amount']
                        // getValuePrecisionThousand(volume, precision, precision, precision, true)
                        // const value =
                        return (
                            <Box className='rdg-cell-value'>
                                <Typography
                                    className=' text-align-right'
                                    textAlign={'right'}
                                    variant={'body2'}
                                    lineHeight={`${MarketRowHeight}px`}
                                >
                                    {volume ? volume : EmptyValueTag}
                                </Typography>
                            </Box>
                        )
                    },
                },
            ],
            ...(isMobile
                ? []
                : [
                    {
                        key: 'time',
                        name: t('labelTradeTime'),
                        headerCellClass: 'text-align-right',
                        // @ts-ignore
                        formatter: ({row}) => {
                            const time = moment(new Date(row['time'])).format(SECOND_FORMAT) //,M-DD
                            return (
                                <Box className='rdg-cell-value'>
                                    <Typography
                                        className=' text-align-right'
                                        textAlign={'right'}
                                        variant={'body2'}
                                        lineHeight={`${MarketRowHeight}px`}
                                    >
                                        {time}
                                    </Typography>
                                </Box>
                            )
                        },
                    },
                ]),
        ]
        const defaultArgs: any = {
            rawData: rawData,
            columnMode: getColumnModeAssets(
                t,
                currency,
                // quotePrecision,
                baseSymbol,
                quoteSymbol,
                precision,
            ).filter((o) => !o.hidden),
            generateRows: (rawData: any) => rawData,
            generateColumns: ({columnsRaw}: any) => columnsRaw as Column<RawDataTradeItem, unknown>[],
            style: {
                // backgroundColor: ({colorBase}: any) => `${colorBase.box}`
            },
        }

        return (
            <TableStyled currentheight={currentheight}>
                <Table
                    currentheight={currentheight}
                    {...{
                        ...defaultArgs,
                        rawData: rawData,
                        // quotePrecision,
                        rowHeight,
                        headerRowHeight,
                        ...rest,
                    }}
                />
            </TableStyled>
        )
    },
)
