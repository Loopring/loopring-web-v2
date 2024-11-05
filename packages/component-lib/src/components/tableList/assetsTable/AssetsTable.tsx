import React from 'react'
import { Box, BoxProps, Modal, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import { Column, Table } from '../../basic-lib'
import { Filter } from './components/Filter'
import { TablePaddingX } from '../../styled'
import {
  CurrencyToTag,
  ForexMap,
  getValuePrecisionThousand,
  HiddenTag,
  MarketType,
  PriceTag,
  RowConfig,
  SPECIAL_TOKEN_NAME_MAP,
  TokenType,
} from '@loopring-web/common-resources'
import { useOpenModals, useSettings } from '../../../stores'
import { CoinIcons } from './components/CoinIcons'
import ActionMemo, { LockedMemo } from './components/ActionMemo'
import * as sdk from '@loopring-web/loopring-sdk'
import { XOR } from '../../../types/lib'
import { LockDetailPanel } from './components/modal'
import _ from 'lodash'

const TableWrap = styled(Box)<BoxProps & { isMobile?: boolean; lan: string; isWebEarn?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    flex: 1;

    ${({ isMobile, isWebEarn }) =>
      isWebEarn
        ? isMobile
          ? `--template-columns: 54% 40% 6% !important;`
          : `--template-columns: 200px 150px auto auto 220px !important;`
        : isMobile
        ? `--template-columns: 54% 40% 6% !important;`
        : `--template-columns: 200px 150px auto auto 184px !important;`}
    .rdg-cell:first-of-type {
      display: flex;
      align-items: center;
      margin-top: ${({ theme }) => theme.unit / 8}px;
      padding-left: ${({ isWebEarn }) => isWebEarn && 0};
    }
    .rdg-cell:last-of-type {
      padding-right: ${({ isWebEarn }) => isWebEarn && 0};
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
` as (props: { isMobile?: boolean; lan: string; isWebEarn?: boolean } & BoxProps) => JSX.Element

export type TradePairItem = {
  first: string
  last: string
}

export type RawDataAssetsItem = {
  token: {
    type: TokenType
    value: string
  }
  amount: string
  available: string
  locked: string
  tradePairList?: TradePairItem[]
  smallBalance: boolean
  tokenValueDollar: number
  precision: number
  hideDepositButton?: boolean
  hideWithdrawButton?: boolean
}

export type AssetsTableProps<R = RawDataAssetsItem> = {
  rawData: R[]
  searchValue?: string
  isInvest?: boolean
  pagination?: {
    pageSize: number
  }
  allowTrade?: any
  tableHeight?: number
  onVisibleRowsChange?: (props: any) => void
  showFilter?: boolean
  onSend: (token: string, isToL1: boolean) => void
  onReceive: (token: string) => void
  isLoading?: boolean
  getMarketArrayListCallback: (token: string) => string[]
  rowConfig?: typeof RowConfig
  disableWithdrawList: string[]
  forexMap: ForexMap<sdk.Currency>
  onTokenLockHold?: (item: R) => void
  tokenLockDetail?:
    | undefined
    | {
        list: any[]
        row: any
      }
  hideAssets?: boolean
  isLeverageETH?: boolean
  isWebEarn?: boolean
} & XOR<
  {
    hideInvestToken: boolean
    hideSmallBalances: boolean
    setHideLpToken: (value: boolean) => void
    setHideSmallBalances: (value: boolean) => void
  },
  {}
>

export const AssetsTable = withTranslation('tables')(
  (props: WithTranslation & AssetsTableProps) => {
    const {
      t,
      isInvest = false,
      rawData,
      allowTrade,
      showFilter,
      onReceive,
      onSend,
      getMarketArrayListCallback,
      disableWithdrawList,
      hideInvestToken,
      hideSmallBalances,
      setHideLpToken,
      isLoading = false,
      setHideSmallBalances,
      forexMap,
      rowConfig = RowConfig,
      hideAssets,
      onTokenLockHold,
      tokenLockDetail,
      searchValue,
      isWebEarn,
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
    const [viewData, setViewData] = React.useState<RawDataAssetsItem[]>([])
    const { language, isMobile, coinJson, currency } = useSettings()
    const [modalState, setModalState] = React.useState(false)
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
        if (isWebEarn) {
          setViewData(
            (rawData && rawData.length > 0 ? rawData : []).filter((o) => {
              return o.amount !== '--'
            }),
          )
          return
        }

        let resultData = rawData && !!rawData.length ? [...rawData] : []
        if (hideSmallBalances) {
          resultData = resultData.filter((o) => !o.smallBalance)
        }
        // if (filter.hideLpToken) {
        if (hideInvestToken) {
          resultData = resultData.filter((o) => o.token.type === TokenType.single)
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
        // resetTableData(resultData)
      },
      [rawData, filter, hideSmallBalances, hideInvestToken, pageSize],
    )

    React.useEffect(() => {
      updateData(page)
    }, [rawData, page])
    React.useEffect(() => {
      updateData(1)
      return () => {
        handleScroll.cancel()
      }
    }, [filter, hideInvestToken, hideSmallBalances])
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

    const getColumnModeAssets = (
      t: TFunction,
      allowTrade?: any,
    ): Column<RawDataAssetsItem, unknown>[] => [
      {
        key: 'token',
        name: t('labelToken'),
        formatter: ({ row, column }) => {
          const token = row[column.key]
          let tokenIcon: [any, any] = [undefined, undefined]
          const [head, middle, tail] = token.value.split('-')
          if (token.type === 'lp' && middle && tail) {
            tokenIcon =
              coinJson[middle] && coinJson[tail]
                ? [coinJson[middle], coinJson[tail]]
                : [undefined, undefined]
          }
          if (token.type !== 'lp' && head && head !== 'lp') {
            tokenIcon = coinJson[head] ? [coinJson[head], undefined] : [undefined, undefined]
          }
          return (
            <>
              {isWebEarn ? (
                <Box
                  sx={{
                    height: 36,
                    width: 36,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 1,
                  }}
                >
                  <CoinIcons size={'large'} type={token.type} tokenIcon={tokenIcon} />
                </Box>
              ) : (
                <CoinIcons type={token.type} tokenIcon={tokenIcon} />
              )}

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
                  {SPECIAL_TOKEN_NAME_MAP.get(token.value) || token.value}
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
          const value = row['amount']
          const precision = row['precision']
          return (
            <Box className={'textAlignRight'}>
              {hideAssets
                ? HiddenTag
                : getValuePrecisionThousand(value, precision, precision, undefined, false, {
                    floor: true,
                  })}
            </Box>
          )
        },
      },
      {
        key: 'locked',
        name: t('labelLocked'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <LockedMemo
              {...{
                ...row,
                hideAssets,
                onTokenLockHold: (row: any) => {
                  if (row) {
                    setModalState(true)
                    onTokenLockHold && onTokenLockHold(row)
                  }
                },
                tokenLockDetail,
              }}
            />
          )
        },
      },
      {
        key: 'value',
        name: t('labelAssetsTableValue'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <Box className={'textAlignRight'}>
              {hideAssets
                ? HiddenTag
                : PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    (row?.tokenValueDollar || 0) * (forexMap[currency] ?? 0),
                    undefined,
                    undefined,
                    undefined,
                    true,
                    { isFait: true, floor: true },
                  )}
            </Box>
          )
        },
      },
      {
        key: 'actions',
        name: t('labelActions'),
        headerCellClass: 'textAlignRight',
        // minWidth: 280,
        formatter: ({ row }) => {
          const token = row['token']
          const isLp = token.type === TokenType.lp
          const tokenValue = token.value
          const isDefi = token.type === TokenType.defi || tokenValue === 'CIETH'
          const isToL1 = token.type !== TokenType.lp
          const lpPairList = tokenValue.split('-')
          lpPairList.splice(0, 1)
          const lpPair = lpPairList.join('-')
          const renderMarket: MarketType = (isLp ? lpPair : tokenValue) as MarketType
          return (
            <Box marginTop={isWebEarn ? '7px' : 0}>
              <ActionMemo
                isInvest={isInvest}
                tokenValue={tokenValue}
                getMarketArrayListCallback={getMarketArrayListCallback}
                disableWithdrawList={disableWithdrawList}
                isLp={isLp}
                isDefi={isDefi}
                isToL1={isToL1}
                allowTrade={allowTrade}
                market={renderMarket}
                onReceive={onReceive}
                onSend={onSend}
                isLeverageETH={false}
                isWebEarn={isWebEarn}
                hideDepositButton={row.hideDepositButton}
                hideWithdrawButton={row.hideWithdrawButton}
              />
            </Box>
          )
        },
      },
    ]
    const getColumnMobileAssets = (
      t: TFunction,
      allowTrade?: any,
    ): Column<RawDataAssetsItem, unknown>[] => [
      {
        key: 'token',
        name: t('labelToken'),
        formatter: ({ row, column }) => {
          const token = row[column.key]
          const value = row['amount']
          const precision = row['precision']
          let tokenIcon: [any, any] = [undefined, undefined]
          const [head, middle, tail] = token.value.split('-')
          if (token.type === 'lp' && middle && tail) {
            tokenIcon =
              coinJson[middle] && coinJson[tail]
                ? [coinJson[middle], coinJson[tail]]
                : [undefined, undefined]
          }
          if (token.type !== 'lp' && head && head !== 'lp') {
            tokenIcon = coinJson[head] ? [coinJson[head], undefined] : [undefined, undefined]
          }
          return (
            <>
              <Typography width={'56px'} display={'flex'}>
                <CoinIcons type={token.type} tokenIcon={tokenIcon} />
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
                    : getValuePrecisionThousand(value, precision, precision, undefined, false, {
                        floor: true,
                      })}
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
        key: 'locked',
        name: t('labelLocked'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          return (
            <LockedMemo
              {...{
                ...row,
                HiddenTag,
                onTokenLockHold: (row: any) => {
                  if (row) {
                    setModalState(true)
                    onTokenLockHold && onTokenLockHold(row)
                  }
                },
                tokenLockDetail,
              }}
            />
          )
        },
      },
      {
        key: 'actions',
        name: '',
        headerCellClass: 'textAlignRight',
        // minWidth: 280,
        formatter: ({ row }) => {
          const token = row['token']
          const isLp = token.type === TokenType.lp
          const tokenValue = token.value
          const isDefi = token.type === TokenType.defi || tokenValue === 'CIETH'
          const lpPairList = tokenValue.split('-')
          lpPairList.splice(0, 1)
          const lpPair = lpPairList.join('-')
          const renderMarket: MarketType = (isLp ? lpPair : tokenValue) as MarketType
          return (
            <ActionMemo
              {...{
                tokenValue,
                getMarketArrayListCallback,
                disableWithdrawList,
                isLp,
                isDefi,
                isInvest,
                allowTrade,
                market: renderMarket,
                onReceive,
                onSend,
                isLeverageETH: false,
                isWebEarn: isWebEarn,
              }}
            />
          )
        },
      },
    ]

    return (
      <TableWrap lan={language} isMobile={isMobile} isWebEarn={isWebEarn}>
        {!isWebEarn && showFilter && (
          <Box marginX={2}>
            <Filter
              {...{
                handleFilterChange,
                filter,
                hideInvestToken,
                hideSmallBalances,
                setHideLpToken,
                setHideSmallBalances,
              }}
            />
          </Box>
        )}
        <Modal open={modalState} onClose={() => setModalState(false)}>
          <>
            <LockDetailPanel tokenLockDetail={tokenLockDetail} />
          </>
        </Modal>
        <Table
          ref={gridRef}
          className={isInvest ? 'investAsset' : ''}
          {...{ ...rest, t }}
          style={{
            height:
              viewData.length > 0
                ? rowConfig.rowHeaderHeight + viewData.length * rowConfig.rowHeight
                : 350,
          }}
          rowHeight={rowConfig.rowHeight}
          headerRowHeight={rowConfig.rowHeaderHeight}
          rawData={viewData}
          generateRows={(rowData: any) => rowData}
          generateColumns={({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[]}
          showloading={isLoading}
          // onScroll={handleScroll}
          columnMode={
            (isMobile
              ? getColumnMobileAssets(t, allowTrade)
              : getColumnModeAssets(t, allowTrade)) as any
          }
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
