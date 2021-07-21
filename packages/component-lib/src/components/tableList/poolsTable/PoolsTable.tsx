import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { debounce } from 'lodash'
import { Button, Column, NewTagIcon, Table, TablePagination, TableProps } from '../../basic-lib'
import {
    AmmDetail, AvatarCoinStyled,
    Currency,
    EmptyValueTag,
    getThousandFormattedNumbers,
    globalSetup,
    MiningIcon,
    PriceTag,
    SearchIcon,
    TableType,
} from '@loopring-web/common-resources';
import { Avatar, Box, InputAdornment, OutlinedInput, Typography } from '@material-ui/core/';
import { PoolTableProps, Row } from './Interface';
import styled from '@emotion/styled';
import {  TablePaddingX } from '../../styled';
import { useDeepCompareEffect } from 'react-use';
import { useHistory } from 'react-router-dom';
import { FormatterProps } from 'react-data-grid';
import { useSettings } from '../../../stores';


// export enum TradeTypes {
//     buy = 'Buy',
//     sell = 'Sell'
// }

// export type RawDataTradeItem = {
//     side: TradeTypes;
//     amount: {
//         from: {
//             key: string;
//             value: number;
//         },
//         to: {
//             key: string;
//             value: number
//         }
//     };
//     price: {
//         key: string;
//         value: number;
//     };
//     fee: {
//         key: string;
//         value: number;
//     };
//     time: number;
// }


