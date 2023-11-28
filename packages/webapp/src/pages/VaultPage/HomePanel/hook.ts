import React from 'react'

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
import { LoopringAPI, useTokenMap, useVaultMap, useVaultTicker } from '@loopring-web/core'
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
  const { tokenMap: vaultTokenMap } = useVaultMap()

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
              // return [
              //   {
              //     timeOpen: 1698393600000,
              //     timeClose: 1698397199999,
              //     timeHigh: 1698396600000,
              //     timeLow: 1698393660000,
              //     high: '1787.92',
              //     low: '1777.13',
              //     open: '1777.37',
              //     close: '1787.53',
              //     volume: '9064709262.74',
              //     marketCap: '214963196882.89',
              //   },
              //   {
              //     timeOpen: 1698390000000,
              //     timeClose: 1698393599999,
              //     timeHigh: 1698390000000,
              //     timeLow: 1698393540000,
              //     high: '1795.71',
              //     low: '1777.64',
              //     open: '1795.71',
              //     close: '1777.64',
              //     volume: '9759538096.18',
              //     marketCap: '213774452745.68',
              //   },
              //   {
              //     timeOpen: 1698386400000,
              //     timeClose: 1698389999999,
              //     timeHigh: 1698387240000,
              //     timeLow: 1698389100000,
              //     high: '1795.97',
              //     low: '1791.35',
              //     open: '1794.24',
              //     close: '1795.81',
              //     volume: '10627914493.28',
              //     marketCap: '215958912797.93',
              //   },
              //   {
              //     timeOpen: 1698382800000,
              //     timeClose: 1698386399999,
              //     timeHigh: 1698382800000,
              //     timeLow: 1698384300000,
              //     high: '1795.48',
              //     low: '1787.79',
              //     open: '1795.48',
              //     close: '1793.74',
              //     volume: '10848515073.19',
              //     marketCap: '215710223207.36',
              //   },
              //   {
              //     timeOpen: 1698379200000,
              //     timeClose: 1698382799999,
              //     timeHigh: 1698382320000,
              //     timeLow: 1698381420000,
              //     high: '1796.25',
              //     low: '1785.06',
              //     open: '1791.23',
              //     close: '1795.06',
              //     volume: '10872815373.06',
              //     marketCap: '215869713343.08',
              //   },
              //   {
              //     timeOpen: 1698375600000,
              //     timeClose: 1698379199999,
              //     timeHigh: 1698377640000,
              //     timeLow: 1698376080000,
              //     high: '1792.48',
              //     low: '1786.24',
              //     open: '1790.24',
              //     close: '1790.99',
              //     volume: '10979688186.97',
              //     marketCap: '215380247045.86',
              //   },
              //   {
              //     timeOpen: 1698372000000,
              //     timeClose: 1698375599999,
              //     timeHigh: 1698373980000,
              //     timeLow: 1698372240000,
              //     high: '1794.86',
              //     low: '1775.31',
              //     open: '1777.79',
              //     close: '1790.17',
              //     volume: '11178046079.35',
              //     marketCap: '215281343729.6',
              //   },
              //   {
              //     timeOpen: 1698368400000,
              //     timeClose: 1698371999999,
              //     timeHigh: 1698368460000,
              //     timeLow: 1698371760000,
              //     high: '1797.29',
              //     low: '1778.84',
              //     open: '1796.74',
              //     close: '1778.94',
              //     volume: '11081322852.7',
              //     marketCap: '213935042365.29',
              //   },
              //   {
              //     timeOpen: 1698364800000,
              //     timeClose: 1698368399999,
              //     timeHigh: 1698364980000,
              //     timeLow: 1698368040000,
              //     high: '1804.14',
              //     low: '1793.28',
              //     open: '1803.79',
              //     close: '1797.22',
              //     volume: '11117052944.74',
              //     marketCap: '216133306808.87',
              //   },
              //   {
              //     timeOpen: 1698357600000,
              //     timeClose: 1698361199999,
              //     timeHigh: 1698361140000,
              //     timeLow: 1698357600000,
              //     high: '1808.69',
              //     low: '1800.16',
              //     open: '1800.16',
              //     close: '1808.69',
              //     volume: '11288981149.35',
              //     marketCap: '217513229997.93',
              //   },
              //   {
              //     timeOpen: 1698354000000,
              //     timeClose: 1698357599999,
              //     timeHigh: 1698356340000,
              //     timeLow: 1698355020000,
              //     high: '1801.82',
              //     low: '1795.74',
              //     open: '1798.88',
              //     close: '1800.26',
              //     volume: '11284207791.5',
              //     marketCap: '216499083533.49',
              //   },
              //   {
              //     timeOpen: 1698350400000,
              //     timeClose: 1698353999999,
              //     timeHigh: 1698353820000,
              //     timeLow: 1698350520000,
              //     high: '1800.52',
              //     low: '1791.85',
              //     open: '1792.85',
              //     close: '1799.95',
              //     volume: '11272737340.05',
              //     marketCap: '216462180931.47',
              //   },
              //   {
              //     timeOpen: 1698346800000,
              //     timeClose: 1698350399999,
              //     timeHigh: 1698349740000,
              //     timeLow: 1698346980000,
              //     high: '1793.27',
              //     low: '1782.86',
              //     open: '1783.66',
              //     close: '1792.58',
              //     volume: '11217252765.8',
              //     marketCap: '215575818345.13',
              //   },
              //   {
              //     timeOpen: 1698343200000,
              //     timeClose: 1698346799999,
              //     timeHigh: 1698345300000,
              //     timeLow: 1698346500000,
              //     high: '1788.35',
              //     low: '1783.56',
              //     open: '1784.12',
              //     close: '1783.56',
              //     volume: '11161764464.74',
              //     marketCap: '214491473387.42',
              //   },
              //   {
              //     timeOpen: 1698339600000,
              //     timeClose: 1698343199999,
              //     timeHigh: 1698343140000,
              //     timeLow: 1698339600000,
              //     high: '1784.65',
              //     low: '1764.01',
              //     open: '1764.01',
              //     close: '1784.65',
              //     volume: '11303985573.92',
              //     marketCap: '214621828169.76',
              //   },
              //   {
              //     timeOpen: 1698336000000,
              //     timeClose: 1698339599999,
              //     timeHigh: 1698336180000,
              //     timeLow: 1698339300000,
              //     high: '1780.04',
              //     low: '1764.81',
              //     open: '1778.26',
              //     close: '1766.12',
              //     volume: '11286976883.36',
              //     marketCap: '212394177270.61',
              //   },
              //   {
              //     timeOpen: 1698332400000,
              //     timeClose: 1698335999999,
              //     timeHigh: 1698332520000,
              //     timeLow: 1698335040000,
              //     high: '1791.74',
              //     low: '1768.68',
              //     open: '1789.22',
              //     close: '1778.52',
              //     volume: '11429211501.08',
              //     marketCap: '213884962084.47',
              //   },
              //   {
              //     timeOpen: 1698325200000,
              //     timeClose: 1698328799999,
              //     timeHigh: 1698325440000,
              //     timeLow: 1698328680000,
              //     high: '1824.55',
              //     low: '1808.29',
              //     open: '1822.56',
              //     close: '1808.91',
              //     volume: '11230962789.62',
              //     marketCap: '217539242786.01',
              //   },
              //   {
              //     timeOpen: 1698321600000,
              //     timeClose: 1698325199999,
              //     timeHigh: 1698324960000,
              //     timeLow: 1698321600000,
              //     high: '1824.04',
              //     low: '1812.55',
              //     open: '1812.55',
              //     close: '1823.58',
              //     volume: '11452165298.9',
              //     marketCap: '219304013549',
              //   },
              //   {
              //     timeOpen: 1698318000000,
              //     timeClose: 1698321599999,
              //     timeHigh: 1698318540000,
              //     timeLow: 1698321000000,
              //     high: '1833.59',
              //     low: '1805.68',
              //     open: '1831.02',
              //     close: '1811.93',
              //     volume: '11341688254.49',
              //     marketCap: '217903143469.27',
              //   },
              // ].map((item) => ({ ...item, timeStamp: item.timeClose }))
              return item.list.map((item) => ({ ...item, timeStamp: item.timeClose }))
            }),
          ],
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
  const marketProps = useMarket({
    handleItemClick: (row) => {
      handleRowClick(0, row)
    },
    handleRowClick,
    tickerMap: vaultTickerMap,
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
