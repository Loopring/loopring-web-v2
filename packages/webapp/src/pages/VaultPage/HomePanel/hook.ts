import React from 'react'

import {
  myLog,
  RouterPath,
  RowConfig,
  RowConfigType,
  SagaStatus,
  TickerNew,
  VAULT_MAKET_REFRESH,
  VaultKey,
} from '@loopring-web/common-resources'
import { LoopringAPI, useTokenMap, useVaultMap, useVaultTicker } from '@loopring-web/core'
import { useHistory } from 'react-router-dom'
import { useMarket } from '../../QuotePage/useMaket'
import * as sdk from '@loopring-web/loopring-sdk'

export const useVaultMarket = <R extends TickerNew, T = sdk.TokenInfo>({
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
    isLoading?: true
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
        },
        trends: undefined,
      },
    })
    try {
      const [tokneInfoDetail, quoteTokenTrend, ...quoteTokenTrends] = await Promise.all([
        LoopringAPI?.exchangeAPI?.getTokenInfo({
          token: tokenMap[row?.erc20Symbol ?? '']?.address,
          currency: 'USD',
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenInfo({
          token: tokenMap[row?.erc20Symbol ?? ''].address,
          currency: 'USD',
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenOhlcv({
          token: tokenMap[row?.erc20Symbol ?? ''].address,
          currency: 'USD',
          //@ts-ignore
          range: sdk.OHLCVDatacenterRange.OHLCV_RANGE_ALL,
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenOhlcv({
          token: tokenMap[row?.erc20Symbol ?? ''].address,
          currency: 'USD',
          //@ts-ignore
          range: sdk.OHLCVDatacenterRange.OHLCV_RANGE_ONE_DAY,
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenOhlcv({
          token: tokenMap[row?.erc20Symbol ?? ''].address,
          currency: 'USD',
          //@ts-ignore
          range: sdk.OHLCVDatacenterRange.OHLCV_RANGE_ONE_WEEK,
        }),
        LoopringAPI?.exchangeAPI?.getQuoteTokenOhlcv({
          token: tokenMap[row?.erc20Symbol ?? ''].address,
          currency: 'USD',
          //@ts-ignore
          range: sdk.OHLCVDatacenterRange.OHLCV_RANGE_ONE_MONTH,
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
          trends: [
            ...quoteTokenTrends?.map((item) => {
              return item?.list.map((trend) => ({ ...trend, timeStamp: trend.timeClose }))
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