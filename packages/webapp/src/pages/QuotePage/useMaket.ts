import { RowConfig, RowConfigType, TableFilterParams } from '@loopring-web/common-resources'
import React, { useCallback } from 'react'
import {
  favoriteVaultMarket as favoriteMarketReducer,
  LAYOUT,
  LoopringAPI,
  TickerMap,
  useAccount,
  useSystem,
} from '@loopring-web/core'

export const useMarket = <R>({
  tableRef,
  rowConfig = RowConfig,
  tickerMap,
  handleRowClick,
  handleItemClick,
}: {
  tickerMap: TickerMap
  tableRef: React.Ref<any>
  rowConfig?: RowConfigType
  handleRowClick?: (props: R) => void
  handleItemClick?: (props: R) => void
}) => {
  const { account } = useAccount()
  // const { marketMap, tokenMap } = useTokenMap()
  const [tableTabValue, setTableTabValue] = React.useState(TableFilterParams.all)
  const [searchValue, setSearchValue] = React.useState<string>('')
  const [filteredData, setFilteredData] = React.useState<any[]>([])
  const [tableHeight, setTableHeight] = React.useState(0)
  const { favoriteMarket, removeMarket, addMarket } = favoriteMarketReducer.useFavoriteMarket()
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
      setSearchValue((state) => {
        filter = state
        if (rest.hasOwnProperty('keyword')) {
          filter = rest.keyword ?? ''
        }
        return filter
      })
      let data = Object.values(tickerMap)
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
      tickerMap,
      tableTabValue,
      favoriteMarket,
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
    removeFavoriteMarket: removeMarket,
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
    onItemClick: (item: R) => {
      handleItemClick && handleItemClick(item)
    },
  }
}
