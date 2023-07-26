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
  TokenType,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { CoinIcons } from './components/CoinIcons'
import ActionMemo, { LockedMemo } from './components/ActionMemo'
import * as sdk from '@loopring-web/loopring-sdk'
import { XOR } from '../../../types/lib'
import { LockDetailPanel } from './components/modal'

const TableWrap = styled(Box)<BoxProps & { isMobile?: boolean; lan: string }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    flex: 1;

    ${({ isMobile, lan }) =>
      !isMobile
        ? `--template-columns: 200px 150px auto auto ${
            lan === 'en_US' ? '184px' : '184px'
          } !important;`
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

interface Row {
  token: {
    type: TokenType
    value: string
  }
  amount: string
  available: string
  locked: string
  filterColumn?: string
  tradePairList?: {
    first: string
    last: string
  }[]
  cellExpend?: {
    value: string
    children: []
    isExpanded: boolean
  }
  children?: Row[]
  isExpanded?: boolean
  format?: any
}

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
}

export type AssetsTableProps<R = RawDataAssetsItem> = {
  rawData: R[]
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
      isLeverageETH,
      ...rest
    } = props

    const [filter, setFilter] = React.useState({
      searchValue: '',
    })
    const [totalData, setTotalData] = React.useState<RawDataAssetsItem[]>(rawData)
    const [viewData, setViewData] = React.useState<RawDataAssetsItem[]>(rawData)
    const [tableHeight, setTableHeight] = React.useState(props.tableHeight)
    const { language, isMobile, coinJson, currency } = useSettings()
    const [modalState, setModalState] = React.useState(false)
    const resetTableData = React.useCallback(
      (viewData) => {
        setViewData(viewData)
        setTableHeight(rowConfig.rowHeaderHeight + viewData.length * rowConfig.rowHeight)
      },
      [setViewData, setTableHeight, rowConfig],
    )
    const updateData = React.useCallback(() => {
      let resultData = totalData && !!totalData.length ? totalData : []
      // if (filter.hideSmallBalance) {
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
      resetTableData(resultData)
    }, [totalData, filter, hideSmallBalances, hideInvestToken, resetTableData])

    React.useEffect(() => {
      setTotalData(rawData)
    }, [rawData])
    React.useEffect(() => {
      updateData()
    }, [totalData, filter, hideInvestToken, hideSmallBalances])

    const handleFilterChange = React.useCallback(
      (filter) => {
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
              <CoinIcons type={token.type} tokenIcon={tokenIcon} />
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
                  {token.value}
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
          const isDefi = token.type === TokenType.defi
          // const isDual = token.type === TokenType.dual;
          const tokenValue = token.value

          const isToL1 = token.type !== TokenType.lp

          const lpPairList = tokenValue.split('-')
          lpPairList.splice(0, 1)
          const lpPair = lpPairList.join('-')
          const renderMarket: MarketType = (isLp ? lpPair : tokenValue) as MarketType
          return (
            <ActionMemo
              {...{
                isInvest,
                tokenValue,
                getMarketArrayListCallback,
                disableWithdrawList,
                isLp,
                isDefi,
                isToL1,
                allowTrade,
                market: renderMarket,
                onReceive,
                onSend,
                isLeverageETH,
              }}
            />
          )
        },
      },
    ]
    const getColumnMobileAssets = (t: TFunction, allowTrade?: any): Column<Row, unknown>[] => [
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
          const isDefi = token.type === TokenType.defi
          const tokenValue = token.value
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
                isLeverageETH: isLeverageETH ? true : false,
              }}
            />
          )
        },
      },
    ]

    return (
      <TableWrap lan={language} isMobile={isMobile}>
        {showFilter && (
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
          <LockDetailPanel tokenLockDetail={tokenLockDetail} />
        </Modal>
        <Table
          className={isInvest ? 'investAsset' : ''}
          {...{ ...rest, t }}
          style={{ height: tableHeight }}
          rowHeight={rowConfig.rowHeight}
          headerRowHeight={rowConfig.rowHeaderHeight}
          rawData={viewData}
          generateRows={(rowData: any) => rowData}
          generateColumns={({ columnsRaw }: any) => columnsRaw as Column<any, unknown>[]}
          showloading={isLoading}
          columnMode={
            isMobile ? getColumnMobileAssets(t, allowTrade) : getColumnModeAssets(t, allowTrade)
          }
        />
      </TableWrap>
    )
  },
)
