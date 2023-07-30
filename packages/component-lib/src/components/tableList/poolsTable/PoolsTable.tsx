import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks'
import { bindHover } from 'material-ui-popup-state/es'
import * as sdk from '@loopring-web/loopring-sdk'

import {
  Button,
  Column,
  InputSearch,
  NewTagIcon,
  Popover,
  PopoverPure,
  PopoverType,
  PopoverWrapProps,
  Table,
  TableProps,
} from '../../basic-lib'
import {
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  MoreIcon,
  PriceTag,
  RowConfig,
  RowInvestConfig,
  SCENARIO,
  TokenType,
} from '@loopring-web/common-resources'
import { Box, BoxProps, Grid, Typography } from '@mui/material'
import { PoolRow, PoolTableProps } from './Interface'
import styled from '@emotion/styled'
import { FormatterProps } from 'react-data-grid'

import { useSettings } from '../../../stores'
import { TablePaddingX } from '../../styled'
import { AmmAPRDetail, AmmPairDetail, TagIconList } from '../../block'
import { ActionPopContent } from '../myPoolTable/components/ActionPop'
import { CoinIcons } from '../assetsTable'
import _ from 'lodash'
import { useHistory, useLocation } from 'react-router-dom'

const TableStyled = styled(Box)<{ isMobile?: boolean } & BoxProps>`
  .rdg {
    border-radius: ${({ theme }) => theme.unit}px;

    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 240px auto auto auto 200px !important;`
        : ` --template-columns: 16% 50% auto 8% !important;
`}
    .rdg-cell.action {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }

  .textAlignRight {
    text-align: right;

    .rdg-header-sort-cell {
      justify-content: flex-end;
    }
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element

export const PoolsTable = withTranslation(['tables', 'common'])(
  <T extends PoolRow<any>>({
    t,
    i18n,
    tReady,
    campaignTagConfig,
    showFilter = true,
    rawData,
    filterValue: _filterValue,
    getFilteredData,
    wait = globalSetup.wait,
    showLoading,
    handleWithdraw,
    handleDeposit,
    rowConfig = RowConfig,
    forexValue = 1,
    ...rest
  }: WithTranslation & PoolTableProps<T>) => {
    const { currency, isMobile, coinJson } = useSettings()
    const { search, pathname } = useLocation()
    const searchParams = new URLSearchParams(search)
    const history = useHistory()
    const [filterValue, setFilterValue] = React.useState(_filterValue ?? '')

    const updateData = _.debounce(({ searchValue = '' }: { searchValue: string }) => {
      getFilteredData(searchValue)
    }, wait)
    const handleFilterChange = React.useCallback(async ({ searchValue }: any) => {
      setFilterValue(searchValue)
      searchParams.set('search', searchValue ?? '')
      history.push({
        pathname,
        search: searchParams.toString(),
      })
      updateData({ searchValue })
    }, [])

    const sortMethod = React.useCallback(
      (_sortedRows, sortColumn) => {
        let _rawData = []
        switch (sortColumn) {
          case 'pools':
            _rawData = rawData.sort((a, b) => {
              const valueA = a.coinAInfo.simpleName
              const valueB = b.coinAInfo.simpleName
              return valueB.localeCompare(valueA)
            })
            break
          case 'liquidity':
            _rawData = rawData.sort((a, b) => {
              return sdk
                .toBig(b.amountU?.replaceAll(sdk.SEP, '') ?? 0)
                .minus(a.amountU?.replaceAll(sdk.SEP, '') ?? 0)
                .toNumber()
            })
            break
          case 'volume24':
            _rawData = rawData.sort((a, b) => {
              return sdk
                .toBig(b?.tradeFloat?.priceU ?? 0)
                .minus(a?.tradeFloat?.priceU ?? 0)
                .toNumber()
            })
            break
          case 'APR':
            _rawData = rawData.sort((a, b) => {
              return sdk
                .toBig(b.APR ?? 0)
                .minus(a.APR ?? 0)
                .toNumber()
            })
            break
          default:
            _rawData = rawData
        }
        return _rawData
      },
      [rawData],
    )
    const columnMode = (): Column<T, any>[] => [
      {
        key: 'pools',
        sortable: true,
        width: 'auto',
        minWidth: 240,
        name: t('labelPool'),
        formatter: ({ row }: FormatterProps<T>) => {
          return (
            <Box
              flex={1}
              height={'100%'}
              alignContent={'center'}
              display={'flex'}
              alignItems={'center'}
            >
              <CoinIcons
                type={TokenType.lp}
                tokenIcon={[coinJson[row.coinA], coinJson[row.coinB]]}
              />
              <Typography
                variant={'inherit'}
                color={'textPrimary'}
                display={'flex'}
                flexDirection={'row'}
                marginLeft={2}
                component={'span'}
                paddingRight={1}
              >
                <Typography component={'span'} className={'next-coin'}>
                  <Typography variant='inherit' component={'span'} className={'next-coin'}>
                    {row.coinAInfo?.simpleName}
                  </Typography>
                  <Typography variant='inherit' component={'i'}>
                    /
                  </Typography>
                  <Typography variant='inherit' component={'span'} title={'buy'}>
                    {row.coinBInfo?.simpleName}
                  </Typography>
                </Typography>
                <Typography
                  variant='inherit'
                  component={'span'}
                  display={'inline-flex'}
                  title={'buy'}
                  alignItems={'center'}
                  paddingLeft={1 / 2}
                >
                  {campaignTagConfig && (
                    <TagIconList
                      scenario={SCENARIO.AMM}
                      campaignTagConfig={campaignTagConfig}
                      symbol={row.market}
                    />
                  )}
                  {row.isNew && <NewTagIcon />}
                </Typography>
              </Typography>
            </Box>
          )
        },
      },
      {
        key: 'liquidity',
        sortable: true,
        width: 'auto',
        headerCellClass: 'textAlignRight',
        name: t('labelLiquidity'),
        formatter: ({ row, rowIdx }) => {
          const { coinA, coinB, totalAStr, totalBStr, amountU } = row
          const popoverState = usePopupState({
            variant: 'popover',
            popupId: `popup-poolsTable-${rowIdx.toString()}`,
          })
          return (
            <Box className={'textAlignRight'}>
              <Typography
                {...bindHover(popoverState)}
                paddingTop={1}
                component={'span'}
                style={{
                  cursor: 'pointer',
                  textDecoration: 'underline dotted',
                }}
              >
                {typeof amountU === 'undefined' || !Number(amountU)
                  ? EmptyValueTag
                  : PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      sdk.toBig(amountU).times(forexValue),
                      undefined,
                      undefined,
                      2,
                      true,
                      { isFait: true },
                    )}
              </Typography>
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
                }}
              >
                <AmmPairDetail
                  coinA={coinA as any}
                  coinB={coinB as any}
                  balanceA={totalAStr}
                  balanceB={totalBStr}
                />
              </PopoverPure>
            </Box>
          )
        },
      },
      {
        key: 'volume24',
        sortable: true,
        width: 'auto',
        minWidth: 156,
        headerCellClass: 'textAlignRight',
        name: t('label24TradeVolume'),
        formatter: ({ row }) => {
          const { priceU } = row?.tradeFloat ?? {}
          return (
            <Box className={'textAlignRight'}>
              <Typography component={'span'}>
                {priceU
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      sdk.toBig(priceU).times(forexValue),
                      undefined,
                      undefined,
                      2,
                      true,
                      { isFait: true },
                    )
                  : EmptyValueTag}
              </Typography>
            </Box>
          )
        },
      },
      {
        key: 'APR',
        sortable: true,
        name: t('labelAPR'),
        width: 'auto',
        maxWidth: 68,
        headerCellClass: 'textAlignRight',
        formatter: ({ row, rowIdx }) => {
          const APR = typeof row.APR !== undefined && row.APR ? row?.APR : EmptyValueTag
          const popoverState = usePopupState({
            variant: 'popover',
            popupId: `popup-poolsTable-${rowIdx.toString()}`,
          })

          return (
            <Box className={'textAlignRight'}>
              <Typography
                component={'span'}
                style={
                  APR === 0 || typeof APR === 'undefined' || APR == EmptyValueTag
                    ? {}
                    : {
                        cursor: 'pointer',
                        textDecoration: 'underline dotted',
                      }
                }
                {...bindHover(popoverState)}
              >
                {APR === 0 || typeof APR === 'undefined' || APR == EmptyValueTag
                  ? EmptyValueTag
                  : getValuePrecisionThousand(APR, 2, 2, 2, true) + '%'}
              </Typography>
              {!(APR === 0 || typeof APR === 'undefined' || APR == EmptyValueTag) && (
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
                  }}
                >
                  <AmmAPRDetail {...row.APRs} />
                </PopoverPure>
              )}
            </Box>
          )
        },
      },
      {
        key: 'action',
        name: t('labelAction'),
        // maxWidth: 120,
        width: 'auto',
        headerCellClass: `textAlignRight`,
        cellClass: () => `action`,
        formatter: ({ row }) => {
          return (
            <Box className={'action'} marginRight={-1}>
              <Button
                // href={`liquidity/pools/coinPair/${
                //   row?.coinAInfo?.simpleName + "-" + row?.coinBInfo?.simpleName
                // }`}
                // disabled={!allowTrade?.joinAmm?.enable}
                className={'btn'}
                variant={'text'}
                size={'small'}
                onClick={() => {
                  handleDeposit(row as any)
                  // handleWithdraw(row);
                }}
              >
                {t('labelTradePool')}
              </Button>
              <Button
                variant={'text'}
                size={'small'}
                onClick={() => {
                  handleWithdraw(row as any)
                }}
              >
                {t('labelPoolTableRemoveLiquidity')}
              </Button>
            </Box>
          )
        },
      },
    ]
    const columnModeMobile = (): Column<T, any>[] => [
      {
        key: 'pools',
        sortable: true,
        width: 'auto',
        name: t('labelPool'),
        formatter: ({ row }: FormatterProps<T>) => {
          return (
            <Box
              flex={1}
              height={'100%'}
              alignContent={'center'}
              display={'flex'}
              alignItems={'center'}
            >
              <CoinIcons
                type={TokenType.lp}
                tokenIcon={[coinJson[row.coinA], coinJson[row.coinB]]}
              />
              {/*<Typography*/}
              {/*  variant={"inherit"}*/}
              {/*  color={"textPrimary"}*/}
              {/*  display={"flex"}*/}
              {/*  flexDirection={"column"}*/}
              {/*  marginLeft={2}*/}
              {/*  component={"span"}*/}
              {/*  paddingRight={1}*/}
              {/*>*/}
              {/*  <Typography component={"span"} className={"next-coin"}>*/}
              {/*    <Typography*/}
              {/*      variant="inherit"*/}
              {/*      component={"span"}*/}
              {/*      className={"next-coin"}*/}
              {/*    >*/}
              {/*      {row.coinAInfo?.simpleName}*/}
              {/*    </Typography>*/}
              {/*    <Typography variant="inherit" component={"i"}>*/}
              {/*      /*/}
              {/*    </Typography>*/}
              {/*    <Typography*/}
              {/*      variant="inherit"*/}
              {/*      component={"span"}*/}
              {/*      title={"buy"}*/}
              {/*    >*/}
              {/*      {row.coinBInfo?.simpleName}*/}
              {/*    </Typography>*/}
              {/*  </Typography>*/}
              {/*  {campaignTagConfig && (*/}
              {/*    <TagIconList*/}
              {/*      scenario={SCENARIO.AMM}*/}
              {/*      campaignTagConfig={campaignTagConfig}*/}
              {/*      symbol={row.market}*/}
              {/*    />*/}
              {/*  )}*/}
              {/*  {row.isNew && <NewTagIcon />}*/}
              {/*</Typography>*/}
            </Box>
          )
        },
      },
      {
        key: 'liquidity',
        sortable: true,
        headerCellClass: 'textAlignRight',
        name: t('labelLiquidity'),
        formatter: ({ row }) => {
          const { coinA, coinB, totalA, totalB, amountU } = row as any
          return (
            <Box
              className={'textAlignRight'}
              display={'flex'}
              flexDirection={'column'}
              height={'100%'}
              justifyContent={'center'}
            >
              <Typography component={'span'}>
                {typeof amountU === 'undefined' || !Number(amountU)
                  ? EmptyValueTag
                  : PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      sdk.toBig(amountU).times(forexValue),
                      undefined,
                      undefined,
                      2,
                      true,
                      { isFait: true },
                    )}
              </Typography>
              <Typography component={'span'} variant={'body2'} color={'textSecondary'}>
                {getValuePrecisionThousand(totalA, undefined, 2, 2, true, {
                  isAbbreviate: true,
                  abbreviate: 3,
                }) +
                  ' ' +
                  coinA +
                  `  +  ` +
                  getValuePrecisionThousand(totalB, undefined, 2, 2, true, {
                    isAbbreviate: true,
                    abbreviate: 3,
                  }) +
                  ' ' +
                  coinB}
              </Typography>
            </Box>
          )
        },
      },
      {
        key: 'volume24',
        sortable: true,
        width: 'auto',
        headerCellClass: 'textAlignRight',
        name: t('label24VolumeSimple', { ns: 'common' }) + '/' + t('labelAPR'),
        formatter: ({ row }) => {
          const { priceU } = row?.tradeFloat ?? {}
          const APR = typeof row.APR !== undefined && row.APR ? row?.APR : EmptyValueTag

          return (
            <Box
              className={'textAlignRight'}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'center'}
              height={'100%'}
              alignItems={'flex-end'}
            >
              <Box className={'textAlignRight'} display={'inline-flex'}>
                <Typography component={'span'}>
                  {priceU
                    ? PriceTag[CurrencyToTag[currency]] +
                      getValuePrecisionThousand(
                        sdk.toBig(priceU).times(forexValue),
                        undefined,
                        undefined,
                        2,
                        true,
                        { isFait: true },
                      )
                    : EmptyValueTag}
                </Typography>
              </Box>
              <Typography component={'span'} variant={'body2'} color={'textSecondary'}>
                APR:
                {APR === EmptyValueTag || typeof APR === 'undefined'
                  ? EmptyValueTag
                  : getValuePrecisionThousand(APR, 2, 2, 2, true) + '%'}
              </Typography>
            </Box>
          )
        },
      },
      {
        key: 'action',
        name: '',
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          const popoverProps: PopoverWrapProps = {
            type: PopoverType.click,
            popupId: 'testPopup',
            className: 'arrow-none',
            children: <MoreIcon cursor={'pointer'} />,
            popoverContent: <ActionPopContent {...{ row, handleWithdraw, handleDeposit, t }} />,
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'right',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          } as PopoverWrapProps
          return (
            <Grid item marginTop={1}>
              <Popover {...{ ...popoverProps }} />
            </Grid>
          )
        },
      },
    ]
    const defaultArgs: TableProps<any, any> = {
      rawData,
      columnMode: isMobile ? columnModeMobile() : columnMode(),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }) => columnsRaw as Column<T, any>[],
    }

    return (
      <TableStyled flex={1} flexDirection={'column'} display={'flex'} isMobile={isMobile}>
        <Box marginY={3} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <Typography variant={'h1'}>All Products</Typography>
          {showFilter && (
            <Box
              display={'inline-flex'}
              flexDirection={'row'}
              justifyContent={'center'}
              paddingX={3}
              alignItems={'center'}
            >
              <InputSearch
                key={'search'}
                className={'search'}
                aria-label={'search'}
                placeholder={t('labelFilter')}
                value={filterValue}
                onChange={(value: any) => handleFilterChange({ searchValue: value })}
              />
            </Box>
          )}
        </Box>

        <Table
          style={{
            height: (rawData.length + 1) * RowInvestConfig.rowHeight,
            minHeight: '350px',
          }}
          {...{
            ...defaultArgs,
            t,
            i18n,
            tReady,
            ...rest,
            rawData: rawData,
            rowHeight: rowConfig.rowHeight,
            rowHeaderHeight: rowConfig.rowHeaderHeight,
            showloading: showLoading,
            sortMethod,
            sortDefaultKey: 'liquidity',
          }}
        />
      </TableStyled>
    )
  },
)
