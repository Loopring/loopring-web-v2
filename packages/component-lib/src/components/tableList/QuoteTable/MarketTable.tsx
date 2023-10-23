import styled from '@emotion/styled'
import { Box, IconButton, Typography } from '@mui/material'
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
  MarketTableRawDataItem,
  PriceTag,
  RowConfig,
  RowConfigType,
  SCENARIO,
  StarHollowIcon,
  StarSolidIcon,
  TokenType,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { Button, Column, Table } from '../../basic-lib'
import { TablePaddingX } from '../../styled'
import { useDispatch } from 'react-redux'
import { Currency } from '@loopring-web/loopring-sdk'
import React from 'react'
import { TagIconList } from '../../block'
import { QuoteTableChangedCell } from './QuoteTable'
import { CoinIcons } from '../assetsTable'

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
      ispro || isMobile ? '35% 44% auto' : '240px auto 100px auto'} !important;

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

export interface MarketTableProps<R = MarketTableRawDataItem> {
  rawData: R[]
  rowConfig: RowConfigType
  onItemClick: (item: R) => void
  campaignTagConfig: CAMPAIGNTAGCONFIG
  // headerRowHeight?: number
  onVisibleRowsChange?: (startIndex: number) => void
  onRowClick?: (row: R, column: any) => void
  account: Account
  favoriteMarket: string[]
  addFavoriteMarket: (pair: string) => void
  removeFavoriteMarket: (pair: string) => void
  currentheight?: number
  showLoading?: boolean
  isPro?: boolean
  forexMap: ForexMap<Currency>
}

export const MarketTable = withTranslation('tables')(
  withRouter(
    <R = MarketTableRawDataItem,>({
      t,
      currentheight = 350,
      rowConfig = RowConfig,
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
      onItemClick,
      ...rest
    }: MarketTableProps & WithTranslation & RouteComponentProps) => {
      const { currency, isMobile, coinJson, upColor } = useSettings()
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
      const getColumnMode = React.useCallback((): Column<R, unknown>[] => {
        const basicRender = [
          {
            key: 'pair',
            name: t('labelQuotaPair'),
            sortable: true,
            formatter: ({ row }: any) => {
              const isFavourite = favoriteMarket?.includes(row.symbol)
              const symbol = row?.token?.type === TokenType.vault ? row.erc20Symbol : row.symbol
              let tokenIcon: [any, any] = [coinJson[symbol], undefined]
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
                      onClick={(e: any) => handleStartClick(e, isFavourite, row.symbol)}
                    >
                      {isFavourite ? (
                        <StarSolidIcon cursor={'pointer'} />
                      ) : (
                        <StarHollowIcon cursor={'pointer'} />
                      )}
                    </IconButton>
                  </Typography>
                  <CoinIcons type={row?.token?.type} tokenIcon={tokenIcon} />
                  <Typography component={'span'}>{row.symbol}</Typography>
                  &nbsp;
                  {campaignTagConfig && (
                    <TagIconList
                      campaignTagConfig={campaignTagConfig}
                      symbol={row.symbol}
                      scenario={
                        row?.token?.type === TokenType.vault ? SCENARIO.VAULT : SCENARIO.MARKET
                      }
                    />
                  )}
                </Box>
              )
            },
          },
          {
            key: 'price',
            name: t('labelQuotaLastPrice'),
            headerCellClass: 'textAlignRight',
            cellClass: 'textAlignRight',
            sortable: true,
            formatter: ({ row }: any) => {
              const price = Number.isFinite(row.price)
                ? PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    row.price * (forexMap[currency] ?? 0),
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
                  {price}
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
              const value = row.volume24H
              return (
                <div className='rdg-cell-value textAlignRight'>
                  <QuoteTableChangedCell value={value} upColor={upColor}>
                    {typeof value !== 'undefined'
                      ? (row.floatTag === FloatTag.increase ? '+' : '') +
                        getValuePrecisionThousand(row.percentChange24H, 2, 2, 2, true) +
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
            key: 'volume',
            name: t('labelQuota24hAmount'),
            headerCellClass: 'textAlignRight',
            // resizable: true,
            sortable: true,
            formatter: ({ row }: any) => {
              const value = row.percentChange24H
              const precision = row.precision || 6
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
            headerCellClass: 'textAlignRight',
            name: t('labelQuoteAction'),
            cellClass: 'textAlignRight',
            formatter: ({ row }: any) => {
              return (
                <>
                  <Button
                    variant='outlined'
                    onClick={() => {
                      onItemClick(row)
                    }}
                  >
                    {t('labelTrade')}
                  </Button>
                </>
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
        generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<R, unknown>[],
        sortMethod: (sortedRows: R[], sortColumn: string) => {
          switch (sortColumn) {
            case 'pair':
              sortedRows = sortedRows.sort((a, b) => {
                return a.symbol?.localeCompare(b.symbol)
              })
              break
            case 'price':
              sortedRows = sortedRows.sort((a, b) => {
                const [valueA, valueB] = [a.price, b.price]
                if (a.price && b.price) {
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
                const [valueA, valueB] = [a.percentChange24H, b.percentChange24H]
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
                // const valueA = a['volume24H']
                // const valueB = b['volume']
                const [valueA, valueB] = [a.volume24H, b.volume24H]

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
              ...rowConfig,
              showloading: showLoading,
            }}
          />
        </TableWrapperStyled>
      )
    },
  ),
)
