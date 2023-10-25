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
  LoopringAPI,
  useAccount,
  useSystem,
  useTokenMap,
  useVaultMap,
  useVaultTicker,
} from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import { useMarket } from '../../QuotePage/useMaket'

export const useVaultMarket = ({
  tableRef,
  rowConfig = RowConfig,
}: {
  tableRef: React.Ref<any>
  rowConfig?: RowConfigType
}) => {
  let history = useHistory()
  const { tokenMap } = useTokenMap()
  const [detail, setShowDetail] = React.useState<{
    isShow: boolean
    isLoading: true
    row?: R
    detail?: { tokenInfo: sdk.DatacenterTokenInfo }
  }>({
    isShow: false,
    isLoading: true,
  })
  const autoRefresh = React.useRef<NodeJS.Timeout | -1>(-1)
  const { status: vaultTickerStatus, vaultTickerMap, updateVaultTickers } = useVaultTicker()
  const handleRowClick = React.useCallback(
    (row: R) => {
      setShowDetail({
        isShow: true,
        isLoading: true,
        row,
        detail: undefined,
      })
      try {
        const [tokneInfoDetail, quoteTokenTrend] = await Promise.all([
          LoopringAPI.exchangeAPI.getTokenInfo({ tokens: tokenMap[row.erc20Symbol].address }),
          LoopringAPI.exchangeAPI.getQuoteTokenInfo({ tokens: tokenMap[row.erc20Symbol].address }),
        ])
        setShowDetail({
          isShow: true,
          isLoading: true,
          row,
          detail: {},
        })
      } catch (e) {}

      const item = await

      // const { coinA, coinB } = row.pair
      // const tradePair = `${coinA}-${coinB}`
      // history && history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
    },
    [history],
  )
  const handleItemClick = React.useCallback(
    (row: R) => {
      history && history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
    },
    [history],
  )
  const marketProps = useMarket({ handleItemClick, handleRowClick, tickerMap: vaultTickerMap })
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
  React.useEffect(() => {
    if (vaultTickerStatus === SagaStatus.UNSET && vaultTickerMap) {
      // const data = getFilteredTickList();
      marketProps.handleTableFilterChange({})
    }
  }, [vaultTickerStatus])

  return { marketProps, detail, setShowDetail }
}
