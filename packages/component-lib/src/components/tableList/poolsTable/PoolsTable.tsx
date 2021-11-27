import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks';
import { bindHover } from 'material-ui-popup-state/es';
// import * as _ from 'lodash'
import { Button, Column, NewTagIcon, PopoverPure, Table, TableProps } from '../../basic-lib'
import {
    AmmDetail,
    AvatarCoinStyled,
    EmptyValueTag,
    getValuePrecisionThousand,
    globalSetup,
    PriceTag, SoursURL,
} from '@loopring-web/common-resources';
import { Avatar, Box, Typography } from '@mui/material';
import { PoolTableProps, Row } from './Interface';
import styled from '@emotion/styled';
import { TablePaddingX } from '../../styled';
// import { useDeepCompareEffect } from 'react-use';
import { useHistory } from 'react-router-dom';
import { FormatterProps } from 'react-data-grid';
// import store from '@loopring-web/webapp/src/stores';
import { useSettings } from '../../../stores';
import { Currency } from '@loopring-web/loopring-sdk';


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
        border-radius: ${({theme}) => theme.unit}px;
        --template-columns: 240px auto auto auto 200px !important;

        .rdg-cell.action {
        display: flex;
        justify-content: flex-end;                    
        align-items: center;
        }
    }
    .textAlignRight{
        text-align: right;

        .rdg-header-sort-cell {
            justify-content: flex-end;
        }
    }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box


export const IconColumn = React.memo(<R extends AmmDetail<T>, T>({row}: { row: R }) => {
    const {coinJson} = useSettings();
    if(!row || !row.coinAInfo || !row.coinBInfo) {
        return <BoxStyled />
    }
    const {coinAInfo, coinBInfo, isNew, isActivity} = row;
    const coinAIcon: any = coinJson[ coinAInfo?.simpleName ];
    const coinBIcon: any = coinJson[ coinBInfo?.simpleName ];
    return <BoxStyled display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>

        <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
            <Box className={'logo-icon'} display={'flex'} height={'var(--list-menu-coin-size)'}  position={'relative'}  zIndex={20}
                 width={'var(--list-menu-coin-size)'} alignItems={'center'} justifyContent={'center'}>
                {coinAIcon ?
                    <AvatarCoinStyled imgx={coinAIcon.x} imgy={coinAIcon.y}
                                      imgheight={coinAIcon.h}
                                      imgwidth={coinAIcon.w} size={24}
                                      variant="circular" alt={coinAInfo?.simpleName as string}
                        // src={sellData?.icon}
                                      src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                    : <Avatar variant="circular" alt={coinAInfo?.simpleName as string} style={{
                        height: 'var(--list-menu-coin-size)',
                        width: 'var(--list-menu-coin-size)'
                    }}
                        // src={sellData?.icon}
                              src={SoursURL+'images/icon-default.png'}/>
                }</Box>

            <Box className={'logo-icon'} display={'flex'} height={'var(--list-menu-coin-size)'}   position={'relative'}  zIndex={18}   left={-8}
                 width={'var(--list-menu-coin-size)'} alignItems={'center'}
                 justifyContent={'center'}>{coinBIcon ?
                <AvatarCoinStyled imgx={coinBIcon.x} imgy={coinBIcon.y} imgheight={coinBIcon.h}
                                  imgwidth={coinBIcon.w} size={24}
                                  variant="circular" alt={coinBInfo?.simpleName as string}
                    // src={sellData?.icon}
                                  src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                : <Avatar variant="circular" alt={coinBInfo?.simpleName as string} style={{
                    height: 'var(--list-menu-coin-size)',
                    width: 'var(--list-menu-coin-size)'
                }}
                    // src={sellData?.icon}
                          src={SoursURL+'images/icon-default.png'}/>} </Box>
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
                {/*    {t('labelLiquidity') + ' ' + currency === Currency.usd ? PriceTag.Dollar + getThousandFormattedNumbers(amountDollar)*/}
                {/*        : PriceTag.Yuan + getThousandFormattedNumbers(amountYuan)}*/}
                {/*</Typography>*/}
            </Typography>
            {isActivity ? <Typography component={'span'} paddingRight={1}> </Typography> : undefined}
            {isNew ? <NewTagIcon/> : undefined}
        </Box>
    </BoxStyled>

}) as <R extends AmmDetail<T>, T>(props: { row: R }) => JSX.Element;

