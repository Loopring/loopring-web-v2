import React, { useCallback } from 'react'

import { QuoteTableRawDataItem } from '@loopring-web/component-lib'

import { RowConfig, SagaStatus, TableFilterParams } from '@loopring-web/common-resources'
import _ from 'lodash'
import {
  favoriteVaultMarket as favoriteMarketReducer,
  LAYOUT,
  useAccount,
  useSystem,
  useTicker,
  useTokenMap,
  useVaultMap,
} from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import { useQuote } from '../../QuotePage/hook'

export const useVaultMarket = ({ tableRef }: { tableRef: React.Ref<any> }) => {
  const { account } = useAccount()
  const { status: tickerStatus } = useTicker()
  // const { marketMap } = useTokenMap()
  const { marketArray, marketMap } = useVaultMap()

  const [tableTabValue, setTableTabValue] = React.useState(TableFilterParams.all)
  const [searchValue, setSearchValue] = React.useState<string>('')
  const [filteredData, setFilteredData] = React.useState<QuoteTableRawDataItem[]>([])
  const [tableHeight, setTableHeight] = React.useState(0)
  const { favoriteMarket, removeMarket, addMarket } = favoriteMarketReducer.useFavoriteMarket()

  const { tickList } = useQuote()
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
  const resetTableData = React.useCallback(
    (tableData) => {
      setFilteredData(tableData)
      setTableHeight(RowConfig.rowHeaderHeight + tableData.length * RowConfig.rowHeight)
    },
    [setFilteredData, setTableHeight],
  )
  React.useEffect(() => {
    window.addEventListener('scroll', currentScroll)
    return () => {
      window.removeEventListener('scroll', currentScroll)
    }
  }, [currentScroll])
  let history = useHistory()

  // prevent amm risky pair
  const getFilteredTickList = React.useCallback(() => {
    if (tickList && !!tickList.length) {
      return tickList.filter((o: any) => {
        const pair = `${o.pair.coinA}-${o.pair.coinB}`
        // const status = ('00' + marketMap[pair]?.status?.toString(2)).split('')
        // if (status[status.length - 2] === '1') {
        //   return true
        // } else if (
        //   status[status.length - 1] === '1'
        //   // &&
        //   // ammPoolBalances.find((o) => o.poolName === pair)
        // ) {
        //   // return !ammPoolBalances.find((o) => o.poolName === pair).risky
        // }
      })
    }
    return []
  }, [tickList, marketMap])

  React.useEffect(() => {
    if (tickerStatus === SagaStatus.UNSET && tickList.length) {
      // const data = getFilteredTickList();
      handleTableFilterChange({})
    }
  }, [tickerStatus, tickList])

  const handleTableFilterChange = React.useCallback(
    ({
      type = tableTabValue,
      keyword = searchValue,
    }: {
      type?: TableFilterParams
      keyword?: string
    }) => {
      let data = _.cloneDeep(tickList)
      // myLog("tickList", data);
      if (type === TableFilterParams.favourite) {
        data = data.filter((o: any) => {
          const pair = `${o.pair.coinA}-${o.pair.coinB}`
          return favoriteMarket?.includes(pair)
        })
      }
      data = data.filter((o: any) => {
        const formattedKeyword = keyword?.toLocaleLowerCase()
        const coinA = o.pair.coinA.toLowerCase()
        const coinB = o.pair.coinB.toLowerCase()
        if (keyword === '') {
          return true
        }
        return coinA?.includes(formattedKeyword) || coinB?.includes(formattedKeyword)
      })
      if (type === TableFilterParams.all && !keyword) {
        data = getFilteredTickList()
      }
      resetTableData(data)
    },
    [
      tickList,
      tableTabValue,
      resetTableData,
      favoriteMarket,
      // swapRankingList,
      getFilteredTickList,
    ],
  )

  const handleRowClick = useCallback(
    (row: QuoteTableRawDataItem) => {
      const { coinA, coinB } = row.pair
      const tradePair = `${coinA}-${coinB}`
      history &&
        history.push({
          pathname: `/trade/lite/${tradePair}`,
        })
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
      setSearchValue(value)
      handleTableFilterChange({ keyword: value, type: tableTabValue })
    },
    [handleTableFilterChange, tableTabValue],
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
    showLoading: !tickList?.length,
    tickList,
    rawData: filteredData,
    currentheight: tableHeight,
    onRowClick: handleRowClick,
    account,
    forexMap,
  }
}
