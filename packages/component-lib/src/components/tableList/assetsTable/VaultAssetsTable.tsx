import React from 'react'
import {Box, BoxProps, Typography} from '@mui/material'
import styled from '@emotion/styled'
import {TFunction, withTranslation, WithTranslation} from 'react-i18next'
import {Column, Table} from '../../basic-lib'
import {Filter} from './components/Filter'
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

const TableWrap = styled(Box)<BoxProps & { isMobile?: boolean; lan: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    flex: 1;
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 200px 150px auto auto !important;`
        : `--template-columns: 54% 40% 6% !important;`}
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
      ...rest
    } = props
    const gridRef = React.useRef(null)
    const prevScrollTop = React.useRef(0)
    // const container = React.useRef<HTMLDivElement>(null)
    const [filter, setFilter] = React.useState({
      searchValue: searchValue ?? '',
    })
    const [pageSize, setPageSize] = React.useState(8)
    const [{ total, hasMore }, setTotal] = React.useState({ total: 0, hasMore: false })
    const [page, setPage] = React.useState(1)
    const [viewData, setViewData] = React.useState<R[]>([])
    const { language, isMobile, coinJson, currency } = useSettings()
    React.useEffect(() => {
      // let height = gridRef?.current?.offsetHeight
      // @ts-ignore
      let height = gridRef?.current?.element?.parentElement?.offsetHeight
      if (height) {
        const size = Math.floor((height - RowConfig.rowHeaderHeight) / RowConfig.rowHeight)
        setPageSize((size >= 8 ? size : 8) * 2)
      } else {
        setPageSize(16)
      }
    }, [gridRef?.current])
    const handleScroll = _.debounce(() => {
      // const currentScrollTop = gridRef?.current?.scrollTop;
      const currentScrollTop = window.scrollY
      if (currentScrollTop > prevScrollTop.current) {
        setPage((prevPage) => prevPage + 1)
      }
    }, 200)
    const updateData = React.useCallback(
      (page) => {
        let resultData = rawData && !!rawData.length ? [...rawData] : []
        // if (filter.hideSmallBalance) {
        
        if (hideSmallBalances) {
          const list = ['ETH', 'LRC', 'USDT']
          resultData = resultData.filter((o) => list.includes(o.erc20Symbol) || !o.smallBalance)
        }
        // if (filter.hideLpToken) {
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
        // resetTableData(resultData)
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
                marginLeft={2}
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
        key: 'amount',
        name: t('labelAmount'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
					const {amount, precision} = row
					return (
						<Box className={'textAlignRight'}>
							{hideAssets
								? HiddenTag
								: (amount && Number(amount) > 0) ? getValuePrecisionThousand(amount, precision, precision, undefined, false, {
									floor: true,
								}) : EmptyValueTag}
						</Box>
					)
				},
			},
			// {
			//   key: 'avaiable',
			//   name: t('labelAvaiable'),
			//   headerCellClass: 'textAlignRight',
			//   formatter: ({ row }) => {
			//     const value = row.available
			//     const precision = row.precision
			//     return (
			//       <Box className={'textAlignRight'}>
			//         {hideAssets
			//           ? HiddenTag
			//           : getValuePrecisionThousand(value, precision, precision, undefined, false, {
			//             floor: true,
			//           })}
			//       </Box>
			//     )
			//   },
			// },

			{
				key: 'value',
				name: t('labelVaultAssetsTableValue'),
				headerCellClass: 'textAlignRight',
				formatter: ({row}) => {
					const {amount, tokenValueDollar} = row
					return (
						<Box className={'textAlignRight'}>
							{hideAssets
								? HiddenTag
								: (amount && Number(amount) > 0) ? PriceTag[CurrencyToTag[currency]] +
									getValuePrecisionThousand(
										(tokenValueDollar || 0) * (forexMap[currency] ?? 0),
										undefined,
										undefined,
										undefined,
										true,
										{isFait: true, floor: true},
									) : EmptyValueTag}
						</Box>
					)
				},
			},
			{
				key: 'actions',
				name: t('labelActions'),
				headerCellClass: 'textAlignRight',
				cellClass: 'textAlignRight',
				// minWidth: 280,
				formatter: actionRow,
			},
		]
		const getColumnMobileAssets = (t: TFunction): Column<R, unknown>[] => [
			{
				key: 'token',
				name: t('labelToken'),
				formatter: ({row}) => {
					const {token, precision, erc20Symbol: symbol, available} = row
					let tokenIcon: [any, any] = [coinJson[symbol], undefined]
					return (
						<>
							<Typography width={'56px'} display={'flex'}>
								<CoinIcons type={row?.token?.type} tokenIcon={tokenIcon}/>
							</Typography>
							<Typography
								variant={'body1'}
								display={'flex'}
								flexDirection={'row'}
								justifyContent={'flex-end'}
								textAlign={'right'}
								flex={1}
							>
								<Typography display={'flex'}>
									{hideAssets
										? HiddenTag
										: (available && Number(available) > 0) ? getValuePrecisionThousand(
											token.value,
											precision,
											precision,
											undefined,
											false,
											{
												floor: true,
											},
										) : EmptyValueTag}
								</Typography>
								<Typography display={'flex'} color={'textSecondary'} marginLeft={1}>
									{hideAssets ? HiddenTag : token.value}
								</Typography>
							</Typography>
						</>
					)
				},
			},
			{
				key: 'actions',
				name: '',
				headerCellClass: 'textAlignRight',
				// minWidth: 280,
				formatter: actionRow,
			},
		]

		return (
      <TableWrap lan={language} isMobile={isMobile}>
        {showFilter && (
          <Box marginX={2} display={'flex'} alignItems={'center'}>
            <Box width={'calc(100% - 130px)'}>
              <Filter
                {...{
                  handleFilterChange,
                  filter,
                  hideSmallBalances,
                  setHideSmallBalances,
                }}
                noHideInvestToken
              />
            </Box>

            <Typography sx={{cursor: 'pointer'}} component={'span'} onClick={onClickDustCollector} width={'140px'} color={'var(--color-text-secondary)'} display={'flex'} alignItems={'center'}>
              <BrushIcon 
                sx={{ fontSize: '24px', color: 'inherit', marginLeft: 1, marginRight: 0.5 }} 
              /> Dust Collector
            </Typography>
          </Box>
        )}
        <Table
          ref={gridRef}
          className={''}
          {...{ ...rest, t }}
          style={{
            height: total > 0 ? rowConfig.rowHeaderHeight + total * rowConfig.rowHeight : 350,
          }}
          onRowClick={onRowClick as any}
          rowHeight={rowConfig.rowHeight}
          headerRowHeight={rowConfig.rowHeaderHeight}
          rawData={viewData}
          generateRows={(rowData: any) => rowData}
          generateColumns={({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[]}
          showloading={isLoading}
          // onScroll={handleScroll}
          columnMode={(isMobile ? getColumnMobileAssets(t) : getColumnModeAssets(t)) as any}
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
      </TableWrap>
    )
	},
)
