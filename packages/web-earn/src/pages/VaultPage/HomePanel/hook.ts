import React from 'react'

import {
  myLog,
  RouterPath,
  RowConfig,
  RowConfigType,
  SagaStatus,
  TickerNew,
  VAULT_MARKET_REFRESH,
  VaultKey,
} from '@loopring-web/common-resources'
import { LoopringAPI, useTokenMap, useVaultMap, useVaultTicker } from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import {
  TableFilterParams,
} from '@loopring-web/common-resources'
import { useCallback } from 'react'
import {
  favoriteVaultMarket as favoriteMarketReducer,
  LAYOUT,
  store,
  TokenMap,
  useAccount,
  useSystem,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'

export const useMarket = <
  R extends TickerNew & { cmcTokenId: number; isFavorite: boolean },
  T = sdk.TokenInfo,
>({
  tableRef,
  rowConfig = RowConfig,
  tickerMap,
  handleRowClick,
  handleItemClick,
  tokenMap = store.getState()?.tokenMap?.tokenMap,
}: {
  tickerMap: { [key: string]: R }
  tableRef: React.Ref<any>
  rowConfig?: RowConfigType
  handleRowClick?: (index: number, props: T & R) => void
  handleItemClick?: (index: number, props: T & R) => void
  tokenMap: TokenMap<any>
}) => {
  const { account } = useAccount()
  // const { marketMap, tokenMap } = useTokenMap()
  const [tableTabValue, setTableTabValue] = React.useState(TableFilterParams.all)
  const [searchValue, setSearchValue] = React.useState<string>('')
  const [filteredData, setFilteredData] = React.useState<(sdk.TokenInfo & R)[]>([])
  const [tableHeight, setTableHeight] = React.useState(0)
  const { favoriteMarket, removeMarket, addMarket } = favoriteMarketReducer.useFavoriteVaultMarket()

  // const { tickList } = useQuote()
  const handleCurrentScroll = React.useCallback((currentTarget, tableRef) => {
    if (currentTarget && tableRef.current) {
      const calcHeight = tableRef.current?.offsetTop - LAYOUT.HEADER_HEIGHT - currentTarget.scrollY
      if (calcHeight < 2) {
        tableRef.current.classList.add('fixed')
      } else {
        tableRef.current.classList.remove('fixed')
      }
    }
  }, [])
  const currentScroll = React.useCallback(
    (event) => {
      handleCurrentScroll(event.currentTarget, tableRef)
    },
    [handleCurrentScroll, tableRef],
  )

  const handleTableFilterChange = React.useCallback(
    ({
      type = tableTabValue,
      // keyword,
      ...rest
    }: {
      type?: TableFilterParams
      keyword?: string
    }) => {
      let filter = ''
      const favoriteMarket = store.getState().localStore.favoriteVaultMarket
      setSearchValue((state) => {
        filter = state
        if (rest.hasOwnProperty('keyword')) {
          filter = rest.keyword ?? ''
        }
        return filter
      })
      let data: Array<R & sdk.TokenInfo> = Object.values(tickerMap) ?? []
      data = data
      .filter((item) => {
        const status = (item as any).vaultTokenAmounts?.status as number
        return item.enabled && status & 1
      })
      .map((item) => {
        return {
          ...tokenMap[item.symbol],
          ...item,
          isFavorite: favoriteMarket?.includes(item.symbol),
        }
      })
      if (type === TableFilterParams.favourite) {
        // myLog("tickList", data);
        data = data.filter((item) => {
          return favoriteMarket?.includes(item.symbol)
        })
      }
      if (filter) {
        data = data.filter((o: any) => {
          return new RegExp(filter, 'ig').test(o.symbol)
        })
      }
      setFilteredData(data)
      setTableHeight(
        (rowConfig.rowHeaderHeight ?? RowConfig.rowHeaderHeight) +
          data.length * (rowConfig?.rowHeight ?? RowConfig.rowHeaderHeight),
      )
    },
    [
      tickerMap,
      tableTabValue,

      searchValue,

      // swapRankingList,
      // getFilteredTickList,
    ],
  )

  const handleTabChange = useCallback(
    (_event: any, newValue: TableFilterParams) => {
      // if (tickList?.length) {
      setTableTabValue(newValue)
      handleTableFilterChange({
        keyword: searchValue,
        type: newValue,
      })
      // }
    },
    [handleTableFilterChange, searchValue],
  )

  const handleSearchChange = React.useCallback(
    (value) => {
      handleTableFilterChange({ keyword: value, type: tableTabValue })
    },
    [tableTabValue],
  )
  const { forexMap } = useSystem()

  return {
    campaignTagConfig: {} as any,
    tableTabValue,
    handleTabChange,
    searchValue,
    handleStartClick: (symbol: string, rowIdx) => {
      if (favoriteMarket.includes(symbol)) {
        removeMarket(symbol)
      } else {
        addMarket(symbol)
      }
      handleTableFilterChange({})
    },
    favoriteMarket,
    handleSearchChange,
    addFavoriteMarket: addMarket,
    showLoading: !Object.keys(tickerMap ?? {})?.length,
    // tickList,
    rawData: filteredData,
    currentheight: tableHeight,
    onRowClick: handleRowClick,
    account,
    forexMap,
    rowConfig,
    handleTableFilterChange,
    onItemClick: handleItemClick,
  }
}

export const useVaultMarket = <
  R extends TickerNew & { cmcTokenId: number; isFavorite: boolean },
  T = sdk.TokenInfo,
>({
  tableRef,
  rowConfig = RowConfig,
}: {
  tableRef: React.Ref<any>
  rowConfig?: RowConfigType
}) => {
  let history = useHistory()
  const { tokenMap } = useTokenMap()
  const { tokenMap: vaultTokenMap } = useVaultMap()

  const [detail, setShowDetail] = React.useState<{
    isShow: boolean
    isLoading?: boolean
    row?: R
    detail?: { tokenInfo: Partial<sdk.DatacenterTokenInfo & sdk.TokenInfo>; trends: any }
  }>({
    isShow: false,
    isLoading: true,
  })
  const autoRefresh = React.useRef<NodeJS.Timeout | -1>(-1)
  const { status: vaultTickerStatus, vaultTickerMap, updateVaultTickers } = useVaultTicker()
  const handleRowClick = React.useCallback(async (_index, row) => {
    setShowDetail({
      isShow: true,
      isLoading: true,
      row,
      detail: {
        tokenInfo: {
          ...tokenMap[row?.erc20Symbol ?? ''],
          ...row,
          name: ''
        },
        trends: undefined,
      },
    })
    try {
      const [
        tokneInfoDetail,
        // quoteTokenTrend,
        ...quoteTokenTrends
      ] = await Promise.all([
        LoopringAPI?.exchangeAPI?.getTokenInfo({
          cmcTokenId: row.cmcTokenId,
          // cmcTokenId
          // token: tokenMap[row?.erc20Symbol ?? '']?.address,
          currency: 'USD',
        }),
        // LoopringAPI?.exchangeAPI?.getQuoteTokenInfo({
        //   cmcTokenId: row.cmcTokenId,
        //   currency: 'USD',
        // }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenInfo({
          cmcTokenId: row.cmcTokenId,
          currency: 'USD',
          //@ts-ignore
          range: sdk.DatacenterRange.RANGE_ONE_HOUR,
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenInfo({
          cmcTokenId: row.cmcTokenId,
          currency: 'USD',
          //@ts-ignore
          range: sdk.DatacenterRange.RANGE_ONE_DAY,
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenInfo({
          cmcTokenId: row.cmcTokenId,
          currency: 'USD',
          //@ts-ignore
          range: sdk.DatacenterRange.RANGE_ONE_WEEK,
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenInfo({
          cmcTokenId: row.cmcTokenId,
          currency: 'USD',
          //@ts-ignore
          range: sdk.DatacenterRange.RANGE_ONE_MONTH,
        }),
        // LoopringAPI?.exchangeAPI?.getQuoteTokenOhlcv({
        //   token: tokenMap[row?.erc20Symbol ?? ''].address,
        //   currency: 'USD',
        //   //@ts-ignore
        //   range: sdk.OHLCVDatacenterRange.OHLCV_RANGE_ONE_YEAR,
        // }),
      ])
      if (
        (tokneInfoDetail as sdk.RESULT_INFO).code ||
        (tokneInfoDetail as sdk.RESULT_INFO).message
        // ||
        // (quoteTokenTrend as sdk.RESULT_INFO).code ||
        // (quoteTokenTrend as sdk.RESULT_INFO).message
      ) {
        // throw tokneInfoDetail
      }
      setShowDetail({
        isShow: true,
        isLoading: false,
        row,
        detail: {
          tokenInfo: {
            ...tokenMap[row?.erc20Symbol ?? ''],
            ...(tokneInfoDetail && tokneInfoDetail.list && tokneInfoDetail.list[0]),
            ...row,
            name: tokneInfoDetail && tokneInfoDetail.list && tokneInfoDetail.list[0].name
            // symbol: row.symbol,
          },
          trends: [
            ...quoteTokenTrends?.map((item) => {
              return item?.list?.map((trend: string[]) => {
                const [
                  timestamp,
                  price,
                  volume24H,
                  volumeChange24H,
                  percentChange1H,
                  percentChange24H,
                  percentChange7D,
                  percentChange30D,
                  marketCap,
                ] = trend
                return {
                  close: Number(price).toFixed(2),
                  timeStamp: Number(timestamp),
                  timestamp,
                  price,
                  volume24H,
                  volumeChange24H,
                  percentChange1H,
                  percentChange24H,
                  percentChange7D,
                  percentChange30D,
                  marketCap,
                }
              })
            }),
          ] as any,
        },
      })
    } catch (e) {
      myLog('handleRowClick', e)
    }
    //
  }, [])
  const handleItemClick = React.useCallback(
    (row: R) => {
      history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
    },
    [history],
  )
  const marketProps = useMarket<R, T>({
    tableRef,
    handleItemClick: handleRowClick,
    handleRowClick,
    tickerMap: vaultTickerMap as any,
    tokenMap: vaultTokenMap,
  })
  const autoReCalc = React.useCallback(() => {
    updateVaultTickers()
    if (autoRefresh.current !== -1) {
      clearTimeout(autoRefresh.current as NodeJS.Timeout)
    }
    autoRefresh.current = setTimeout(() => {
      autoReCalc()
    }, VAULT_MARKET_REFRESH)
  }, [])
  React.useEffect(() => {
    autoReCalc()
    return () => {
      if (autoRefresh.current !== -1) {
        clearTimeout(autoRefresh.current as NodeJS.Timeout)
      }
    }
  }, [])
  React.useEffect(() => {
    if (vaultTickerStatus === SagaStatus.UNSET && vaultTickerMap) {
      // const data = getFilteredTickList();
      marketProps.handleTableFilterChange({})
    }
  }, [vaultTickerStatus])

  return { marketProps, detail, setShowDetail }
}
