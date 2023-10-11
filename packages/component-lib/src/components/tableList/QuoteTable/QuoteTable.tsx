import styled from '@emotion/styled'
import { Box, Button, IconButton, Typography } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import {
  Account,
  CAMPAIGNTAGCONFIG,
  CurrencyToTag,
  EmptyValueTag,
  FloatTag,
  ForexMap,
  getValuePrecisionThousand,
  PriceTag,
  RowConfig,
  SCENARIO,
  StarHollowIcon,
  StarSolidIcon,
  Ticker,
} from '@loopring-web/common-resources'
import { Column, Table } from '../../basic-lib'
import { TablePaddingX } from '../../styled'
import { useSettings } from '@loopring-web/component-lib/src/stores'
import { useDispatch } from 'react-redux'
import { Currency } from '@loopring-web/loopring-sdk'
import React from 'react'
import { TagIconList } from '../../block'

const TableWrapperStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
`

const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      if (props.ispro === 'pro') {
        return '620px'
      }
      if (props.currentheight && props.currentheight > 350) {
        return props.currentheight + 'px'
      } else {
        return '100%'
      }
    }};

    --template-columns: ${({ ispro, isMobile }: any) =>
      ispro || isMobile ? '35% 44% auto' : '240px 220px 100px auto auto auto 132px'} !important;

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .textAlignRight {
    text-align: right;

    .rdg-header-sort-cell {
      justify-content: flex-end;
    }
  }

  .textAlignCenter {
    text-align: center;
  }
` as any

export type QuoteTableRawDataItem = Ticker & {
  pair: {
    coinA: string
    coinB: string
  }
  floatTag: keyof typeof FloatTag
  coinApriceU: number
  precision?: number
  reward?: number
  rewardToken?: string
  timeUnit?: '24h'
}

export const QuoteTableChangedCell: any = styled.span`
  color: ${({ theme: { colorBase }, upColor, value }: any) => {
    const isUpColorGreen = upColor === 'green'
    return value > 0
      ? isUpColorGreen
        ? colorBase.success
        : colorBase.error
      : value < 0
      ? isUpColorGreen
        ? colorBase.error
        : colorBase.success
      : colorBase.textPrimary
  }};
`

export interface QuoteTableProps {
  rawData: QuoteTableRawDataItem[]
  rowHeight?: number
  campaignTagConfig: CAMPAIGNTAGCONFIG
  headerRowHeight?: number
  onVisibleRowsChange?: (startIndex: number) => void
  onRowClick?: (row: QuoteTableRawDataItem, column: any) => void
  account: Account
  favoriteMarket: string[]
  addFavoriteMarket: (pair: string) => void
  removeFavoriteMarket: (pair: string) => void
  currentheight?: number
  showLoading?: boolean
  isPro?: boolean
  forexMap: ForexMap<Currency>
}

