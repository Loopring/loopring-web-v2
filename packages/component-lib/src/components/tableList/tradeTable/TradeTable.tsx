import React from 'react'
import { Box, BoxProps, Link, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { TFunction, Trans, withTranslation, WithTranslation } from 'react-i18next'
import moment from 'moment'
import { Column, Table, TablePagination } from '../../basic-lib'
import { TableFilterStyled, TablePaddingX } from '../../styled'
import { Filter, FilterTradeTypes } from './components/Filter'

import {
  DirectionTag,
  EmptyValueTag,
  Explorer,
  getValuePrecisionThousand,
  globalSetup,
  RowConfig,
  TableType,
} from '@loopring-web/common-resources'
import { useSettings } from '../../../stores'
import { DateRange } from '@mui/lab'
import { Currency, MarketTradeInfo } from '@loopring-web/loopring-sdk'
import { XOR } from '../../../types/lib'
import { useLocation } from 'react-router-dom'
import _ from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'

export enum TradeItemCounterparty {
  orderbook = 'Orderbook',
  pool = 'Pool',
}

export type RawDataTradeItem = {
  // side: keyof typeof TradeTypes;
  role: sdk.OrderMakerType
  amount: {
    from: {
      key: string
      value: number | undefined
    }
    to: {
      key: string
      value: number | undefined
    }
    volume?: number
  }
  counterParty?: TradeItemCounterparty
  price: {
    key: string
    value: number | undefined
  }
  fee: {
    key: string
    value: number | undefined
  }
  time: number
  __raw__: Partial<MarketTradeInfo>
}

export type TradeTableProps = {
  rawData: RawDataTradeItem[]

  // getUserTradeList?: (param: Omit<GetUserTradesRequest, 'accountId'>) => void;
  getUserTradeList?: (param: {
    market?: string
    page: number
    total?: number
    pageSize: number
    // offset: (page - 1) * pageSize,
    // limit: pageSize,
    orderHash?: any
    fillTypes?: any
    fromId?: any
  }) => void
  pagination?: {
    page: number
    pageSize: number
    total: number
  }

  currentheight?: number
  rowHeight?: number
  headerRowHeight?: number
  isL2Trade?: boolean
  marketMap?: any
  showLoading?: boolean
  accAddress?: string
  accountId?: number
} & XOR<{ showFilter: true; filterPairs: string[] }, { showFilter?: false }>

const TableStyled = styled(Box)<
  BoxProps & {
    isMobile?: boolean
    currentheight?: number
    tradeposition: string
  }
>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${(props: any) => props.currentheight}px;

    ${({ isMobile, tradeposition }) =>
      !isMobile
        ? `--template-columns: ${
            tradeposition === 'swap'
              ? '300px 120px auto auto !important;'
              : '100px 340px auto 120px auto auto !important;'
          }`
        : ` --template-columns: 40% 40% 20%  !important;`}

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .rdg-header-row {
      // background-color: inherit !important;
    }

    .textAlignRight {
      text-align: right;
    }
  }

  ${({ theme }) => TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (
  props: {
    isMobile?: boolean
    currentheight?: number
    tradeposition: string
  } & BoxProps,
) => JSX.Element

const getColumnModeAssets = (
  t: TFunction,
  _currency: Currency,
  tokenMap: any,
  isL2Trade: boolean,
): Column<RawDataTradeItem, unknown>[] => {
  if (isL2Trade) {
    return [
      {
        key: 'role',
        name: t('labelTradeRole'),
        formatter: ({ row }) => {
          const value = row['role']
          const renderValue =
            value === sdk.OrderMakerType.maker ? t('labelTradeRoleMaker') : t('labelTradeRoleTaker')
          return <Box className='rdg-cell-value'>{renderValue}</Box>
        },
      },
      {
        key: 'side',
        name: t('labelTradeSide'),
        formatter: ({ row }) => {
          // const tradeType = row[ 'side' ] === TradeTypes.Buy ? t('labelBuy') : t('labelSell')
          const { from, to } = row['amount']
          const precisionFrom = tokenMap ? tokenMap[from.key]?.precision : undefined
          const precisionTo = tokenMap ? tokenMap[to.key]?.precision : undefined
          const fromValue = from.value
            ? getValuePrecisionThousand(from.value, precisionFrom, precisionFrom)
            : EmptyValueTag
          const toValue = to.value
            ? getValuePrecisionThousand(to.value, precisionTo, precisionTo)
            : EmptyValueTag

          return (
            <Box className='rdg-cell-value' height={'100%'} display={'flex'} alignItems={'center'}>
              <Typography>
                {`${fromValue} ${from.key} ${DirectionTag} ${toValue} ${to.key}`}
              </Typography>
            </Box>
          )
        },
      },
      {
        key: 'counterparty',
        name: t('labelTradeConterparty'),
        formatter: ({ row }) => {
          const value = row['counterParty']
          const renderValue =
            value === TradeItemCounterparty.orderbook
              ? t('labelTradeCounterpartyOrderbook')
              : t('labelTradeCounterpartyPool')
          return <Box className='rdg-cell-value'>{renderValue}</Box>
        },
      },
      {
        key: 'price',
        name: t('labelTradePrice'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          const { value } = row['price']
          const precision = row['precision'] || 6
          const renderValue = value
            ? getValuePrecisionThousand(value, undefined, undefined, precision, true, {
                isPrice: true,
              })
            : EmptyValueTag
          return <Box className='rdg-cell-value textAlignRight'>{renderValue}</Box>
        },
      },
      {
        key: 'fee',
        name: t('labelTradeFee'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          const { key, value } = row['fee']
          // myLog({value})
          return <div className='rdg-cell-value textAlignRight'>{`${value} ${key}`}</div>
        },
      },
      {
        key: 'time',
        name: t('labelTradeTime'),
        headerCellClass: 'textAlignRight',
        // minWidth: 400,
        formatter: ({ row }) => {
          const time = moment(new Date(row['time']), 'YYYYMMDDHHMM').fromNow()
          return <div className='rdg-cell-value textAlignRight'>{time}</div>
        },
      },
    ]
  } else {
    return [
      {
        key: 'side',
        name: t('labelTradeSide'),
        formatter: ({ row }) => {
          // const tradeType = row[ 'side' ] === TradeTypes.Buy ? t('labelBuy') : t('labelSell')
          const { from, to } = row['amount']
          const precisionFrom = tokenMap ? tokenMap[from.key]?.precision : undefined
          const precisionTo = tokenMap ? tokenMap[to.key]?.precision : undefined
          const fromValue = from.value
            ? getValuePrecisionThousand(from.value, precisionFrom, precisionFrom)
            : EmptyValueTag
          const toValue = to.value
            ? getValuePrecisionThousand(to.value, precisionTo, precisionTo)
            : EmptyValueTag

          return (
            <Box className='rdg-cell-value' height={'100%'} display={'flex'} alignItems={'center'}>
              <Typography>
                {`${fromValue} ${from.key} ${DirectionTag} ${toValue} ${to.key}`}
              </Typography>
            </Box>
          )
        },
      },
      {
        key: 'price',
        name: t('labelTradePrice'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          const { value } = row['price']
          const precision = row['precision'] || 6
          const renderValue = value
            ? getValuePrecisionThousand(value, undefined, undefined, precision, true, {
                isPrice: true,
              })
            : EmptyValueTag
          return <Box className='rdg-cell-value textAlignRight'>{renderValue}</Box>
        },
      },
      {
        key: 'fee',
        name: t('labelTradeFee'),
        headerCellClass: 'textAlignRight',
        formatter: ({ row }) => {
          const { key, value } = row['fee']
          // myLog({value})
          return <div className='rdg-cell-value textAlignRight'>{`${value} ${key}`}</div>
        },
      },
      {
        key: 'time',
        name: t('labelTradeTime'),
        headerCellClass: 'textAlignRight',
        // minWidth: 400,
        formatter: ({ row }) => {
          const time = moment(new Date(row['time']), 'YYYYMMDDHHMM').fromNow()
          return <div className='rdg-cell-value textAlignRight'>{time}</div>
        },
      },
    ]
  }
}

const getColumnModeMobileAssets = (
  t: TFunction,
  _currency: Currency,
  tokenMap: any,
  isL2Trade: boolean,
): Column<RawDataTradeItem, unknown>[] => {
  return [
    ...(isL2Trade
      ? [
          {
            key: 'role',
            name: t('labelTradeRole') + '/' + t('labelTradeConterparty'),
            // @ts-ignore
            formatter: ({ row }) => {
              const value = row['role']
              const renderValue =
                value === sdk.OrderMakerType.maker
                  ? t('labelTradeRoleMaker')
                  : t('labelTradeRoleTaker')
              const counterParty =
                row.counterParty === TradeItemCounterparty.orderbook
                  ? t('labelTradeCounterpartyOrderbook')
                  : t('labelTradeCounterpartyPool')
              return (
                <Box
                  className='rdg-cell-value'
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'center'}
                  height={'100%'}
                >
                  <Typography>{renderValue}</Typography>
                  <Typography color={'textSecondary'} variant={'body2'}>
                    {counterParty}
                  </Typography>
                </Box>
              )
            },
          },
        ]
      : []),
    {
      key: 'side',
      name: t('labelTradeSide') + '/' + t('labelTradeFee'),
      headerCellClass: 'textAlignRight',
      formatter: ({ row }) => {
        // const tradeType = row[ 'side' ] === TradeTypes.Buy ? t('labelBuy') : t('labelSell')
        const { from, to } = row['amount']
        const precisionFrom = tokenMap ? tokenMap[from.key]?.precision : undefined
        const precisionTo = tokenMap ? tokenMap[to.key]?.precision : undefined
        const fromValue = from.value
          ? getValuePrecisionThousand(from.value, precisionFrom, precisionFrom)
          : EmptyValueTag
        const toValue = to.value
          ? getValuePrecisionThousand(to.value, precisionTo, precisionTo)
          : EmptyValueTag
        const { key, value } = row['fee']

        return (
          <Box
            className='rdg-cell-value'
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'flex-end'}
            textAlign={'right'}
            height={'100%'}
          >
            <Typography variant={'body2'}>
              {`${fromValue} ${from.key} ${DirectionTag} ${toValue} ${to.key}`}
            </Typography>
            <Typography variant={'body2'} color={'textSecondary'}>
              {t('labelFee', { ns: 'common' }) + `: ${value} ${key}`}
            </Typography>
          </Box>
        )
      },
    },
    {
      key: 'price',
      name: t('labelTradePrice') + '/' + t('labelTradeTime'),
      headerCellClass: 'textAlignRight',
      formatter: ({ row }) => {
        const precision = row['precision'] || 6
        const time = moment(new Date(row['time']), 'YYYYMMDDHHMM').fromNow()
        const renderValue = row.price
          ? getValuePrecisionThousand(
              row.price.value,
              undefined,
              undefined,
              precision,
              true,
              // { isPrice: true }
            )
          : EmptyValueTag

        return (
          <Box
            className='rdg-cell-value textAlignRight'
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            height={'100%'}
          >
            <Typography>{renderValue}</Typography>
            <Typography color={''} textOverflow={'ellipsis'} variant={'body2'}>
              {time}
            </Typography>
          </Box>
        )
      },
    },
  ]
}

