import React from 'react'
import {Box, BoxProps, Typography} from '@mui/material'
import styled from '@emotion/styled'
import {TFunction, withTranslation, WithTranslation} from 'react-i18next'
import {Column, Table} from '../../basic-lib'
import {Filter, VaultAssetFilter} from './components/Filter'
import {TablePaddingX} from '../../styled'
import {
  BrushIcon,
	CurrencyToTag,
	EmptyValueTag,
	ForexMap,
	getValuePrecisionThousand,
	HiddenTag,
	PriceTag,
	RowConfig,
	TokenType,
} from '@loopring-web/common-resources'
import {useSettings} from '../../../stores'
import {CoinIcons} from './components/CoinIcons'
import * as sdk from '@loopring-web/loopring-sdk'
import {XOR} from '../../../types/lib'
import _ from 'lodash'
import { Button } from '@mui/material'
import Decimal from 'decimal.js'

const BgButton = styled(Button)<{ customBg: string }>`
  background-color: ${({ customBg }) => customBg};
  color: var(--color-text);
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: ${({ customBg }) => customBg};
    opacity: 0.8;
  }
  &:disabled {
    background-color: var(--color-button-disabled);
  }
  
`

const TableWrap = styled(Box)<BoxProps & { isMobile?: boolean; hideActions?: boolean; lan: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    flex: 1;
    ${({ hideActions }) =>
      hideActions
        ? `--template-columns: 230px 180px auto !important;`
        : `--template-columns: 200px 150px auto auto !important;`}
    .rdg-cell:first-of-type {
      display: flex;
      align-items: center;
      margin-top: ${({ theme }) => theme.unit / 8}px;
    }

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .textAlignRight {
      text-align: right;
    }
  }

  .investAsset.rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 200px 150px auto auto 205px !important;`
        : `--template-columns: 54% 40% 6% !important;`}
  }
}

${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean; lan: string } & BoxProps) => JSX.Element

export type TradePairItem = {
  first: string
  last: string
}

export type VaultDataAssetsItem = {
  token: {
    type: TokenType
    value: string
    belongAlice?: string
  }
  amount: string
  available: string
  locked: string
  tradePairList?: TradePairItem[]
  smallBalance: boolean
  tokenValueDollar: number
  erc20Symbol: string
  precision: number
  equity: string
  debt: string
  repayDisabled: boolean
}

export type VaultAssetsTableProps<R> = {
  rawData: R[]
  searchValue?: string
  pagination?: {
    pageSize: number
  }
  onRowClick?: (index: number, row: R) => void
  allowTrade?: any
  tableHeight?: number
  onVisibleRowsChange?: (props: any) => void
  showFilter?: boolean
  isLoading?: boolean
  rowConfig?: typeof RowConfig
  forexMap: ForexMap<sdk.Currency>
  hideAssets?: boolean
  actionRow: (props: { row }) => JSX.Element
  onClickDustCollector: () => void
  hideActions?: boolean
  noMinHeight?: boolean
  hideDustCollector?: boolean
  onRowClickTrade: ({ row }) => void
  onRowClickRepay: ({ row }) => void
} & XOR<
  {
    setHideSmallBalances: (status: any) => void
    hideSmallBalances: boolean
  },
  {}
>

export const VaultAssetsTable = withTranslation('tables')(
  <R extends VaultDataAssetsItem>(props: WithTranslation & VaultAssetsTableProps<R>) => {
    const {
      t,
      rawData,
      allowTrade,
      showFilter,
      onRowClick,
      actionRow,
      hideSmallBalances,
      isLoading = false,
      setHideSmallBalances,
      forexMap,
      rowConfig = RowConfig,
      hideAssets,
      searchValue,
      onClickDustCollector,
      hideActions,
      noMinHeight,
      hideDustCollector,
      onRowClickTrade,
      onRowClickRepay,
      ...rest
    } = props
    const gridRef = React.useRef(null)
    const prevScrollTop = React.useRef(0)

    const [filter, setFilter] = React.useState({
      searchValue: searchValue ?? '',
    })
    const [pageSize, setPageSize] = React.useState(8)
    const [{ total, hasMore }, setTotal] = React.useState({ total: 0, hasMore: false })
    const [page, setPage] = React.useState(1)
    const [viewData, setViewData] = React.useState<R[]>([])
    const { language, isMobile, coinJson, currency } = useSettings()
    React.useEffect(() => {

      // @ts-ignore - gridRef.current.element is accessible at runtime
      let height = gridRef?.current?.element?.parentElement?.offsetHeight
      if (height) {
        const size = Math.floor((height - RowConfig.rowHeaderHeight) / RowConfig.rowHeight)
        setPageSize((size >= 8 ? size : 8) * 2)
      } else {
        setPageSize(16)
      }
    }, [gridRef?.current])
    const handleScroll = _.debounce(() => {

      const currentScrollTop = window.scrollY
      if (currentScrollTop > prevScrollTop.current) {
        setPage((prevPage) => prevPage + 1)
      }
    }, 200)
    const updateData = React.useCallback(
      (page) => {
        let resultData = rawData && !!rawData.length ? [...rawData] : []

        
        if (hideSmallBalances) {
          const list = ['ETH', 'LRC', 'USDT']
          resultData = resultData.filter((o) => list.includes(o.erc20Symbol) || !o.smallBalance)
        }

        if (filter.searchValue) {
          resultData = resultData.filter((o) =>
            o.token.value.toLowerCase().includes(filter.searchValue.toLowerCase()),
          )
        }
        if (pageSize * page >= resultData.length) {
          setTotal({ total: resultData.length, hasMore: false })
        } else {
          setTotal({ total: pageSize * (page + 1 / 2), hasMore: true })
        }
        setViewData(resultData.slice(0, pageSize * page))

      },
			[rawData, hideSmallBalances, pageSize, filter.searchValue, setTotal, setViewData],
    )

    React.useEffect(() => {
      updateData(page)
    }, [rawData, page])
    React.useEffect(() => {
      updateData(1)
      return () => {
        handleScroll.cancel()
      }
    }, [filter, hideSmallBalances])
    React.useEffect(() => {
      window.addEventListener('scroll', handleScroll)
      return () => {
        window.removeEventListener('scroll', handleScroll)
      }
    }, [])

    const handleFilterChange = React.useCallback(
      (filter: any) => {
        setFilter(filter)
      },
      [setFilter],
    )

    const getColumnModeAssets = (t: TFunction): Column<R, unknown>[] => [
      {
        key: 'token',
        name: t('labelToken'),
        formatter: ({ row }) => {
          const symbol = row.erc20Symbol
          let tokenIcon: [any, any] = [coinJson[symbol], undefined]
          return (
            <>
              <CoinIcons type={row?.token?.type} tokenIcon={tokenIcon} />
              <Typography
                variant={'inherit'}
                color={'textPrimary'}
                display={'flex'}
                flexDirection={'column'}
                marginLeft={0.5}
                component={'span'}
                paddingRight={1}
              >
                <Typography component={'span'} className={'next-coin'}>
                  {row.token.belongAlice ?? row.token.vaule}
                </Typography>
              </Typography>
            </>
          )
        },
      },
      {
        key: 'holding',
        name: 'Holding',
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          const { amount, precision } = row
          return (
            <Box className={'textAlignRight'}>
              {hideAssets
                ? HiddenTag
                : amount && Number(amount) > 0
                ? getValuePrecisionThousand(amount, precision, precision, undefined, false, {
                    floor: true,
                  })
                : EmptyValueTag}
            </Box>
          )
        },
      },

      {
        key: 'debt',
        name: 'Debt',
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <Box className={'textAlignRight'}>
              {hideAssets ? HiddenTag : new Decimal(row.debt).isZero() ? EmptyValueTag : row.debt}
            </Box>
          )
        },
      },
      {
        key: 'equity',
        name: 'Equity',
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <Box className={'textAlignRight'}>
              {hideAssets
                ? HiddenTag
                : new Decimal(row.equity).isZero()
                ? EmptyValueTag
                : row.equity}
            </Box>
          )
        },
      },
      ...(!hideActions
        ? [
            {
              key: 'actions',
              name: t('labelActions'),
              headerCellClass: 'textAlignRight',
              cellClass: 'textAlignRight',
              formatter: ({ row }) => {
                return (
                  <Box
                    height={'100%'}
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'flex-end'}
                  >
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRowClickTrade({ row })
                      }}
                    >
                      {t('labelTrade')}
                    </Button>
                    <Button
                      sx={{
                        opacity: row.repayDisabled ? 0.5 : 1,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (row.repayDisabled) return
                        onRowClickRepay({ row })
                      }}
                    >
                      Repay
                    </Button>
                  </Box>
                )
              },
            },
          ]
        : []),
    ]
		const getColumnMobileAssets = (t: TFunction): Column<R, unknown>[] => [

      {
        key: 'token',
        name: t('labelToken'),
        formatter: ({ row }) => {
          const symbol = row.erc20Symbol
          let tokenIcon: [any, any] = [coinJson[symbol], undefined]
          return (
            <>
              <CoinIcons type={row?.token?.type} tokenIcon={tokenIcon} />
              <Typography
                variant={'inherit'}
                color={'textPrimary'}
                display={'flex'}
                flexDirection={'column'}
                marginLeft={0.5}
                component={'span'}
                paddingRight={1}
              >
                <Typography component={'span'} className={'next-coin'}>
                  {row.token.belongAlice ?? row.token.vaule}
                </Typography>
              </Typography>
            </>
          )
        },
      },
      {
        key: 'holding',
        name: 'Holding',
        headerCellClass: 'textAlignLeft',
        formatter: ({ row }) => {
          const { amount, precision } = row
          return (
            <Box className={'textAlignLeft'}>
              {hideAssets
                ? HiddenTag
                : amount && Number(amount) > 0
                ? getValuePrecisionThousand(amount, precision, precision, undefined, false, {
                    floor: true,
                  })
                : EmptyValueTag}
            </Box>
          )
        },
      },
      {
        key: 'actions',
        name: t('labelActions'),
        headerCellClass: 'textAlignRight',

        formatter: ({ row }) => {
          return (
            <Box height={'100%'} display={'flex'} alignItems={'center'} justifyContent={'flex-end'}>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onRowClickTrade({ row })
                }}
                size='small'
              >
                {t('labelTrade')}
              </Button>
              <Button
                sx={{
                  opacity: row.repayDisabled ? 0.5 : 1,
                }}
                size='small'
                onClick={(e) => {
                  e.stopPropagation()
                  if (row.repayDisabled) return
                  onRowClickRepay({ row })
                }}
              >
                Repay
              </Button>
            </Box>
          )
        },
      },
    ]


    const MobileCardView = () => {
      return (
        <Box display="flex" flexDirection="column" width="100%">
          {viewData.map((row, index) => {
            const symbol = row.erc20Symbol;
            let tokenIcon: [any, any] = [coinJson[symbol], undefined];
            return (
              <Box
                key={`asset-card-${index}`}
                sx={{
                  mb: 1.5,
                  p: 2,
                  backgroundColor: 'var(--color-box)',
                }}
              >
                <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
                  <Box display='flex' alignItems='center'>
                    <CoinIcons type={row?.token?.type} tokenIcon={tokenIcon} />
                    <Typography variant='body1' ml={1}>
                      {row.token.belongAlice ?? row.token.value}
                    </Typography>
                  </Box>
                  <Typography variant='h5'>
                    {hideAssets
                      ? HiddenTag
                      : row.amount && Number(row.amount) > 0
                      ? getValuePrecisionThousand(
                          row.amount,
                          row.precision,
                          row.precision,
                          undefined,
                          false,
                          {
                            floor: true,
                          },
                        )
                      : EmptyValueTag}
                  </Typography>
                </Box>

                <Box display='flex' flexDirection='column' mb={2}>
                  <Box mt={3} display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='var(--color-text-secondary)'>
                      Debt
                    </Typography>
                    <Typography variant='body1' color='var(--color-text-secondary)'>
                      {hideAssets
                        ? HiddenTag
                        : new Decimal(row.debt).isZero()
                        ? EmptyValueTag
                        : row.debt}
                    </Typography>
                  </Box>
                  <Box mt={1.5} display='flex' justifyContent='space-between'>
                    <Typography variant='body2' color='var(--color-text-secondary)'>
                      Equity
                    </Typography>
                    <Typography variant='body1' color='var(--color-text-secondary)'>
                      {hideAssets
                        ? HiddenTag
                        : new Decimal(row.equity).isZero()
                        ? EmptyValueTag
                        : row.equity}
                    </Typography>
                  </Box>
                </Box>

                {!hideActions && (
                  <Box display='grid' gridTemplateColumns='1fr 1fr' gap={2}>
                    <BgButton
                      customBg='var(--color-button-outlined)'
                      variant='outlined'
                      fullWidth
                      size='medium'
                      onClick={() => onRowClickTrade({ row })}
                    >
                      {t('labelTrade')}
                    </BgButton>
                    <BgButton
                      customBg='var(--color-button-outlined)'
                      variant='outlined'
                      fullWidth
                      size='medium'
                      sx={{
                        opacity: row.repayDisabled ? 0.5 : 1,
                      }}
                      onClick={() => {
                        if (!row.repayDisabled) {
                          onRowClickRepay({ row })
                        }
                      }}
                    >
                      Repay
                    </BgButton>
                  </Box>
                )}
              </Box>
            )
          })}
        </Box>
      );
    };

    return (
      <TableWrap lan={language} isMobile={isMobile}>
        {showFilter && (
          <Box marginX={2} display={'flex'} alignItems={'center'}>
            <Box>
              <VaultAssetFilter
                handleFilterChange={handleFilterChange}
                filter={filter}
                hideSmallBalances={hideSmallBalances}
                setHideSmallBalances={setHideSmallBalances}
                noHideInvestToken
              />
            </Box>

            {!hideDustCollector && <Box
              sx={{ 
                marginLeft: 3,
              }}
              component={'button'}
              onClick={onClickDustCollector}
              color={'var(--color-text-primary)'}
              display={'flex'}
              alignItems={'center'}
            >
              <BrushIcon
                sx={{ fontSize: '24px', color: 'inherit', marginRight: 0.5 }}
              />{' '}
              {t('labelVaultDustCollector')}
            </Box>}
          </Box>
        )}
        
        {isMobile ? (
          <Box padding={2}>
            <MobileCardView />
          </Box>
        ) : (
          <>
            <Table
              ref={gridRef}
              className={''}
              {...{ ...rest, t }}
              style={{
                height: total > 0 ? rowConfig.rowHeaderHeight + total * rowConfig.rowHeight : 350,
                minHeight: noMinHeight ? 0 : undefined
              }}
              onRowClick={onRowClick as any}
              rowHeight={rowConfig.rowHeight}
              headerRowHeight={rowConfig.rowHeaderHeight}
              rawData={viewData}
              generateRows={(rowData: any) => rowData}
              generateColumns={({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[]}
              showloading={isLoading}
              columnMode={getColumnModeAssets(t) as any}
            />
            {hasMore && (
              <Typography
                variant={'body1'}
                display={'inline-flex'}
                justifyContent={'center'}
                alignItems={'center'}
                color={'var(--color-primary)'}
                textAlign={'center'}
                paddingY={1}
              >
                <img
                  alt={'loading'}
                  className='loading-gif'
                  width='16'
                  src={`./static/loading-1.gif`}
                  style={{ paddingRight: 1, display: 'inline-block' }}
                />
                {t('labelLoadingMore')}
              </Typography>
            )}
          </>
        )}
      </TableWrap>
    )
	},
)