// enum TableType {
//     filter = 'filter',
//     page = 'page'
// }
//  ${({theme}) => AvatarIconPair({theme})}
const BoxStyled = styled(Box)`

` as typeof Box
const TableStyled = styled(Box)`
  .rdg {
    --template-columns: 240px auto auto  68px 130px !important;

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box


export const IconColumn = React.memo(<R extends AmmDetail<T>, T>({row}: { row: R }) => {
    const {coinAInfo, coinBInfo, isNew, isActivity} = row;
    const {coinJson} = useSettings();
    const coinAIcon: any = coinJson [ coinAInfo.simpleName ];
    const coinBIcon: any = coinJson [ coinBInfo.simpleName ];
    return <BoxStyled display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>

        <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
            <Box className={'logo-icon'} height={'var(--list-menu-coin-size)'}  position={'relative'}  zIndex={20}
                 width={'var(--list-menu-coin-size)'} alignItems={'center'} justifyContent={'center'}>
                {coinAIcon ?
                    <AvatarCoinStyled imgX={coinAIcon.x} imgY={coinAIcon.y}
                                      imgHeight={coinAIcon.height}
                                      imgWidth={coinAIcon.width} size={24}
                                      variant="circular" alt={coinAInfo?.simpleName as string}
                        // src={sellData?.icon}
                                      src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                    : <Avatar variant="circular" alt={coinAInfo?.simpleName as string} style={{
                        height: 'var(--list-menu-coin-size)',
                        width: 'var(--list-menu-coin-size)'
                    }}
                        // src={sellData?.icon}
                              src={'static/images/icon-default.png'}/>
                }</Box>

            <Box className={'logo-icon'} height={'var(--list-menu-coin-size)'}   position={'relative'}  zIndex={18}   left={-8}
                 width={'var(--list-menu-coin-size)'} alignItems={'center'}
                 justifyContent={'center'}>{coinBIcon ?
                <AvatarCoinStyled imgX={coinBIcon.x} imgY={coinBIcon.y} imgHeight={coinBIcon.height}
                                  imgWidth={coinBIcon.width} size={24}
                                  variant="circular" alt={coinBInfo?.simpleName as string}
                    // src={sellData?.icon}
                                  src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                : <Avatar variant="circular" alt={coinBInfo?.simpleName as string} style={{
                    height: 'var(--list-menu-coin-size)',
                    width: 'var(--list-menu-coin-size)'
                }}
                    // src={sellData?.icon}
                          src={'static/images/icon-default.png'}/>} </Box>
            <Typography variant={'inherit'} display={'flex'} flexDirection={'column'} marginLeft={1} component={'div'}
                        paddingRight={1}>
                <Typography component={'h3'} color={'textPrimary'} title={'sell'}>
                    <Typography component={'span'} className={'next-coin'}>
                        {coinAInfo?.simpleName}
                    </Typography>
                    <Typography component={'i'}>/</Typography>
                    <Typography component={'span'} title={'buy'}>
                        {coinBInfo?.simpleName}
                    </Typography>
                </Typography>
                {/*<Typography variant={'body2'} component={'span'} color={'textSecondary'}>*/}
                {/*    {t('labelLiquidity') + ' ' + currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(amountDollar)*/}
                {/*        : PriceTag.Yuan + getThousandFormattedNumbers(amountYuan)}*/}
                {/*</Typography>*/}
            </Typography>
            {isActivity ? <Typography component={'span'} paddingRight={1}><MiningIcon/> </Typography> : undefined}
            {isNew ? <NewTagIcon/> : undefined}
        </Box>
    </BoxStyled>

}) as <R extends AmmDetail<T>, T>(props: { row: R }) => JSX.Element;

const columnMode = <R extends Row<T>, T>({t}: WithTranslation, currency: 'USD' | 'CYN'): Column<R, unknown>[] => [
    {
        key: 'pools',
        sortable: false,
        width: 'auto',
        minWidth: 240,
        name: t('labelPool'),
        formatter: ({row}: FormatterProps<R, unknown>) => {
            return <Box flex={1} height={'100%'} alignContent={'center'} display={'flex'}>
                <IconColumn row={row as any}/>
            </Box>

        }
    },
    {
        key: 'liquidity',
        sortable: false,
        width: 'auto',
        name: t('labelLiquidity'),
        formatter: ({row}) => {
            const {amountDollar, amountYuan = 0} = row
            return <Typography
                component={'span'}> {
                typeof amountDollar === 'undefined' ? EmptyValueTag :
                    typeof amountDollar === 'undefined' ? EmptyValueTag : currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(amountDollar) : PriceTag.Yuan + getThousandFormattedNumbers(amountYuan)}
            </Typography>

        }
    },
    {
        key: 'volume24',
        sortable: false,
        width: 'auto',
        minWidth: 156,
        name: t('label24TradeVolume'),
        formatter: ({row}) => {
            //priceDollar, priceYuan, ,priceDollar: EmptyValueTag, priceYuan: EmptyValueTag
            // typeof priceDollar === 'undefined' ? EmptyValueTag :
            //     currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(Number(priceDollar)) : PriceTag.Yuan + getThousandFormattedNumbers(Number(priceYuan))}

            const {volume} = row.tradeFloat ? row.tradeFloat : {volume: EmptyValueTag};
            return <Typography
                component={'span'}> {volume} {row.coinAInfo.simpleName}
            </Typography>
        }
    },
    // {
    //     key: 'reward24',
    //     sortable: false,
    //     minWidth: 136,
    //     width: 'auto',
    //     name: t('label24Reward'),
    //     formatter: ({row}) => {
    //         const reward: EmptyValueTag | number = (row.tradeFloat && typeof row.tradeFloat.reward !== 'undefined') ? row.tradeFloat.reward : EmptyValueTag;
    //         return <Typography
    //             component={'span'}> {
    //             reward === EmptyValueTag ? reward :
    //                 currency === Currency.dollar ?
    //                     PriceTag.Dollar + getThousandFormattedNumbers(reward)
    //                     : PriceTag.Yuan + getThousandFormattedNumbers(reward)}
    //         </Typography>
    //     }
    // },
    {
        key: 'APY',
        sortable: false,
        name: t('labelAPY'),
        width: 'auto',
        maxWidth: 68,
        formatter: ({row}) => {
            const APY = typeof row.APY !== undefined && row.APY ? row?.APY : EmptyValueTag;
            return <Typography
                component={'span'}> {APY === EmptyValueTag || typeof APY === 'undefined' ? EmptyValueTag : APY + '%'}</Typography>
        }
    },
    {
        key: 'trade',
        name: t('labelAction'),
        // maxWidth: 120,
        width: 'auto',
        headerCellClass: `action`,
        cellClass: () => `action`,
        formatter: ({row}) => {
            return <Button
                href={`/#/liquidity/pools/coinPair/${row?.coinAInfo?.simpleName + '-' + row?.coinBInfo?.simpleName}`}
                className={'btn'} variant={'outlined'} size={'small'}>
                {t('labelTradePool')}</Button>
        }
    },
]


