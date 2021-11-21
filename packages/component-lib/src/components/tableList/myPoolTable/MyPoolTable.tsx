import React from 'react'
import { Avatar, Box, Typography } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next';
import { Button, PopoverPure, TableProps } from '../../basic-lib'
import { Column, Table, } from '../../basic-lib/'
import {
    AvatarCoinStyled,
    EmptyValueTag,
    getValuePrecisionThousand,
    globalSetup,
    PriceTag, SoursURL,
} from '@loopring-web/common-resources'
import { Method, MyPoolRow as Row, MyPoolTableProps } from './Interface'
import { FormatterProps } from 'react-data-grid';
import styled from '@emotion/styled';
import { TablePaddingX } from '../../styled';
import { IconColumn } from '../poolsTable';
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks';
import { bindHover } from 'material-ui-popup-state/es';
import { useSettings } from '../../../stores';
import { Currency } from '@loopring-web/loopring-sdk';

export enum PoolTradeType {
    add = 'add',
    swap = 'swap',
    remove = 'remove'
}

// enum ActionType {
//     // filter = 'filter',
//     page = 'page'
// }
// const rowHeight = 86;
const rowHeight = 44;

const TableStyled = styled(Box)`
    .rdg {
        --template-columns: 200px auto 300px auto !important;
        height: calc(86px * 5 + var(--header-row-height));
        .rdg-cell.action {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    .textAlignRight{
        text-align: right;
    }
    .textAlignRightSortable {
        display: flex;
        justify-content: flex-end;
    }

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box
// const TypogStyle = styled(Typography)`
//     font-size: ${({theme}) => theme.fontDefault.body1};
// ` as typeof Typography;

const PoolStyle = styled(Box)`
    height: calc(${rowHeight}px);
    &.MuiTypography-body1 {
        font-size: ${({theme}) => theme.fontDefault.body1};
    }
    .MuiButton-root:not(:first-of-type){
        margin-left:  ${({theme}) => theme.unit}px;
    }
` as typeof Box;

