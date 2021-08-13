import React from 'react'
import { Box, Typography } from '@material-ui/core'
import { withTranslation, WithTranslation } from 'react-i18next';
import { Button, TablePagination, TableProps } from '../../basic-lib'
import { Column, Table, } from '../../basic-lib/'
import { Currency, EmptyValueTag, getThousandFormattedNumbers, globalSetup, PriceTag } from '@loopring-web/common-resources'
import { Method, MyPoolRow as Row, MyPoolTableProps } from './Interface'
import { FormatterProps } from 'react-data-grid';
import styled from '@emotion/styled';
import { TablePaddingX } from '../../styled';
import { useDeepCompareEffect } from 'react-use';
import { IconColumn } from '../poolsTable';

export enum PoolTradeType {
    add = 'add',
    swap = 'swap',
    remove = 'remove'
}

// enum ActionType {
//     // filter = 'filter',
//     page = 'page'
// }
const rowHeight = 86;

const TableStyled = styled(Box)`
    .rdg {
    --template-columns: 200px auto 300px 250px !important;
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

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as typeof Box
const TypogStyle = styled(Typography)`
    font-size: ${({theme}) => theme.fontDefault.body1};
` as typeof Typography;

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
                        handleDeposit
                    }: WithTranslation & Method<Row<any>>, currency: 'USD' | 'CYN'): Column<Row<any>, unknown>[] => [
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
        sortable: false,
        width: 'auto',
        headerCellClass: 'textAlignRight',
        name: t('labelLiquidity'),
        formatter: ({row}: FormatterProps<Row<any>, unknown>) => {
            if (!row) {
                return <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'}></Box>
            }
            const {balanceA, balanceB, balanceYuan, balanceDollar} = row;
            const formattedYuan = (balanceYuan && Number.isNaN(balanceYuan)) ? balanceYuan : 0
            const formattedDollar = (balanceDollar && Number.isNaN(balanceYuan)) ? balanceDollar : 0
            return <Box height={'100%'} display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
                <TypogStyle variant={'body1'} component={'span'} color={'textPrimary'} fontFamily={'Roboto'}>
                    {balanceDollar === undefined ? EmptyValueTag : currency === Currency.dollar ? PriceTag.Dollar + getThousandFormattedNumbers(formattedDollar)
                        : PriceTag.Yuan + getThousandFormattedNumbers(formattedYuan)}
                </TypogStyle>
                {/* <Typography variant={'body2'} component={'p'} color={'textSecondary'} marginTop={1 / 2}>

                    <Typography component={'span'}
                                color={'textSecondary'}>{getThousandFormattedNumbers(balanceA)}</Typography>
                    <Typography component={'span'} marginLeft={1 / 2}
                                color={'textSecondary'}>{` ${coinAInfo?.simpleName as string}`}</Typography>
                </Typography>
                <Typography variant={'body2'} component={'p'} color={'textSecondary'} marginTop={0}>
                    <Typography component={'span'}
                                color={'textSecondary'}>{getThousandFormattedNumbers(balanceB)}</Typography>
                    <Typography component={'span'} marginLeft={1 / 2}
                                color={'textSecondary'}>{` ${coinBInfo?.simpleName as string}` }</Typography>

                </Typography> */}
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
                return <Box display={'flex'} justifyContent={'flex-end'} alignItems={'center'}></Box>
            }
            const {ammDetail: {coinAInfo, coinBInfo}, feeA, feeB, feeYuan, feeDollar} = row;
            return <Box width={'100%'} height={'100%'} display={'flex'} justifyContent={'flex-end'} alignItems={'center'}>
                {/* <TypogStyle variant={'body1'} component={'span'} color={'textPrimary'}>
                    {feeDollar === undefined ? EmptyValueTag : currency === Currency.dollar ? 'US' + PriceTag.Dollar + getThousandFormattedNumbers(feeDollar)
                        : 'CNY' + PriceTag.Yuan + getThousandFormattedNumbers(feeYuan as number)}
                </TypogStyle> */}
                <Typography variant={'body2'} component={'p'} color={'textPrimary'} fontFamily={'Roboto'}>

                    <Typography component={'span'}
                                >{getThousandFormattedNumbers(feeA)}</Typography>
                    <Typography component={'span'}
                                >{` ${coinAInfo?.simpleName as string}`}</Typography>
                </Typography>
                <Typography variant={'body2'} component={'p'} color={'textPrimary'} marginX={1 / 2}>+</Typography>
                <Typography variant={'body2'} component={'p'} color={'textPrimary'} fontFamily={'Roboto'}>
                    <Typography component={'span'}
                                >{getThousandFormattedNumbers(feeB)}</Typography>
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
                                                                                              handlePageChange,
                                                                                              pagination,
                                                                                              showFilter = true,
                                                                                              rawData,
                                                                                              handleWithdraw,
                                                                                              handleDeposit,
                                                                                              wait = globalSetup.wait,
                                                                                              ...rest
                                                                                          }: MyPoolTableProps<T> & WithTranslation) => {
    const [page, setPage] = React.useState(rest?.page ? rest.page : 1);
    const [totalData, setTotalData] = React.useState<Row<T>[]>(rawData && Array.isArray(rawData) ? rawData : []);
    useDeepCompareEffect(() => {
        setTotalData(rawData)
    }, [rawData])

    const defaultArgs: TableProps<any, any> = {
        rawData,
        columnMode: columnMode({t, i18n, tReady, handleWithdraw, handleDeposit}, Currency.dollar),
        generateRows: (rawData: any) => rawData,
        generateColumns: ({columnsRaw}) => columnsRaw as Column<Row<any>, unknown>[],
    }


    const pageSize = pagination ? pagination.pageSize : 10;

    const getRenderData = React.useCallback(() => pagination
        ? totalData.slice((page - 1) * pageSize, page * pageSize)
        : totalData
        , [page, pageSize, pagination, totalData])

    const _handlePageChange = React.useCallback((page: number) => {
        setPage(page);
        // updateData({actionType: ActionType.page, currPage: page})
        handlePageChange(page);
    }, [handlePageChange])

    return <TableStyled>
        <Table
            rowHeight={rowHeight}
            headerRowHeight={44}
            {...{
                ...defaultArgs, t, i18n, tReady, ...rest,
                rawData: getRenderData()
            }}/>
        {pagination && (
            <TablePagination page={page} pageSize={pageSize} total={totalData.length} onPageChange={_handlePageChange}/>
        )}
    </TableStyled>
})
