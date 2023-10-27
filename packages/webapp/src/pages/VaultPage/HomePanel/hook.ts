import React, { useCallback } from 'react'

import { QuoteTableRawDataItem } from '@loopring-web/component-lib'

import {
  myLog,
  RouterPath,
  RowConfig,
  RowConfigType,
  SagaStatus,
  TableFilterParams,
  TickerNew,
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
import * as sdk from '@loopring-web/loopring-sdk'

export const useVaultMarket = <R = TickerNew>({
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
    detail?: { tokenInfo: Partial<sdk.DatacenterTokenInfo & sdk.TokenInfo>; tenders: any }
  }>({
    isShow: false,
    isLoading: true,
  })
  const autoRefresh = React.useRef<NodeJS.Timeout | -1>(-1)
  const { status: vaultTickerStatus, vaultTickerMap, updateVaultTickers } = useVaultTicker()
  const handleRowClick = React.useCallback(async (_index, row: R) => {
    setShowDetail({
      isShow: true,
      isLoading: true,
      row,
      detail: {
        tokenInfo: {
          ...tokenMap[row?.erc20Symbol ?? ''],
          ...row,
        },
        tenders: undefined,
      },
    })
    try {
      const [tokneInfoDetail, quoteTokenTrend] = await Promise.all([
        LoopringAPI?.exchangeAPI?.getTokenInfo({
          token: tokenMap[row?.erc20Symbol ?? '']?.address,
          currency: 'USD',
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenInfo({
          token: tokenMap[row?.erc20Symbol ?? ''].address,
          currency: 'USD',
        }),
      ])
      if (
        (tokneInfoDetail as sdk.RESULT_INFO).code ||
        (tokneInfoDetail as sdk.RESULT_INFO).message ||
        (quoteTokenTrend as sdk.RESULT_INFO).code ||
        (quoteTokenTrend as sdk.RESULT_INFO).message
      ) {
        // throw tokneInfoDetail
      }
      setShowDetail({
        isShow: true,
        isLoading: true,
        row,
        detail: {
          tokenInfo: {
            ...tokenMap[row?.erc20Symbol ?? ''],
            ...tokneInfoDetail?.data[0],
            ...row,
            // symbol: row.symbol,
          },
          tenders: quoteTokenTrend?.list?.data,
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