const columnMode = ({
                        t,
                        handleWithdraw,
                        handleDeposit,
                        allowTrade,
                    }: WithTranslation & Method<Row<any>>, currency: Currency, getPopoverState: any, coinJson: any): Column<Row<any>, unknown>[] => [
    {
        key: 'pools',
        sortable: false,
        width: 'auto',
        minWidth: 240,
        name: t('labelPool'),
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            return <PoolStyle display={'flex'} flexDirection={'column'} alignContent={'flex-start'}
                            justifyContent={'center'}>
                <IconColumn row={row.ammDetail as any}/>
            </PoolStyle>

        }
    },

    {
        key: 'liquidity',
        sortable: true,
        width: 'auto',
        headerCellClass: 'textAlignRightSortable',
        name: t('labelLiquidity'),
        formatter: ({row, rowIdx}: FormatterProps<Row<any>, unknown>) => {
            const popState = getPopoverState(rowIdx)
            if (!row || !row.ammDetail) {
                return <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'}/>
            }
            const {totalAmmValueDollar, totalAmmValueYuan, balanceA, balanceB, ammDetail: {coinAInfo, coinBInfo}} = row as any;
            const coinAIcon: any = coinJson[ coinAInfo.simpleName ];
            const coinBIcon: any = coinJson[ coinBInfo.simpleName ];
            // const formattedYuan = (balanceYuan && Number.isNaN(balanceYuan)) ? balanceYuan : 0
            // const formattedDollar = (balanceDollar && Number.isNaN(balanceYuan)) ? balanceDollar : 0
            return <Box height={'100%'} display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
                    <Box {...bindHover(popState)}>
                        <Typography
                            component={'span'} style={{ cursor: 'pointer' }}> {
                                typeof totalAmmValueDollar === 'undefined' ? EmptyValueTag : (currency === Currency.usd ? PriceTag.Dollar + getValuePrecisionThousand(totalAmmValueDollar, undefined, undefined, undefined, true, { isFait: true, floor: true }) : PriceTag.Yuan + getValuePrecisionThousand(totalAmmValueYuan, undefined, undefined, undefined, true, { isFait: true, floor: true }))}
                        </Typography>
                    </Box>
                    <PopoverPure
                        className={'arrow-top-center'}
                        {...bindPopper(popState)}
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
                                                alt={coinAInfo.simpleName as string}
                                                src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'} />
                                            :
                                            <Avatar variant="circular" alt={coinAInfo.simpleName as string}
                                                style={{
                                                    height: 'var(--list-menu-coin-size))',
                                                    width: 'var(--list-menu-coin-size)'
                                                }}
                                                src={SoursURL+'images/icon-default.png'} />
                                        }
                                        <Typography component={'span'} color={'var(--color-text-primary)'} variant={'body2'} marginLeft={1 / 2}
                                            height={20}
                                            lineHeight={'20px'}>
                                            {coinAInfo.simpleName}
                                        </Typography>
                                    </Box>
                                        
                                    <Typography component={'span'} color={'var(--color-text-primary)'} variant={'body2'} height={20} marginLeft={10}
                                        lineHeight={'20px'}>
                                        {getValuePrecisionThousand(balanceA, 4, 4)}
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
                                                alt={coinBInfo.simpleName as string}
                                                src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'} />
                                            : <Avatar variant="circular" alt={coinBInfo.simpleName as string}
                                                style={{
                                                    height: 'var(--list-menu-coin-size)',
                                                    width: 'var(--list-menu-coin-size)'
                                                }}
                                                src={SoursURL+'images/icon-default.png'} />}
                                        <Typography variant={'body2'} color={'var(--color-text-primary)'} component={'span'} marginRight={5} marginLeft={1 / 2} alignSelf={'right'}
                                            height={20}
                                            lineHeight={'20px'}>
                                            {coinBInfo.simpleName}
                                        </Typography>            
                                    </Box>
                                        
                                    <Typography variant={'body2'} color={'var(--color-text-primary)'} component={'span'} height={20}
                                        marginLeft={10}
                                        lineHeight={'20px'}>
                                        {getValuePrecisionThousand(balanceB, 4, 4)}
                                    </Typography>

                                </Typography>
                            </Box>
                    </PopoverPure>
            </Box>
        }
    },
    {
        key: 'feesEarned',
        sortable: false,
        width: 'auto',
        name: t('labelFeeEarned'),
        headerCellClass: 'textAlignRight',
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            if (!row.ammDetail || !row.ammDetail.coinAInfo) {
                return <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'}/>
            }
            const {ammDetail: {coinAInfo, coinBInfo}, feeA, feeB, precisionA , precisionB} = row as any;
            return <Box width={'100%'} height={'100%'} display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
                {/* <TypogStyle variant={'body1'} component={'span'} color={'textPrimary'}>
                    {feeDollar === undefined ? EmptyValueTag : currency === Currency.usd ? 'US' + PriceTag.Dollar + getThousandFormattedNumbers(feeDollar)
                        : 'CNY' + PriceTag.Yuan + getThousandFormattedNumbers(feeYuan as number)}
                </TypogStyle> */}
                <Typography variant={'body2'} component={'p'} color={'textPrimary'} fontFamily={'Roboto'}>

                    <Typography component={'span'}
                                >{getValuePrecisionThousand(feeA, undefined, undefined, precisionA, false, { floor: true })}</Typography>
                    <Typography component={'span'}
                                >{` ${coinAInfo?.simpleName as string}`}</Typography>
                </Typography>
                <Typography variant={'body2'} component={'p'} color={'textPrimary'} marginX={1 / 2}>+</Typography>
                <Typography variant={'body2'} component={'p'} color={'textPrimary'} fontFamily={'Roboto'}>
                    <Typography component={'span'}
                                >{getValuePrecisionThousand(feeB, undefined, undefined, precisionB, false, { floor: true } )}</Typography>
                    <Typography component={'span'}
                                >{` ${coinBInfo?.simpleName as string}` }</Typography>

                </Typography>
            </Box>

        }
    },
    {
        key: 'action',
        name: t('labelActions'),
        headerCellClass: 'textAlignRight',
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            return <PoolStyle display={'flex'} flexDirection={'column'} alignItems={'flex-end'}
                            justifyContent={'center'}>
                <Box display={'flex'} marginRight={-1}>
                    <Button variant={'text'} size={'small'}
                            disabled={!(allowTrade?.joinAmm?.enable)}
                            onClick={() => {
                                                                handleDeposit(row)
                                                            }}>{t('labelPoolTableAddLiqudity')}</Button>
                    <Button variant={'text'} size={'small'}
                            onClick={() => {
                                handleWithdraw(row)
                            }}>{t('labelPoolTableRemoveLiqudity')}</Button>
                </Box>
            </PoolStyle>
        }
    }
]