export const QuoteTable = withTranslation('tables')(
  withRouter(
    ({
      t,
      currentheight = 350,
      rowHeight = RowConfig.rowHeight,
      headerRowHeight = RowConfig.rowHeaderHeight,
      onVisibleRowsChange,
      campaignTagConfig,
      rawData,
      history,
      onRowClick,
      favoriteMarket,
      addFavoriteMarket,
      removeFavoriteMarket,
      showLoading,
      account,
      forexMap,
      isPro = false,
      ...rest
    }: QuoteTableProps & WithTranslation & RouteComponentProps) => {
      let userSettings = useSettings()
      const upColor = userSettings?.upColor
      const { currency, isMobile } = userSettings
      const handleStartClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        isFavourite: boolean,
        pair: string,
      ): void => {
        event.stopPropagation()
        if (isFavourite) {
          dispatch(removeFavoriteMarket(pair))
        } else {
          dispatch(addFavoriteMarket(pair))
        }
      }
      const getColumnMode = React.useCallback((): Column<QuoteTableRawDataItem, unknown>[] => {
        const basicRender = [
          {
            key: 'pair',
            name: t('labelQuotaPair'),
            sortable: true,
            formatter: ({ row }: any) => {
              const { coinA, coinB } = row['pair']
              const pair = `${coinA}-${coinB}`
              const isFavourite = favoriteMarket?.includes(pair)
              return (
                <Box
                  className='rdg-cell-value'
                  display={'flex'}
                  alignItems={'center'}
                  height={'100%'}
                >
                  <Typography marginRight={1} marginLeft={-2}>
                    <IconButton
                      style={{ color: 'var(--color-star)' }}
                      size={'large'}
                      onClick={(e: any) => handleStartClick(e, isFavourite, pair)}
                    >
                      {isFavourite ? (
                        <StarSolidIcon cursor={'pointer'} />
                      ) : (
                        <StarHollowIcon cursor={'pointer'} />
                      )}
                    </IconButton>
                  </Typography>
                  <Typography component={'span'}>
                    {coinA}
                    <Typography component={'span'} color={'textSecondary'}>
                      /{coinB}
                    </Typography>
                  </Typography>
                  &nbsp;
                  {campaignTagConfig && (
                    <TagIconList
                      campaignTagConfig={campaignTagConfig}
                      symbol={pair}
                      scenario={SCENARIO.MARKET}
                    />
                  )}
                </Box>
              )
            },
          },
          {
            key: 'close',
            name: t('labelQuotaLastPrice'),
            headerCellClass: 'textAlignRight',
            cellClass: 'textAlignRight',
            sortable: true,
            formatter: ({ row }: any) => {
              const value = row.close
              const precision = row['precision'] || 6
              const price = Number.isFinite(value)
                ? getValuePrecisionThousand(value, undefined, undefined, precision, true, {
                    isPrice: true,
                  })
                : EmptyValueTag

              const faitPrice = Number.isFinite(value)
                ? PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    row.coinApriceU * (forexMap[currency] ?? 0),
                    undefined,
                    undefined,
                    2,
                    true,
                    {
                      isFait: true,
                    },
                  )
                : EmptyValueTag
              return (
                <Typography
                  className='rdg-cell-value'
                  display={'inline-flex'}
                  alignItems={'center'}
                  whiteSpace={isMobile ? 'pre-line' : 'pre'}
                  justifyContent={isMobile ? 'flex-end' : 'flex-start'}
                >
                  <Typography component={'span'} variant={'inherit'}>
                    {price}
                  </Typography>
                  <Typography
                    component={'span'}
                    variant={isMobile ? 'body2' : 'body1'}
                    color={'var(--color-text-third)'}
                  >
                    {'/'}
                    {/*{isMobile ? "\n" : "/"}*/}
                    {faitPrice}
                  </Typography>
                </Typography>
              )
            },
          },
          {
            key: 'change',
            name: t(isMobile ? 'labelQuota24hChangeLit' : 'labelQuota24hChange'),
            sortable: true,
            headerCellClass: 'textAlignCenter',
            formatter: ({ row }: any) => {
              const value = row.change
              return (
                <div className='rdg-cell-value textAlignRight'>
                  <QuoteTableChangedCell value={value} upColor={upColor}>
                    {typeof value !== 'undefined'
                      ? (row.floatTag === FloatTag.increase ? '+' : '') +
                        getValuePrecisionThousand(value, 2, 2, 2, true) +
                        '%'
                      : EmptyValueTag}
                  </QuoteTableChangedCell>
                </div>
              )
            },
          },
        ]
        const extraRender = [
          {
            key: 'high',
            name: t('labelQuota24hHigh'),
            headerCellClass: 'textAlignRight',
            formatter: ({ row, column }: any) => {
              const value = row[column.key]
              const precision = row.precision || 6
              const price = Number.isFinite(value)
                ? getValuePrecisionThousand(value, undefined, undefined, precision, true, {
                    isPrice: true,
                  })
                : EmptyValueTag
              return (
                <div className='rdg-cell-value textAlignRight'>
                  <span>{price}</span>
                </div>
              )
            },
          },
          {
            key: 'low',
            name: t('labelQuota24hLow'),
            headerCellClass: 'textAlignRight',
            formatter: ({ row, column }: any) => {
              const value = row[column.key]
              const precision = row.precision || 6
              const price = Number.isFinite(value)
                ? getValuePrecisionThousand(value, undefined, undefined, precision, true, {
                    isPrice: true,
                  })
                : EmptyValueTag
              return (
                <div className='rdg-cell-value textAlignRight'>
                  <span>{price}</span>
                </div>
              )
            },
          },
          {
            key: 'volume',
            name: t('labelQuota24hAmount'),
            headerCellClass: 'textAlignRight',
            // resizable: true,
            sortable: true,
            formatter: ({ row }: any) => {
              const value = row.volume
              const precision = row.volume || 6
              const price =
                value && value !== '0'
                  ? getValuePrecisionThousand(value, precision, undefined, undefined, true, {
                      isTrade: true,
                    })
                  : EmptyValueTag
              return (
                <div className='rdg-cell-value textAlignRight'>
                  <span>{price}</span>
                </div>
              )
            },
          },
          {
            key: 'actions',
            headerCellClass: 'textAlignCenter',
            name: t('labelQuoteAction'),
            formatter: ({ row }: any) => {
              const { coinA, coinB } = row['pair']
              const tradePair = `${coinA}-${coinB}`
              return (
                <div className='rdg-cell-value textAlignCenter'>
                  <Button
                    variant='outlined'
                    onClick={() =>
                      history.push({
                        pathname: `/trade/lite/${tradePair}`,
                      })
                    }
                  >
                    {t('labelTrade')}
                  </Button>
                </div>
              )
            },
          },
        ]
        // const isMobile = [];
        if (isMobile) {
          return [...basicRender]
        }
        if (isPro) {
          return [...basicRender]
        }

        return [...basicRender, ...extraRender]
      }, [
        campaignTagConfig,
        currency,
        favoriteMarket,
        forexMap,
        handleStartClick,
        history,
        isMobile,
        isPro,
        t,
        upColor,
      ])

      const dispatch = useDispatch()

      const defaultArgs: any = {
        rawData: [],
        columnMode: getColumnMode(),
        generateRows: (rawData: any) => rawData,
        onRowClick: onRowClick,
        generateColumns: ({ columnsRaw }: any) =>
          columnsRaw as Column<QuoteTableRawDataItem, unknown>[],
        sortMethod: (sortedRows: QuoteTableRawDataItem[], sortColumn: string) => {
          switch (sortColumn) {
            case 'pair':
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a.pair.coinA
                const valueB = b.pair.coinA
                return valueB.localeCompare(valueA)
              })
              break
            case 'close':
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a['close']
                const valueB = b['close']
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
              break
            case 'change':
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a['change']
                const valueB = b['change']
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
              break
            case 'high':
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a['high']
                const valueB = b['high']
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
              break
            case 'low':
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a['low']
                const valueB = b['low']
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
              break
            case 'volume':
              sortedRows = sortedRows.sort((a, b) => {
                const valueA = a['volume']
                const valueB = b['volume']
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
              break
            default:
              return sortedRows
          }
          return sortedRows
        },
        sortDefaultKey: 'change',
      }

      return (
        <TableWrapperStyled>
          <TableStyled
            isMobile={isMobile}
            currentheight={currentheight}
            ispro={isPro}
            className={'scrollable'}
            {...{
              ...defaultArgs,
              ...rest,
              onVisibleRowsChange,
              rawData,
              rowHeight,
              headerRowHeight,
              showloading: showLoading,
            }}
          />
        </TableWrapperStyled>
      )
    },
  ),
)