const columnMode = <R extends Row<T>, T>({t}: WithTranslation, getPopoverState: any, coinJson: any, tokenPrices: any, currency: any, forex?: number): Column<R, unknown>[] => [
    {
        key: 'pools',
        sortable: true,
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
        sortable: true,
        width: 'auto',
        headerCellClass: 'textAlignRight',
        name: t('labelLiquidity'),
        formatter: (({row, rowIdx}) => {
            const {coinA, coinB, totalA, totalB, amountDollar, amountYuan} = row as any
            const popoverState = getPopoverState(rowIdx)

            const coinAIcon: any = coinJson[coinA];
            const coinBIcon: any = coinJson[coinB];
            // const priceADollar = fiatPrices[coinA]?.price || 0
            // const priceAYuan = priceADollar * (forex || 6.5)
            // const priceBDollar = fiatPrices[coinB]?.price || 0
            // const priceBYuan = priceBDollar * (forex || 6.5)
            const liquidityLpToken = currency === Currency.usd ? amountDollar : amountYuan
            return(
                <>  
                    <Box className={'textAlignRight'}>
                        <Button {...bindHover(popoverState)}>
                            <Typography
                                component={'span'} style={{ cursor: 'pointer' }}> {
                                    typeof liquidityLpToken === 'undefined' ? EmptyValueTag : (currency === Currency.usd ? PriceTag.Dollar : PriceTag.Yuan) + getValuePrecisionThousand(liquidityLpToken, undefined, undefined, undefined, true, { isFait: true })}
                            </Typography>
                        </Button>
                    </Box>
                    <PopoverPure
                        className={'arrow-top-center'}
                        {...bindPopper(popoverState)}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}>
                            <Box padding={1.5} paddingLeft={1}>
                                <Typography component={'span'} display={'flex'} flexDirection={'row'}
                                    justifyContent={'space-between'} alignItems={'center'}
                                    style={{ textTransform: 'capitalize' }} color={'textPrimary'}>
                                    <Box component={'span'} className={'logo-icon'} display={'flex'}
                                        height={'var(--list-menu-coin-size)'}
                                        width={'var(--list-menu-coin-size)'} alignItems={'center'}
                                        
                                        justifyContent={'flex-start'}>
                                        {coinAIcon ?
                                            <AvatarCoinStyled imgx={coinAIcon.x} imgy={coinAIcon.y}
                                                imgheight={coinAIcon.h}
                                                imgwidth={coinAIcon.w} size={20}
                                                variant="circular"
                                                style={{ marginTop: 2 }}
                                                alt={coinA as string}
                                                src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'} />
                                            :
                                            <Avatar variant="circular" alt={coinA as string}
                                                style={{
                                                    height: 'var(--list-menu-coin-size))',
                                                    width: 'var(--list-menu-coin-size)'
                                                }}
                                                src={SoursURL+'images/icon-default.png'} />
                                        }
                                        <Typography component={'span'} color={'var(--color-text-primary)'} variant={'body2'} marginLeft={1 / 2}
                                            height={20}
                                            lineHeight={'20px'}>
                                            {coinA}
                                        </Typography>
                                    </Box>
                                        
                                    <Typography component={'span'} color={'var(--color-text-primary)'} variant={'body2'} height={20} marginLeft={10}
                                        lineHeight={'20px'}>
                                        {getValuePrecisionThousand(totalA, undefined, 2)}
                                    </Typography>

                                </Typography>
                                <Typography component={'span'} display={'flex'} flexDirection={'row'}
                                    justifyContent={'space-between'} alignItems={'center'} marginTop={1 / 2}
                                    style={{ textTransform: 'capitalize' }}>
                                    <Box component={'span'} className={'logo-icon'} display={'flex'}
                                        height={'var(--list-menu-coin-size)'}
                                        width={'var(--list-menu-coin-size)'} alignItems={'center'}
                                        justifyContent={'flex-start'}>{coinBIcon ?
                                            <AvatarCoinStyled style={{ marginTop: 2 }} imgx={coinBIcon.x} imgy={coinBIcon.y}
                                                imgheight={coinBIcon.h}
                                                imgwidth={coinBIcon.w} size={20}
                                                variant="circular"
                                                alt={coinB as string}
                                                src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'} />
                                            : <Avatar variant="circular" alt={coinB as string}
                                                style={{
                                                    height: 'var(--list-menu-coin-size)',
                                                    width: 'var(--list-menu-coin-size)'
                                                }}
                                                src={SoursURL+'images/icon-default.png'} />}
                                        <Typography variant={'body2'} color={'var(--color-text-primary)'} component={'span'} marginRight={5} marginLeft={1 / 2} alignSelf={'right'}
                                            height={20}
                                            lineHeight={'20px'}>
                                            {coinB}
                                        </Typography>            
                                    </Box>
                                        
                                    <Typography variant={'body2'} color={'var(--color-text-primary)'} component={'span'} height={20}
                                        marginLeft={10}
                                        lineHeight={'20px'}>
                                        {getValuePrecisionThousand(totalB, undefined, 2)}
                                    </Typography>

                                </Typography>
                            </Box>
                    </PopoverPure>
                </>
            )
        })
    },
    {
        key: 'volume24',
        sortable: true,
        width: 'auto',
        minWidth: 156,
        headerCellClass: 'textAlignRight',
        name: t('label24TradeVolume'),
        formatter: ({row}) => {
            //priceDollar, priceYuan, ,priceDollar: EmptyValueTag, priceYuan: EmptyValueTag
            // typeof priceDollar === 'undefined' ? EmptyValueTag :
            //     currency === Currency.usd ? PriceTag.Dollar + getThousandFormattedNumbers(Number(priceDollar)) : PriceTag.Yuan + getThousandFormattedNumbers(Number(priceYuan))}
            const {volume} = row.tradeFloat && row.tradeFloat.volume ? row.tradeFloat : {volume: EmptyValueTag};
            const totalAmountDollar = (Number(volume) || 0) * (tokenPrices[row.coinAInfo?.simpleName] || 0)
            const totalAmountYuan = (Number(volume) || 0) * (tokenPrices[row.coinAInfo?.simpleName] || 0) * (forex || 6.5)
            const renderValue = currency === Currency.usd ? totalAmountDollar : totalAmountYuan
            const renderUnit = currency === Currency.usd ? PriceTag.Dollar : PriceTag.Yuan
            return <Box className={'textAlignRight'}>
                <Typography
                    component={'span'}> {volume && Number.isFinite(volume)
                        ? renderUnit + getValuePrecisionThousand(renderValue, undefined, undefined, undefined, true, { isFait: true }) : EmptyValueTag} {/* {row.tradeFloat && row.tradeFloat.volume ? row.coinAInfo.simpleName : ''} */}
                </Typography>
            </Box> 
        }
    },
    {
        key: 'APR',
        sortable: true,
        name: t('labelAPR'),
        width: 'auto',
        maxWidth: 68,
        headerCellClass: 'textAlignRight',
        formatter: ({row}) => {
            const APR = typeof row.APR !== undefined && row.APR ? row?.APR : EmptyValueTag;
            return <Box className={'textAlignRight'}>
                <Typography
                component={'span'}> {APR === EmptyValueTag || typeof APR === 'undefined' ? EmptyValueTag : getValuePrecisionThousand(APR, 2, 2, 2, true) + '%'}</Typography>
            </Box>
        }
    },
    {
        key: 'action',
        name: t('labelAction'),
        // maxWidth: 120,
        width: 'auto',
        headerCellClass: `textAlignRight`,
        cellClass: () => `action`,
        formatter: ({row}) => {
            return <Box className={'action'}>
                <Button
                    href={`${window.location.href}/pools/coinPair/${row?.coinAInfo?.simpleName + '-' + row?.coinBInfo?.simpleName}`}
                    className={'btn'} variant={'outlined'} size={'small'}>
                    {t('labelTradePool')}</Button>
            </Box> 
        }
    },
]

