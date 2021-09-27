import { Box, BoxProps, Typography } from '@mui/material'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import moment from 'moment'
import { Column, Table } from '../../basic-lib'
import { EmptyValueTag, MarketRowHeight, myLog, TradeTypes } from '@loopring-web/common-resources';
import { RawDataTradeItem } from '../tradeTable';
import { useSettings } from '../../../stores';
import styled from '@emotion/styled';
import { TablePaddingX } from '../../styled';
import { MarketInfo } from 'loopring-sdk/dist/defs';
import { Currency } from 'loopring-sdk';
// export type RawDataTradeItem = {
//     side: keyof typeof TradeTypes;
//     amount: {
//         from: {
//             key: string;
//             value: number | undefined;
//         },
//         to: {
//             key: string;
//             value: number | undefined;
//         }
//         volume: number
//     };
//     price: {
//         key: string
//         value: number | undefined,
//     }
//     // priceDollar: number;
//     // priceYuan: number;
//     fee: {
//         key: string;
//         value: number | undefined;
//     };
//     time: number;
// }
//<C extends {[key:string]:MarketType}>
export type TradeProTableProps = {
    rawData: RawDataTradeItem[];
    // tokenMap:TokenMap<C>
    // quotePrecision: number,
    precision: number,
    marketInfo:MarketInfo,
    currentheight?: number;
    rowHeight?: number;
    headerRowHeight?: number;
    depthLevel?: number,
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
      font-size: ${({theme}) => theme.fontDefault.body2} ;
      color: var(--color-text-third);
      // background-color: inherit !important;
    }

    .text-align-right {
        text-align: right;
    }
  }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 2, pRight: theme.unit * 2})}
` as (props: { currentheight?:number } & BoxProps) => JSX.Element;


const getColumnModeAssets = (t: TFunction, _currency: 'USD' | 'CNY',
                             // quotePrecision,
                             baseSymbol:string, quoteSymbol:string ,
                             depthLevel?: number,
                       ): Column<Required<RawDataTradeItem>, unknown>[] => [
    {
        key: 'price',
        name: t('labelTradeProPrice', {symbol: quoteSymbol}),
        formatter: ({row}) => {

            const color = row[ 'side' ] === TradeTypes.Buy ? 'var(--color-error)' : 'var(--color-success)';
            const {value} = row[ 'price' ];
            const digitNum = depthLevel || 0
            myLog(digitNum)
            let formattedValue = value as any
            let [_init, _dot] = String((value || '')).split('.');
            if (_dot) {
                const dotLen = _dot.length
                if (dotLen < digitNum) {
                    for (let i = dotLen; i < digitNum; i++) {
                        _dot = _dot + '0'
                    }
                    formattedValue = _init + '.' + _dot
                }
            }

            // const precision = row['precision'] || 6
            // const renderValue = value ? (getValuePrecisionThousand(value, precision, precision, undefined, true)) : EmptyValueTag

            return <Box className="rdg-cell-value">
                <Typography textAlign={'left'} color={color} variant={'body2'} lineHeight={`${MarketRowHeight}px`} > {formattedValue}  </Typography>
            </Box>


        }
    },
    {
        key: 'amount',
        name: t('labelTradeProAmount', {symbol: baseSymbol}),
        headerCellClass: 'text-align-right',
        formatter: ({row}) => {
            const {volume} = row[ 'amount' ];
            // getValuePrecisionThousand(volume, precision, precision, precision, true)
            // const value =
            return <Box className="rdg-cell-value">
                <Typography className=" text-align-right" textAlign={'right'}
                                                               variant={'body2'} lineHeight={`${MarketRowHeight}px`} > {volume ? volume : EmptyValueTag} </Typography>
            </Box>
        }
    },
    {
        key: 'time',
        name: t('labelTradeTime'),
        headerCellClass: 'text-align-right',
        // minWidth: 400,
        formatter: ({row}) => {
            const time = moment(new Date(row[ 'time' ])).format("HH:mm:SS")  //,M-DD
            return <Box className="rdg-cell-value">
                <Typography className=" text-align-right" textAlign={'right'}
                                                               variant={'body2'} lineHeight={`${MarketRowHeight}px`} > {time}</Typography> </Box>
        }
    },
]

export const TradePro = withTranslation('tables')(({
                                                       t,
                                                       rawData,
                                                       marketInfo,
                                                       // quotePrecision,
                                                       currentheight,
                                                       rowHeight = MarketRowHeight,
                                                       headerRowHeight = MarketRowHeight,
                                                       // tokenMap,
                                                       precision,
                                                       depthLevel,
                                                       ...rest
                                                   }: WithTranslation & TradeProTableProps) => {

    const {currency} = useSettings();
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = marketInfo.market.match(/(\w+)-(\w+)/i);

    const defaultArgs: any = {
        rawData: rawData,
        columnMode: getColumnModeAssets(t, currency,
            // quotePrecision,
            baseSymbol, quoteSymbol, depthLevel ).filter(o => !o.hidden),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}: any) => columnsRaw as Column<RawDataTradeItem, unknown>[],
        style: {
            // backgroundColor: ({colorBase}: any) => `${colorBase.box}`
        }
    }


    return <TableStyled currentheight={currentheight} ><Table currentheight={currentheight}  {...{
        ...defaultArgs,
        rawData: rawData,
        // quotePrecision,
        rowHeight,
        headerRowHeight,
        ...rest
    }}/></TableStyled>

})
