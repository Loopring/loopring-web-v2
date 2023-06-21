import React from 'react'
import { LoopringAPI, useAccount, useSystem, volumeToCountAsBigNumber } from '@loopring-web/core'
import { BigNumber } from 'bignumber.js'
import {
  NFTTableFilter,
  NFTTableProps,
  NFTTradeFilter,
  NFTTradeProps,
  TxnDetailProps,
  useSettings,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { RowConfig, UNIX_TIMESTAMP_FORMAT } from '@loopring-web/common-resources'

BigNumber.config({ EXPONENTIAL_AT: 100 })
const LimitNFTHistory = 20

export const useHistoryNFT = <
  Row extends TxnDetailProps,
  TradeRow extends sdk.UserNFTTradeHistory,
>() => {
  const { etherscanBaseUrl } = useSystem()
  const { account } = useAccount()
  const { isMobile } = useSettings()
  const [tabIndex, setTabIndex] = React.useState(0)
  const container = React.useRef(null)
  // const [showLoading, setShowLoading] = useState(false);

  const [nftHistory, setNftHistory] = React.useState<{
    userNFTTxs: Partial<NFTTableProps<Row>>
  }>({
    userNFTTxs: {
      etherscanBaseUrl,
      rawData: [],
      pagination: {
        pageSize: LimitNFTHistory,
        total: 0,
      },
      txType: sdk.UserNFTTxTypes[sdk.TxNFTType.ALL],
      showloading: false,
    },
  })

  const [nftTrades, setTrades] = React.useState<{
    nftTrades: NFTTradeProps<TradeRow>
  }>({
    nftTrades: {
      etherscanBaseUrl,
      rawData: [],
      pagination: {
        pageSize: LimitNFTHistory,
        total: 0,
        page: 1,
      },
      showLoading: false,
      // getTxnList: (filter: NFTTradeFilter) => Promise<void>;
      showFilter: true,
      accAddress: account.accAddress,
      accountId: account.accountId,
    } as unknown as NFTTradeProps<TradeRow>,
  })

  const getTxnList = React.useCallback(
    async ({
      page = 1,
      limit,
      txType = sdk.UserNFTTxTypes[sdk.TxNFTType.ALL],
      duration = [null, null],
    }: NFTTableFilter) => {
      if (LoopringAPI.userAPI) {
        const _limit = limit ? limit : nftHistory.userNFTTxs.pagination?.pageSize ?? LimitNFTHistory

        const { totalNum, userNFTTxs } = await LoopringAPI.userAPI.getUserNFTTransactionHistory(
          {
            accountId: account.accountId,
            // @ts-ignore
            metadata: true,
            offset: (page - 1) * _limit,
            types: txType ? ([txType] as any[]) : undefined,
            // start: (page - 1) * limit,
            start:
              duration && duration[0]
                ? (duration[0] as any)?.format(UNIX_TIMESTAMP_FORMAT) ?? undefined
                : undefined,
            end:
              duration && duration[1]
                ? (duration[1] as any)?.format(UNIX_TIMESTAMP_FORMAT) ?? undefined
                : undefined,
            limit: _limit,
          },
          account.apiKey,
        )
        setNftHistory((state) => {
          return {
            ...state,
            userNFTTxs: {
              ...state.userNFTTxs,
              totalNum,
              duration,
              txType,
              // limit,
              page,
              pagination: {
                pageSize: limit ?? nftHistory.userNFTTxs.pagination?.pageSize ?? LimitNFTHistory,
                total: totalNum,
              },
              rawData: (userNFTTxs ?? []).map((item) => {
                return {
                  ...item,
                  amount: item.amount.toString(),
                  // (item.payeeAddress === account.accAddress ? "+" : "-") +
                  // item.amount.toString(),
                  fee: {
                    unit: item.feeTokenSymbol || '',
                    value: Number(
                      volumeToCountAsBigNumber(item.feeTokenSymbol, item.feeAmount || 0),
                    ),
                  },
                }
              }) as Row[],
            },
          }
        })
      }
    },
    [nftHistory],
  )

  const getTradeList = React.useCallback(
    async ({
      page = 1,
      limit,
      start,
      end,
      side = undefined,
    }: // duration = [null, null],
    NFTTradeFilter) => {
      if (LoopringAPI.userAPI) {
        setTrades((state) => ({
          ...state,
          nftTrades: {
            ...state.nftTrades,
            showLoading: true,
          },
        }))
        const _limit = limit ? limit : nftHistory.userNFTTxs.pagination?.pageSize ?? LimitNFTHistory

        const result = await LoopringAPI.userAPI.getUserNFTTradeHistory(
          {
            accountId: account.accountId,
            offset: (page - 1) * _limit,
            limit: _limit,
            start,
            end,
            metadata: true,
            side: side as sdk.NFT_TRADE,
          },
          account.apiKey,
        )
        const { totalNum, trades } = result as any
        setTrades((state) => {
          return {
            ...state,
            nftTrades: {
              ...state.nftTrades,
              totalNum,
              pagination: {
                pageSize: limit ?? nftHistory.userNFTTxs.pagination?.pageSize ?? LimitNFTHistory,
                total: totalNum,
                page,
              },
              showLoading: false,
              rawData: trades as TradeRow[],
            },
          }
        })
      }
    },
    [nftHistory],
  )

  React.useEffect(() => {
    // @ts-ignore
    let height = container?.current?.offsetHeight
    const pageSize = Math.floor(height / RowConfig.rowHeight) - (isMobile ? 1 : 3)
    if (height) {
      setNftHistory((state) => {
        const userNFTTxs = state.userNFTTxs

        userNFTTxs.pagination = {
          ...state.userNFTTxs.pagination,
          pageSize,
        } as any
        getTxnList({
          page: 1,
          limit: pageSize,
          txType: userNFTTxs.txType,
          duration: userNFTTxs.duration,
        })
        return state
      })
      setTrades((state) => {
        const nftTrades = state.nftTrades
        nftTrades.currentHeight = height
        nftTrades.pagination = {
          ...state.nftTrades.pagination,
          pageSize,
        } as any
        getTradeList({
          page: 1,
          // offset:0

          limit: pageSize,
          side: undefined,
        })
        return state
      })
    }
  }, [container])

  return {
    container,
    nftHistory,
    getTxnList,
    tabIndex,
    setTabIndex,
    getTradeList,
    nftTrades: nftTrades.nftTrades,
  }
}