export const MyPoolTable = withTranslation('tables')(<T extends { [ key: string ]: any }>({
                                                                                              t, i18n,
                                                                                              tReady,
                                                                                              allowTrade,
                                                                                              handlePageChange,
                                                                                              pagination,
                                                                                              showFilter = true,
                                                                                              rawData,
                                                                                              handleWithdraw,
                                                                                              handleDeposit,
                                                                                              wait = globalSetup.wait,
                                                                                              currency =  Currency.usd,
                                                                                              showloading,
                                                                                              ...rest
                                                                                          }: MyPoolTableProps<T> & WithTranslation) => {
    // const [page, setPage] = React.useState(rest?.page ? rest.page : 1);
    // const [totalData, setTotalData] = React.useState<Row<T>[]>(rawData && Array.isArray(rawData) ? rawData : []);
    // useDeepCompareEffect(() => {
    //     setTotalData(rawData)
    // }, [rawData])

    const {coinJson} = useSettings();

    const getPopoverState = React.useCallback((label: string) => {
        return usePopupState({variant: 'popover', popupId: `popup-poolsTable-${label}`})
    }, [])

    const defaultArgs: TableProps<any, any> = {
        rawData,
        columnMode: columnMode({t, i18n, tReady, handleWithdraw, handleDeposit,allowTrade}, currency, getPopoverState, coinJson),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}) => columnsRaw as Column<Row<any>, unknown>[],
        sortMethod: (sortedRows: MyPoolTableProps<T>[], sortColumn: string) => {
            switch (sortColumn) {
                case 'liquidity':
                    sortedRows = sortedRows.sort((a, b) => {
                        const valueA = a[ 'liquidity' ]
                        const valueB = b[ 'liquidity' ]
                        if (valueA && valueB) {
                            return valueB - valueA
                        }
                        if (valueA && !valueB) {
                            return -1
                        }
                        if (!valueA && valueB) {
                            return 1
                        }
                        return 0
                    })
                    break;
                default:
                    return sortedRows
            }
            return sortedRows;
        },
        sortDefaultKey: 'liquidity'
    }


    // const pageSize = pagination ? pagination.pageSize : 10;
    //
    // const getRenderData = React.useCallback(() => pagination
    //     ? totalData.slice((page - 1) * pageSize, page * pageSize)
    //     : totalData
    //     , [page, pageSize, pagination, totalData])
    //
    // const _handlePageChange = React.useCallback((page: number) => {
    //     setPage(page);
    //     // updateData({actionType: ActionType.page, currPage: page})
    //     handlePageChange(page);
    // }, [handlePageChange])

    return <TableStyled>
        <Table
            rowHeight={rowHeight}
            headerRowHeight={44}
            showloading={showloading}
            {...{
                ...defaultArgs, t, i18n, tReady, ...rest,
                rawData: rawData
            }}/>
        {/* {pagination && rawData.length > pageSize && (
            <TablePagination page={page} pageSize={pageSize} total={totalData.length} onPageChange={_handlePageChange}/>
        )} */}
    </TableStyled>
})
