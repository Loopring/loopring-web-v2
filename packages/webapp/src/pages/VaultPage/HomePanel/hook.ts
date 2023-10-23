import React, { useCallback } from 'react'

import { QuoteTableRawDataItem } from '@loopring-web/component-lib'

import {
  RouterPath,
  RowConfig,
  RowConfigType,
  SagaStatus,
  TableFilterParams,
  VAULT_MAKET_REFRESH,
  VaultKey,
} from '@loopring-web/common-resources'
import {
  favoriteVaultMarket as favoriteMarketReducer,
  LAYOUT,
  useAccount,
  useSystem,
  useVaultMap,
  useVaultTicker,
} from '@loopring-web/core'
import { useHistory } from 'react-router-dom'

export const useVaultMarket = ({
  tableRef,
  rowConfig = RowConfig,
}: {
  tableRef: React.Ref<any>
  rowConfig?: RowConfigType
}) => {
  let history = useHistory()

  const { account } = useAccount()
  const { status: vaultTickerStatus, vaultTickerMap, updateVaultTickers } = useVaultTicker()
  // const { marketMap, tokenMap } = useTokenMap()
  const { marketArray, marketMap: vaultMarketMap, tokenMap: valutTokenMap } = useVaultMap()
  const [tableTabValue, setTableTabValue] = React.useState(TableFilterParams.all)
  const [searchValue, setSearchValue] = React.useState<string>('')
  const [filteredData, setFilteredData] = React.useState<any[]>([])
  const [tableHeight, setTableHeight] = React.useState(0)
  const { favoriteMarket, removeMarket, addMarket } = favoriteMarketReducer.useFavoriteMarket()
  const autoRefresh = React.useRef<NodeJS.Timeout | -1>(-1)

  const autoReCalc = React.useCallback(() => {
    updateVaultTickers()
    if (autoRefresh.current !== -1) {
      clearTimeout(autoRefresh.current as NodeJS.Timeout)
    }
    autoRefresh.current = setTimeout(() => {
      autoReCalc()
    }, VAULT_MAKET_REFRESH)
  }, [])
  React.useEffect(() => {
    autoReCalc()
    return () => {
      if (autoRefresh.current !== -1) {
        clearTimeout(autoRefresh.current as NodeJS.Timeout)
      }
    }
  }, [])
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

  React.useEffect(() => {
    if (vaultTickerStatus === SagaStatus.UNSET && vaultTickerMap) {
      // const data = getFilteredTickList();
      handleTableFilterChange({})
    }
  }, [vaultTickerStatus])

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
      setSearchValue((state) => {
        filter = state
        if (rest.hasOwnProperty('keyword')) {
          filter = rest.keyword ?? ''
        }
        return filter
      })
      let data = Object.values(vaultTickerMap)
      if (type === TableFilterParams.favourite) {
        // myLog("tickList", data);
        data = data.filter((o: any) => {
          return favoriteMarket?.includes(o.symbol)
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
      vaultTickerMap,
      tableTabValue,
      favoriteMarket,
      searchValue,
      // swapRankingList,
      // getFilteredTickList,
    ],
  )

  const handleRowClick = useCallback(
    (row: QuoteTableRawDataItem) => {
      const { coinA, coinB } = row.pair
      const tradePair = `${coinA}-${coinB}`
      history && history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
    },
    [history],
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
    removeFavoriteMarket: removeMarket,
    favoriteMarket,
    handleSearchChange,
    addFavoriteMarket: addMarket,
    showLoading: !Object.keys(vaultTickerMap ?? {})?.length,
    // tickList,
    rawData: filteredData,
    currentheight: tableHeight,
    onRowClick: handleRowClick,
    account,
    forexMap,
    rowConfig,
    onItemClick: (item: R) => {
      history.push('./')
    },
  }
}