export const PoolsTable = withTranslation('tables')(
    <T extends { [ key: string ]: any }>({
                                             t, i18n,
                                             tReady,
                                             // handlePageChange,
                                             // pagination,
                                             showFilter = true,
                                             rawData,
                                             sortMethod,
                                             wait = globalSetup.wait,
                                             tableHeight = 350,
                                             coinJson,
                                             forex,
                                             tokenPrices,
                                             showLoading,
                                             ...rest
                                         }: WithTranslation & PoolTableProps<T>) => {
        // const [filterBy, setFilterBy] = React.useState<string>('');
        // const [page, setPage] = React.useState(rest?.page ? rest.page : 1);
        // const [totalData, setTotalData] = React.useState<Row<T>[]>(rawData && Array.isArray(rawData) ? rawData : []);
        const {currency} = useSettings();
        const history = useHistory()

        const getPopoverState = React.useCallback((label: string) => {
            return usePopupState({variant: 'popover', popupId: `popup-poolsTable-${label}`})
        }, [])

        const defaultArgs: TableProps<any, any> = {
            rawData,
            columnMode: columnMode({t, i18n, tReady}/* , Currency.usd */, getPopoverState, coinJson, tokenPrices, currency, forex),
            generateRows: (rawData: any) => rawData,
            generateColumns: ({columnsRaw}) => columnsRaw as Column<Row<any>, unknown>[],
        }

        const onRowClick = React.useCallback((_rowIdx: any, row: any) => {
            const pathname = `/liquidity/pools/coinPair/${row?.coinAInfo?.simpleName + '-' + row?.coinBInfo?.simpleName}`
            
            history && history.push({
                pathname,
            })
        }, [history])

        return <TableStyled flex={1} flexDirection={'column'} display={'flex'}>

            <Table /* className={'scrollable'} */
                   style={{ height: tableHeight }}
                 {...{
                ...defaultArgs, t, i18n, tReady, ...rest,
                rawData: rawData,
                onRowClick: (index, row) => {
                    onRowClick(index, row)
                },
                showloading: showLoading,
                sortMethod: (sortedRows: any[], sortColumn: string) => sortMethod(sortedRows, sortColumn),
                sortDefaultKey: 'liquidity',
            }}/>
            
        </TableStyled>
    })
