import styled from '@emotion/styled'
import { Box, IconButton, Typography } from '@mui/material'
import { withTranslation, WithTranslation } from 'react-i18next'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import {
  Account,
  CAMPAIGNTAGCONFIG,
  CurrencyToTag,
  EmptyValueTag,
  ForexMap,
  getValuePrecisionThousand,
  PriceTag,
  RowConfig,
  RowConfigType,
  SCENARIO,
  StarHollowIcon,
  StarSolidIcon,
  TickerNew,
  TokenType,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { Button, Column, Table } from '../../basic-lib'
import { TablePaddingX } from '../../styled'
import * as sdk from '@loopring-web/loopring-sdk'
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

export interface MarketTableProps<R> {
  rawData: R[]
  rowConfig: RowConfigType
  onItemClick?: (item: R) => void
  onRowClick?: (item: R) => void
  campaignTagConfig: CAMPAIGNTAGCONFIG
  hiddenFav?: boolean
  actionEle?: JSX.Element
  // headerRowHeight?: number
  onVisibleRowsChange?: (startIndex: number) => void
  account: Account
  favoriteMarket: string[]
  handleStartClick: (pair: string, index?: number) => void
  // addFavoriteMarket: (pair: string) => void
  // removeFavoriteMarket: (pair: string) => void
  currentheight?: number
  showLoading?: boolean
  isPro?: boolean
  forexMap: ForexMap<sdk.Currency>
}

export const MarketTable = withTranslation('tables')(
  withRouter(
    <R = TickerNew & { isFavorite?: boolean },>({
      t,
      currentheight = 350,
      rowConfig = RowConfig,
      onVisibleRowsChange,
      campaignTagConfig,
      rawData,
      history,
      onRowClick,
      favoriteMarket,
      handleStartClick,
      hiddenFav = false,
      actionEle = (row) => {
        return (
          <Button
            variant='outlined'
            onClick={() => {
              onItemClick && onItemClick(row)
            }}
          >
            {t('labelDetail')}
          </Button>
        )
      },
      // addFavoriteMarket,
      // removeFavoriteMarket,
      showLoading,
      account,
      forexMap,
      isPro = false,
      onItemClick,
      ...rest
    }: MarketTableProps<R> & WithTranslation & RouteComponentProps) => {
      const { currency, isMobile, coinJson, upColor } = useSettings()
      // const handleStartClick = (
      //   event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      //   isFavourite: boolean,
      //   pair: string,
      // ): void => {
      //   event.stopPropagation()
      //   if (isFavourite) {
      //     dispatch(removeFavoriteMarket(pair))
      //   } else {
      //     dispatch(addFavoriteMarket(pair))
      //   }
      // }
      const priceCall = React.useCallback(
        (price: any) => {
          const priceStr = sdk.toBig(price ?? 0).times(forexMap[currency])
          return getValuePrecisionThousand(priceStr, 5, 4, 2, false, {
            isFait: true,
            floor: true,
          })
        },
        [forexMap, currency],
      )
      const getColumnMode = React.useCallback((): Column<R, unknown>[] => {
        const basicRender = [
          {
            key: 'pair',
            name: t('labelQuotaPair'),
            sortable: true,
            formatter: ({ row, rowIdx }: any) => {
              // const isFavourite = favoriteMarket?.includes(row.symbol)
              const symbol = row?.type === TokenType.vault ? row.erc20Symbol : row.symbol
              let tokenIcon: [any, any] = [coinJson[symbol], undefined]
              return (
                <Box
                  className='rdg-cell-value'
                  display={'flex'}
                  alignItems={'center'}
                  height={'100%'}
                >
                  {!hiddenFav ? (
                    <Typography marginRight={1} marginLeft={-2}>
                      <IconButton
                        style={{ color: 'var(--color-star)' }}
                        size={'large'}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartClick(row.symbol, rowIdx)
                        }}
                      >
                        {row.isFavorite ? (
                          <StarSolidIcon cursor={'pointer'} />
                        ) : (
                          <StarHollowIcon cursor={'pointer'} />
                        )}
                      </IconButton>
                    </Typography>
                  ) : (
                    <></>
                  )}
                  <CoinIcons type={row?.type} tokenIcon={tokenIcon} />
                  <Typography marginLeft={1 / 2} component={'span'}>
                    {symbol}
                  </Typography>
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
              return (
                <Typography
                  className='rdg-cell-value'
                  display={'inline-flex'}
                  alignItems={'center'}
                  whiteSpace={isMobile ? 'pre-line' : 'pre'}
                  justifyContent={isMobile ? 'flex-end' : 'flex-start'}
                >
                  {PriceTag[CurrencyToTag[currency]] + priceCall(row.price)}
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
              const value = row.percentChange24H
              return (
                <div className='rdg-cell-value textAlignRight'>
                  <QuoteTableChangedCell value={value} upColor={upColor}>
                    {typeof value !== 'undefined'
                      ? (sdk.toBig(value).gt(0) ? '+' : '') +
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
            key: 'volume',
            name: t('labelQuota24hAmount'),
            headerCellClass: 'textAlignRight',
            // resizable: true,
            sortable: true,
            formatter: ({ row }: any) => {
              return (
                <div className='rdg-cell-value textAlignRight'>
                  {row.volume24H
                    ? getValuePrecisionThousand(
                        row.volume24H,
                        row.precision,
                        row.precision,
                        row.precision,
                        false,
                        { isAbbreviate: true, abbreviate: 6 },
                      )
                    : EmptyValueTag}
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
              return <>{actionEle(row)}</>
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

      const defaultArgs: any = {
        rawData: [],
        columnMode: getColumnMode(),
        generateRows: (rawData: any) => rawData,
        onRowClick: onRowClick,
        generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<R, unknown>[],
        sortMethod: (sortedRows, sortColumn) => {
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
            onRowClick={onRowClick}
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
