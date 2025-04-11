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
import { useMarket } from '../../QuotePage/useMaket'
import * as sdk from '@loopring-web/loopring-sdk'
import _ from 'lodash'

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
  const { tokenMap: vaultTokenMap, marketMap: vaultMarketMap } = useVaultMap()

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
              return item?.list?.reverse().map((trend: string[]) => {
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
  const _marketProps = useMarket<R, T>({
    tableRef,
    handleItemClick: handleRowClick,
    handleRowClick,
    tickerMap: vaultTickerMap as any,
    tokenMap: vaultTokenMap,
  })
  const marketProps = {
    ..._marketProps,
    rawData: _marketProps.rawData.filter((item) => {
      if (
        _.values(vaultMarketMap).every(
          (market) =>
            market.baseTokenId !== vaultTokenMap['LVUSDC']?.tokenId &&
            market.quoteTokenId !== vaultTokenMap['LVUSDC']?.tokenId,
        ) &&
        item.symbol === 'LVUSDC'
      ) {
        return false
      }
      return true
    }),
  }
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