export const TradeTable = withTranslation('tables')(
  ({
    t,
    pagination,
    showFilter,
    filterPairs = [],
    rawData,
    currentheight,
    rowHeight = RowConfig.rowHeight,
    headerRowHeight = RowConfig.rowHeaderHeight,
    tokenMap = undefined,
    isL2Trade = false,
    getUserTradeList,
    showLoading = false,
    accAddress,
    accountId,
    ...rest
  }: WithTranslation & TradeTableProps & { tokenMap?: any }) => {
    const { search } = useLocation()
    const searchParams = new URLSearchParams(search)
    const [filterType, setFilterType] = React.useState(FilterTradeTypes.allTypes)
    const [filterDate, setFilterDate] = React.useState<DateRange<string | Date>>([null, null])
    const [filterPair, setFilterPair] = React.useState('all')
    // const [page, setPage] = React.useState(1);
    // const [totalData, setTotalData] = React.useState<RawDataTradeItem[]>(rawData)
    const { currency, isMobile } = useSettings()
    const defaultArgs: any = {
      columnMode: isMobile
        ? getColumnModeMobileAssets(t, currency, tokenMap, isL2Trade)
        : getColumnModeAssets(t, currency, tokenMap, isL2Trade),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw as Column<RawDataTradeItem, unknown>[],
      style: {
        backgroundColor: ({ colorBase }: any) => `${colorBase.box}`,
      },
    }

    const pageSize = pagination ? pagination.pageSize : 10

    const updateData = _.debounce(
      ({
        tableType,
        currFilterPair = filterPair,
        currPage = pagination?.page || 1,
        currFilterType = filterType,
      }) => {
        if (tableType === 'filter') {
          currPage = 1
        }
        const market = currFilterPair === 'all' ? '' : currFilterPair.replace(/\s+/g, '')
        if (getUserTradeList) {
          getUserTradeList({
            ...pagination,
            pageSize,
            market,
            page: currPage,
            fillTypes: currFilterType !== 'all' ? currFilterType : '',
          })
        }
      },
      globalSetup.wait,
      //[filterPair, filterType, pageSize, getUserTradeList, pagination]
    )

    const handleFilterChange = React.useCallback(
      ({ type = filterType, date = filterDate, pair = filterPair }) => {
        setFilterType(type)
        setFilterDate(date)
        setFilterPair(pair)
        updateData({
          tableType: TableType.filter,
          currFilterType: type,
          currFilterDate: date,
          currFilterPair: pair,
        })
      },
      [updateData, filterDate, filterType, filterPair],
    )

    const handlePageChange = React.useCallback(
      (page: number) => {
        updateData({ tableType: TableType.page, currPage: page })
      },
      [updateData],
    )

    const handleReset = () => {
      setFilterType(FilterTradeTypes.allTypes)
      setFilterDate([null, null])
      setFilterPair('all')
      updateData({
        tableType: 'filter',
        currFilterType: FilterTradeTypes.allTypes,
        currFilterDate: [null, null],
        currFilterPair: 'all',
        currPage: 1,
      })
    }
    const tradeposition = isL2Trade === true ? 'layer2' : 'swap'
    const [isDropDown, setIsDropDown] = React.useState(true)

    React.useEffect(() => {
      let filters: any = {}
      updateData.cancel()
      if (searchParams.get('market')) {
        filters.pair = searchParams.get('market')
      }
      handleFilterChange(filters)
      return () => {
        updateData.cancel()
      }
    }, [pagination?.pageSize])
    return (
      <TableStyled isMobile={isMobile} currentheight={currentheight} tradeposition={tradeposition}>
        {showFilter &&
          (isMobile && isDropDown ? (
            <Link
              variant={'body1'}
              display={'inline-flex'}
              width={'100%'}
              justifyContent={'flex-end'}
              paddingRight={2}
              onClick={() => setIsDropDown(false)}
            >
              {t('labelShowFilter')}
            </Link>
          ) : (
            <TableFilterStyled>
              <Filter
                {...{
                  filterPairs,
                  handleFilterChange,
                  filterType,
                  filterDate,
                  filterPair,
                  handleReset,
                }}
              />
            </TableFilterStyled>
          ))}
        <Table
          className={'scrollable'}
          {...{
            ...defaultArgs,
            rowHeight,
            headerRowHeight,
            showloading: showLoading,
            ...rest,
            rawData: rawData,
          }}
        />
        {!!accountId && showFilter && (
          <Typography
            display={'flex'}
            justifyContent={'flex-end'}
            textAlign={'right'}
            paddingRight={5 / 2}
            paddingY={1}
          >
            <Trans i18nKey={'labelGoExplore'} ns={'common'}>
              View transactions on
              <Link
                display={'inline-flex'}
                target='_blank'
                rel='noopener noreferrer'
                href={Explorer + `/account/${accountId}`}
                paddingLeft={1 / 2}
              >
                block explorer
              </Link>
            </Trans>
          </Typography>
        )}
        {pagination && (
          <TablePagination
            height={rowHeight}
            page={pagination.page}
            pageSize={pageSize}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        )}
      </TableStyled>
    )
  },
)