export const PoolsTable = withTranslation('tables')(
    <T extends { [ key: string ]: any }>({
                                             t, i18n,
                                             tReady,
                                             handlePageChange,
                                             pagination,
                                             showFilter = true,
                                             rawData,
                                             wait = globalSetup.wait,
                                             ...rest
                                         }: WithTranslation & PoolTableProps<T>) => {
        const [filterBy, setFilterBy] = React.useState<string>('');
        const [page, setPage] = React.useState(rest?.page ? rest.page : 1);
        const [totalData, setTotalData] = React.useState<Row<T>[]>(rawData && Array.isArray(rawData) ? rawData : []);
        let history = useHistory();
        useDeepCompareEffect(() => {
            setTotalData(rawData)
        }, [rawData])

        const defaultArgs: TableProps<any, any> = {
            rawData,
            columnMode: columnMode({t, i18n, tReady}, Currency.dollar),
            generateRows: (rawData: any) => rawData,
            generateColumns: ({columnsRaw}) => columnsRaw as Column<Row<any>, unknown>[],
        }


        const pageSize = pagination ? pagination.pageSize : 10;

        const getRenderData = React.useCallback(() => pagination
            ? totalData.slice((page - 1) * pageSize, page * pageSize)
            : totalData
            , [page, pageSize, pagination, totalData])

        const updateData = React.useCallback(({TableType, filterBy}) => {
            if (TableType === 'filter') {
                setPage(1)
            }
            // @ts-ignore
            let newData = rawData.filter((row) => {
                if (row && row.coinAInfo) {
                    // @ts-ignore
                    return RegExp(filterBy, 'ig').test(row.coinAInfo.simpleName) || RegExp(filterBy, 'ig').test(row.coinBInfo.simpleName);
                }
            })
            setTotalData(newData);
        }, [rawData]);
        const doUpdate = (filterBy: string) => {
            updateData({TableType: TableType.filter, filterBy})
        }

        const handleFilterChange = React.useCallback(debounce(doUpdate, wait), [doUpdate]);


        const _handlePageChange = React.useCallback((page: number) => {
            setPage(page);
            updateData({TableType: TableType.page, currPage: page})
            handlePageChange(page);
        }, [updateData, handlePageChange])

        return <TableStyled flex={1} flexDirection={'column'} display={'flex'}>
            {showFilter && <Box display={'flex'} margin={3}>
              <OutlinedInput
                  {...{
                      placeholder: t('labelFilter'),
                      value: filterBy,
                      onChange: (event: any) => {
                          setFilterBy(event.currentTarget?.value);
                          handleFilterChange(event.currentTarget?.value);
                      }
                  }
                  }
                  key={'search'}
                  className={'search'}
                  aria-label={'search'}
                  startAdornment={<InputAdornment position="start">
                      <SearchIcon/>
                  </InputAdornment>}
              />
            </Box>}
            <Table {...{
                ...defaultArgs, t, i18n, tReady, ...rest,
                rawData: getRenderData(),
                onRowClick: (_rowIdx: any, row: any) => {
                    history && history.push(`/liquidity/pools/coinPair/${row?.coinAInfo?.simpleName + '-' + row?.coinBInfo?.simpleName}`)
                }
                // sortMethod: (sortedRows: Row<T>[], sortColumn) => {
                //     switch (sortColumn) {
                //         case 'pools':
                //             sortedRows = sortedRows.sort((a, b) => a?.coinAInfo?.simpleName.localeCompare(b?.coinAInfo?.simpleName))
                //             break;
                //         case 'liquidity':
                //             sortedRows = sortedRows.sort((a, b) => a.amountDollar - b.amountDollar)
                //             break;
                //         case 'volume24':
                //             sortedRows = sortedRows.sort((a, b) => a.tradeFloat.priceDollar - b.tradeFloat.priceDollar)
                //             break;
                //         case 'reward24':
                //             sortedRows = sortedRows.sort((a, b) => a.tradeFloat.reward - b.tradeFloat.reward)
                //             break;
                //         case 'APY':
                //             sortedRows = sortedRows.sort((a, b) => a.tradeFloat.APY - b.tradeFloat.APY)
                //             break;
                //         default:
                //             break;
                //     }
                //     return sortedRows;
                // }
            }}/>
            {pagination && rawData && rawData.length > 0 && (
                <TablePagination page={page} pageSize={pageSize} total={totalData.length}
                                 onPageChange={_handlePageChange}/>
            )}
        </TableStyled>
    })
