import React from 'react'
import {
  LoopringAPI,
  makeDualOrderedItem,
  store,
  tradeItemToTableDataItem,
  useAccount,
  useDefiMap,
  useDualMap,
  useTokenMap,
  useWalletLayer2,
  volumeToCount,
  volumeToCountAsBigNumber,
} from '@loopring-web/core'
import {
  AccountStep,
  AmmSideTypes,
  BtradeSwapsType,
  OrderHistoryRawDataItem,
  OrderHistoryTableDetailItem,
  RawDataAmmItem,
  RawDataBtradeSwapsItem,
  RawDataDualAssetItem,
  RawDataDualTxsItem,
  RawDataTradeItem,
  RawDataTransactionItem,
  ToastType,
  TransactionStatus,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE, GetOrdersRequest, Side } from '@loopring-web/loopring-sdk'
import {
  AccountStatus,
  BTRDE_PRE,
  defiMarkets,
  getValuePrecisionThousand,
  leverageETHConfig,
  MapChainId,
  SDK_ERROR_MAP_TO_UI,
  TradeStatus,
  TradeTypes,
} from '@loopring-web/common-resources'
import { TFunction, useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'

export type TxsFilterProps = {
  // accountId: number;
  tokenSymbol?: string
  start?: number
  end?: number
  offset?: number
  limit?: number
  types?: sdk.UserTxTypes[] | string
}

enum TxTypeAMM {
  Add = 'join_pool',
  Remove = 'exit_pool',
}

export function useGetTxs(setToastOpen: (state: any) => void) {
  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { tokenMap } = store.getState().tokenMap
  const { t } = useTranslation(['error'])
  const [txs, setTxs] = React.useState<RawDataTransactionItem[]>([])
  const [txsTotal, setTxsTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(false)

  const getTxnStatus = (status: string) =>
    status === ''
      ? TransactionStatus.processing
      : status === 'processed'
      ? TransactionStatus.processed
      : status === 'processing'
      ? TransactionStatus.processing
      : status === 'received'
      ? TransactionStatus.received
      : TransactionStatus.failed

  const getUserTxnList = React.useCallback(
    async ({ tokenSymbol, start, end, limit, offset, types }: TxsFilterProps) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowLoading(true)
        const response = await LoopringAPI.userAPI.getUserTxs(
          {
            accountId,
            limit,
            tokenSymbol,
            start,
            end,
            offset,
            types,
          },
          apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              'error : ' + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          })
        } else {
          const formattedList: RawDataTransactionItem[] = response.userTxs.map((order) => {
            const feePrecision = tokenMap ? tokenMap[order.feeTokenSymbol].precision : undefined
            return {
              ...order,
              side: order.txType as any,
              amount: {
                unit: order.symbol || '',
                value: Number(volumeToCount(order.symbol, order.amount)),
              },
              fee: {
                unit: order.feeTokenSymbol || '',
                value: Number(volumeToCountAsBigNumber(order.feeTokenSymbol, order.feeAmount || 0)),
              },
              memo: order.memo || '',
              time: order.timestamp,
              txnHash: order.hash,
              status: getTxnStatus(order.status),
              feePrecision: feePrecision,
            } as RawDataTransactionItem
          })
          setTxs(formattedList)
          setTxsTotal(response.totalNum)
          setShowLoading(false)
        }
      }
    },
    [accountId, apiKey, setToastOpen, t, tokenMap],
  )

  return {
    txs,
    txsTotal,
    showLoading,
    getUserTxnList,
  }
}

export function useGetTrades(setToastOpen: (state: any) => void) {
  const [userTrades, setUserTrades] = React.useState<RawDataTradeItem[]>([])
  const [userTradesTotal, setUserTradesTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const {
    account: { accountId, apiKey },
  } = useAccount()

  const tokenMap = store.getState().tokenMap.tokenMap
  const { t } = useTranslation(['error'])

  const getUserTradeList = React.useCallback(
    async ({
      market,
      orderHash,
      page = 1,
      pageSize,
      fromId,
      fillTypes,
    }: {
      market?: string
      page?: number
      total?: number
      pageSize: number
      // offset: (page - 1) * pageSize,
      // limit: pageSize,
      fromId?: any
      orderHash?: any
      fillTypes?: any
    }) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey && tokenMap) {
        setShowLoading(true)
        setPage(page)
        const response = await LoopringAPI.userAPI.getUserTrades(
          {
            accountId,
            market,
            orderHash,
            offset: (page - 1) * pageSize,
            limit: pageSize,
            fromId,
            fillTypes,
          },
          apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              'error : ' + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          })
        } else {
          setUserTrades(
            response.userTrades.map((o) => {
              return tradeItemToTableDataItem(o) as RawDataTradeItem
            }),
          )
          setUserTradesTotal(response.totalNum)
        }
        setShowLoading(false)
      }
    },
    [accountId, apiKey, setToastOpen, t, tokenMap],
  )

  return {
    userTrades,
    userTradesTotal,
    getUserTradeList,
    showLoading,
    page,
  }
}

export function useGetAmmRecord(setToastOpen: (props: any) => void) {
  const [ammRecordList, setAmmRecordList] = React.useState<RawDataAmmItem[]>([])
  const { t } = useTranslation(['error'])
  const [ammRecordTotal, setAmmRecordTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  const { accountId, apiKey } = store.getState().account
  const { tokenMap } = useTokenMap()

  const getTokenName = React.useCallback(
    (tokenId?: number) => {
      if (tokenMap) {
        const keys = Object.keys(tokenMap)
        const values = Object.values(tokenMap)
        const index = values.findIndex((token) => token.tokenId === tokenId)
        if (index > -1) {
          return keys[index]
        }
        return ''
      }
      return ''
    },
    [tokenMap],
  )

  const getAmmpoolList = React.useCallback(
    async ({ tokenSymbol, start, end, txTypes, offset, limit }: any) => {
      const ammPoolAddress = tokenMap[tokenSymbol]?.address
      setShowLoading(true)
      if (LoopringAPI.ammpoolAPI && accountId && apiKey) {
        const response = await LoopringAPI.ammpoolAPI.getUserAmmPoolTxs(
          {
            accountId,
            txTypes: txTypes ? TxTypeAMM[txTypes] : '',
            offset,
            start,
            end,
            limit,
            ammPoolAddress,
          },
          apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              'error : ' + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          })
        } else {
          const result = response.userAmmPoolTxs.map((order) => ({
            side: order.txType === sdk.AmmTxType.JOIN ? AmmSideTypes.Join : AmmSideTypes.Exit,
            amount: {
              from: {
                key: getTokenName(order.poolTokens[0]?.tokenId),
                value: String(
                  volumeToCount(
                    getTokenName(order.poolTokens[0]?.tokenId),
                    order.poolTokens[0]?.actualAmount,
                  ),
                ),
              },
              to: {
                key: getTokenName(order.poolTokens[1]?.tokenId),
                value: String(
                  volumeToCount(
                    getTokenName(order.poolTokens[1]?.tokenId),
                    order.poolTokens[1]?.actualAmount,
                  ),
                ),
              },
            },
            lpTokenAmount: String(
              volumeToCount(getTokenName(order.lpToken?.tokenId), order.lpToken?.actualAmount),
            ),
            fee: {
              key: getTokenName(order.poolTokens[1]?.tokenId),
              value: volumeToCount(
                getTokenName(order.poolTokens[1]?.tokenId),
                order.poolTokens[1]?.feeAmount,
              )?.toFixed(6),
            },
            time: order.updatedAt,
          }))
          setAmmRecordList(result)
          setShowLoading(false)
          setAmmRecordTotal(response.totalNum)
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, getTokenName, setToastOpen, t, tokenMap],
  )

  return {
    ammRecordList,
    showLoading,
    getAmmpoolList,
    ammRecordTotal,
  }
}

export function useGetDefiRecord(setToastOpen: (props: any) => void) {
  const { t } = useTranslation(['error'])
  const [defiList, setDefiRecordList] = React.useState<sdk.UserDefiTxsHistory[]>([])
  const [defiTotal, setDefiTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  const { accountId, apiKey } = store.getState().account

  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const getDefiTxList = React.useCallback(
    async ({ start, end, offset, limit }: any) => {
      setShowLoading(true)
      if (LoopringAPI.defiAPI && accountId && apiKey) {
        const markets = defiMarkets[network]
        const response = await LoopringAPI.defiAPI.getDefiTransaction(
          {
            accountId,
            offset,
            start,
            end,
            limit,
            markets: markets.join(','),
          } as any,
          apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              'error : ' + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          })
        } else {
          // @ts-ignore
          const result = (response as any).userDefiTxs
          setDefiRecordList(result)
          setShowLoading(false)
          setDefiTotal((response as any).totalNum)
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, setToastOpen, t],
  )

  return {
    defiList,
    showLoading,
    getDefiTxList,
    defiTotal,
  }
}

export function useDefiSideRecord(setToastOpen: (props: any) => void) {
  const { t } = useTranslation(['error'])
  const { tokenMap } = useTokenMap()
  const [sideStakingList, setSideStakingRecordList] = React.useState<sdk.STACKING_TRANSACTIONS[]>(
    [],
  )
  const [sideStakingTotal, setSideStakingTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  const { accountId, apiKey } = store.getState().account
  const getSideStakingTxList = React.useCallback(
    async ({ start, end, offset, limit }: any) => {
      setShowLoading(true)
      if (LoopringAPI.defiAPI && accountId && apiKey) {
        const response = await LoopringAPI.defiAPI.getStakeTransactions(
          {
            accountId,
            tokenId: tokenMap['LRC'].tokenId,
            start,
            end,
            limit,
            offset,
          } as any,
          apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              'error : ' + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          })
        } else {
          const result = response.list
          setSideStakingRecordList(result)
          setShowLoading(false)
          setSideStakingTotal(response.totalNum)
          // }
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, setToastOpen, t],
  )

  return {
    sideStakingList,
    showLoading,
    getSideStakingTxList,
    sideStakingTotal,
  }
}

export const useOrderList = ({
  setToastOpen,
  isStopLimit = false,
  isOrderBookScroll = false,
}: {
  isStopLimit?: boolean
  setToastOpen?: (props: any) => void
  isOrderBookScroll?: boolean
}) => {
  const { t } = useTranslation(['error'])
  const [orderOriginalData, setOrderOriginalData] = React.useState<OrderHistoryRawDataItem[]>([])
  const [orderDetailList, setOrderDetailList] = React.useState<OrderHistoryTableDetailItem[]>([])
  const [totalNum, setTotalNum] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(false)
  const [showDetailLoading, setShowDetailLoading] = React.useState(false)
  const {
    account: { accountId, apiKey, readyState },
  } = useAccount()
  const {
    tokenMap: { marketArray, tokenMap, marketMap },
  } = store.getState()
  const {
    ammMap: { ammMap },
  } = store.getState().amm
  const { sk: privateKey } = store.getState().account.eddsaKey

  const { status, updateWalletLayer2 } = useWalletLayer2()

  const ammPairList = ammMap ? Object.keys(ammMap) : []
  const jointPairs = (marketArray || []).concat(ammPairList)

  const getOrderList = React.useCallback(
    async ({
      isScroll,
      ...props
    }: Omit<GetOrdersRequest, 'accountId'> & { isScroll?: boolean; extraOrderTypes?: string }) => {
      setShowLoading(true)
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        const userOrders = await LoopringAPI.userAPI.getOrders(
          {
            ...props,
            accountId,
            extraOrderTypes: isStopLimit ? 'STOP_LIMIT' : 'TRADITIONAL_ORDER',
          },
          apiKey,
        )
        if ((userOrders as sdk.RESULT_INFO).code || (userOrders as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(userOrders as sdk.RESULT_INFO)?.code ?? 700001]
          if (setToastOpen) {
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                'error : ' + errorItem
                  ? t(errorItem.messageKey)
                  : (userOrders as sdk.RESULT_INFO).message,
            })
          }
        } else {
          if (userOrders && Array.isArray(userOrders.orders)) {
            setTotalNum(userOrders.totalNum)
            const data = userOrders.orders.map((order) => {
              const { baseAmount, quoteAmount, baseFilled, quoteFilled } = order.volumes
              const marketList = order.market.split('-')
              if (marketList.length === 3) {
                marketList.shift()
              }
              // due to AMM case, we cannot use first index
              const side = order.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
              const isBuy = side === TradeTypes.Buy
              const [tokenFirst, tokenLast] = marketList
              const baseToken = isBuy ? tokenLast : tokenFirst
              const quoteToken = isBuy ? tokenFirst : tokenLast
              const actualBaseFilled = (isBuy ? quoteFilled : baseFilled) as any
              const actualQuoteFilled = (isBuy ? baseFilled : quoteFilled) as any
              const baseValue = isBuy
                ? volumeToCount(baseToken, quoteAmount)
                : volumeToCount(baseToken, baseAmount)
              const quoteValue = isBuy
                ? volumeToCount(quoteToken, baseAmount)
                : (volumeToCount(baseToken, baseAmount) || 0) * Number(order.price || 0)
              const baseVolume = volumeToCountAsBigNumber(baseToken, actualBaseFilled)
              const quoteVolume = volumeToCountAsBigNumber(quoteToken, actualQuoteFilled)
              const quotefilledValue = volumeToCount(quoteToken, actualQuoteFilled)

              const average = isBuy
                ? baseVolume?.div(quoteVolume || new BigNumber(1)).toNumber() || 0
                : quoteVolume?.div(baseVolume || new BigNumber(1)).toNumber() || 0
              const completion = (quotefilledValue || 0) / (quoteValue || 1)

              const precisionFrom = tokenMap
                ? (tokenMap as any)[baseToken]?.precisionForOrder
                : undefined
              const precisionTo = tokenMap
                ? (tokenMap as any)[quoteToken]?.precisionForOrder
                : undefined
              const precisionMarket = marketMap
                ? marketMap[order.market]?.precisionForPrice
                : undefined

              return {
                market: order.market,
                side: order.side === 'BUY' ? TradeTypes.Buy : TradeTypes.Sell,
                orderType: order.orderType,
                amount: {
                  from: {
                    key: baseToken,
                    value: baseValue as any,
                    precision: precisionFrom,
                  },
                  to: {
                    key: quoteToken,
                    value: quoteValue as any,
                    precision: precisionTo,
                  },
                },
                average: average,
                price: {
                  key: quoteToken,
                  value: Number(order.price),
                },
                time: order.validity.start * 1000,
                status: order.status as unknown as TradeStatus,
                hash: order.hash,
                orderId: order.clientOrderId,
                tradeChannel: order.tradeChannel,
                completion: completion,
                precisionMarket: precisionMarket,
                // @ts-ignore
                extraOrderInfo: order.extraOrderInfo,
                __raw__: order,
              }
            })
            if (isScroll) {
              setOrderOriginalData((_data) => {
                return [..._data, ...data]
              })
            } else {
              setOrderOriginalData(data)
            }
          }
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, marketMap, tokenMap, isStopLimit],
  )

  React.useEffect(() => {
    ;(async () => {
      if (status === 'UNSET' && isOrderBookScroll === true) {
        getOrderList({
          limit: 50,
          status: ['processing'],
        })
      }
    })()
  }, [isOrderBookScroll, getOrderList, status])

  const clearOrderDetail = React.useCallback(() => {
    setOrderDetailList([])
  }, [])

  const isAtBottom = React.useCallback(
    ({ currentTarget }: React.UIEvent<HTMLDivElement>): boolean => {
      return currentTarget.scrollTop + 10 >= currentTarget.scrollHeight - currentTarget.clientHeight
    },
    [],
  )

  const handleScroll = React.useCallback(
    async (event: React.UIEvent<HTMLDivElement>, isOpen: boolean = false) => {
      if (!isAtBottom(event) || (event.target as any)?.scrollTop === 0) return
      getOrderList({
        isScroll: true,
        offset: orderOriginalData.length,
        status: isOpen
          ? ['processing']
          : ['processed', 'failed', 'cancelled', 'cancelling', 'expired'],
        extraOrderTypes: isStopLimit ? 'STOP_LIMIT' : 'TRADITIONAL_ORDER',
      })
    },
    [getOrderList, isAtBottom, orderOriginalData, isStopLimit],
  )

  const cancelOrder = React.useCallback(
    async ({ orderHash, clientOrderId }) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && privateKey && apiKey) {
        await LoopringAPI.userAPI.cancelOrder(
          {
            accountId,
            orderHash,
            clientOrderId,
          },
          privateKey,
          apiKey,
        )
        updateWalletLayer2()
      }
    },
    [accountId, apiKey, privateKey, updateWalletLayer2],
  )

  const cancelOrderByHashList = React.useCallback(
    async (orderHashList: string) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && privateKey && apiKey) {
        await LoopringAPI.userAPI.cancelMultiOrdersByHash(
          {
            accountId,
            orderHash: orderHashList,
          },
          privateKey,
          apiKey,
        )
        updateWalletLayer2()
      }
    },
    [accountId, apiKey, privateKey, updateWalletLayer2],
  )

  const getOrderDetail = React.useCallback(
    async (orderHash: string, t: TFunction) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
        setShowDetailLoading(true)
        const response = await LoopringAPI.userAPI.getOrderDetails(
          {
            accountId,
            orderHash,
          },
          apiKey,
        )
        const formattedData = [response.orderDetail].map((order: any) => {
          const { baseAmount, quoteAmount, baseFilled, quoteFilled, fee } = order.volumes
          const marketList = order.market.split('-')
          if (marketList.length === 3) {
            marketList.shift()
          }
          // due to AMM case, we cannot use first index
          const side = order.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
          const isBuy = side === TradeTypes.Buy
          const role = isBuy ? t('labelOrderDetailMaker') : t('labelOrderDetailTaker')
          const [tokenFirst, tokenLast] = marketList
          const baseToken = isBuy ? tokenLast : tokenFirst
          const quoteToken = isBuy ? tokenFirst : tokenLast
          const baseValue = isBuy
            ? volumeToCount(baseToken, quoteAmount)
            : volumeToCount(baseToken, baseAmount)
          const quoteValue = isBuy
            ? volumeToCount(quoteToken, baseAmount)
            : (volumeToCount(baseToken, baseAmount) || 0) * Number(order.price || 0)
          const actualBaseFilled = isBuy ? quoteFilled : baseFilled
          const actualQuoteFilled = isBuy ? baseFilled : quoteFilled
          const baseVolume = volumeToCountAsBigNumber(baseToken, actualBaseFilled)
          const quoteVolume = volumeToCountAsBigNumber(quoteToken, actualQuoteFilled)
          const filledPrice = baseVolume?.div(quoteVolume || new BigNumber(1)).toNumber() || 0
          const feeValue = volumeToCountAsBigNumber(quoteToken, fee)?.toNumber() || 0

          const precisionFrom = tokenMap
            ? (tokenMap as any)[baseToken]?.precisionForOrder
            : undefined
          const precisionTo = tokenMap
            ? (tokenMap as any)[quoteToken]?.precisionForOrder
            : undefined
          const precisionMarket = marketMap ? marketMap[order.market]?.precisionForPrice : undefined
          const precisionFee = tokenMap
            ? (tokenMap as any)[quoteToken]?.precisionForOrder
            : undefined

          return {
            amount: {
              from: {
                key: baseToken,
                value: baseValue as any,
                precision: precisionFrom,
              },
              to: {
                key: quoteToken,
                value: quoteValue as any,
                precision: precisionTo,
              },
            },
            filledPrice: {
              value: filledPrice,
              precision: precisionMarket,
            },
            fee: {
              key: quoteToken,
              value: feeValue,
              precision: precisionFee,
            },
            role: role,
            time: order.validity.start * 1000,
            volume: quoteVolume?.toNumber(),
            orderId: order.clientOrderId,
            extraOrderInfo: order.extraOrderInfo,
            __raw__: order,
          }
        })
        setOrderDetailList(formattedData)
        setShowDetailLoading(false)
      }
    },
    [accountId, apiKey, marketMap, tokenMap],
  )

  const clearData = React.useCallback(() => {
    setOrderOriginalData([])
  }, [])

  React.useEffect(() => {
    if (readyState !== AccountStatus.ACTIVATED) {
      clearData()
    }
  }, [status, readyState, clearData])

  return {
    marketArray: jointPairs,
    getOrderList,
    setOrderOriginalData,
    rawData: orderOriginalData,
    clearRawData: clearData,
    totalNum,
    showLoading,
    showDetailLoading,
    getOrderDetail,
    orderDetailList,
    cancelOrder,
    handleScroll,
    clearOrderDetail,
    cancelOrderByHashList,
  }
}

export const useDualTransaction = <R extends RawDataDualTxsItem>(
  setToastOpen: (props: any) => void,
) => {
  const { t } = useTranslation(['error'])

  const {
    account: { accountId, apiKey },
  } = useAccount()

  const [dualList, setDualList] = React.useState<R[]>([])
  const { idIndex } = useTokenMap()
  const [dualTotal, setDualTotal] = React.useState(0)
  const { marketMap: dualMarketMap } = useDualMap()
  // const [pagination, setDualPagination] = React.useState<{
  //   pageSize: number;
  //   total: number;
  // }>({
  //   pageSize: Limit,
  //   total: 0,
  // });
  const [showLoading, setShowLoading] = React.useState(true)

  const getDualTxList = React.useCallback(
    async ({ start, end, offset, settlementStatus, investmentStatus, dualTypes, limit }: any) => {
      setShowLoading(true)
      if (LoopringAPI.defiAPI && accountId && apiKey) {
        const response = await LoopringAPI.defiAPI.getDualTransactions(
          {
            dualTypes,
            accountId,
            settlementStatus,
            investmentStatus,
            offset,
            limit,
            start,
            end,
          } as any,
          apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          if (setToastOpen) {
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                'error : ' + errorItem
                  ? t(errorItem.messageKey)
                  : (response as sdk.RESULT_INFO).message,
            })
          }
        } else {
          // @ts-ignore
          let result = (response as any)?.userDualTxs.reduce(
            (prev: RawDataDualAssetItem[], item: sdk.UserDualTxsHistory) => {
              const [, , coinA, coinB] =
                (item.tokenInfoOrigin.market ?? 'dual-').match(/(dual-)?(\w+)-(\w+)/i) ?? []

              let [sellTokenSymbol, buyTokenSymbol] =
                item.dualType == DUAL_TYPE.DUAL_BASE
                  ? [
                      coinA ?? idIndex[item.tokenInfoOrigin.tokenIn],
                      coinB ?? idIndex[item.tokenInfoOrigin.tokenOut],
                    ]
                  : [
                      coinB ?? idIndex[item.tokenInfoOrigin.tokenIn],
                      coinA ?? idIndex[item.tokenInfoOrigin.tokenOut],
                    ]
              prev.push({
                ...makeDualOrderedItem(
                  item,
                  sellTokenSymbol,
                  buyTokenSymbol,
                  0,
                  dualMarketMap[item.tokenInfoOrigin.market],
                ),
                amount: item.tokenInfoOrigin.amountIn,
              })
              return prev
            },
            [] as RawDataDualAssetItem[],
          )

          setDualList(result)
          setShowLoading(false)
          setDualTotal((response as any).totalNum)
          // setDualPagination({
          //   pageSize: limit,
          //   total: (response as any).totalNum,
          // });
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, setToastOpen, t, idIndex, dualMarketMap],
  )

  return {
    // page,
    dualList,
    showLoading,
    getDualTxList,
    dualTotal,
    dualMarketMap,
  }
}

export const useBtradeTransaction = <R extends RawDataBtradeSwapsItem>(
  setToastOpen: (props: any) => void,
) => {
  const { t } = useTranslation(['error'])
  const [btradeOrderData, setBtradeOrderData] = React.useState<R[]>([])
  const [totalNum, setTotalNum] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(false)
  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { tokenMap } = useTokenMap()
  const { setShowAccount } = useOpenModals()
  const getBtradeOrderList = React.useCallback(
    async (props: Omit<GetOrdersRequest, 'accountId'>) => {
      if (LoopringAPI && LoopringAPI.defiAPI && accountId && apiKey) {
        setShowLoading(true)
        const userOrders = await LoopringAPI.defiAPI.getBtradeOrders({
          request: { accountId, limit: props.limit, offset: props.offset },
          apiKey,
        })
        if ((userOrders as sdk.RESULT_INFO).code || (userOrders as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(userOrders as sdk.RESULT_INFO)?.code ?? 700001]
          if (setToastOpen) {
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                'error : ' + errorItem
                  ? t(errorItem.messageKey)
                  : (userOrders as sdk.RESULT_INFO).message,
            })
          }
        } else {
          if (userOrders && Array.isArray(userOrders.list)) {
            setTotalNum(userOrders.totalNum)
            const data = userOrders.list.map((item: any) => {
              const {
                status,
                market,
                price,
                // btradeExtraInfo: tokenInfos,
                volumes: { fee, baseAmount, baseFilled, quoteAmount, quoteFilled },
                validity: { start },
                side,
                baseSettled,
                quoteSettled,
              } = item
              //@ts-ignore
              const [, baseTokenSymbol, quoteTokenSymbol] = market
                .replace(BTRDE_PRE, '')
                .match(/(\w+)-(\w+)/i)
              let amountIn,
                amountOut,
                fromSymbol,
                toSymbol,
                amountFOut,
                _price,
                amountFIn,
                settledIn,
                settledOut

              if (side === sdk.Side.Sell) {
                fromSymbol = baseTokenSymbol
                toSymbol = quoteTokenSymbol
                amountFIn = baseFilled
                amountFOut = quoteFilled
                amountIn = baseAmount
                amountOut = quoteAmount
                settledIn = baseSettled
                settledOut = quoteSettled
                _price = {
                  from: baseTokenSymbol,
                  key: quoteTokenSymbol,
                  value: getValuePrecisionThousand(
                    price,
                    tokenMap[quoteTokenSymbol].precision,
                    tokenMap[quoteTokenSymbol].precision,
                    undefined,
                  ),
                }
              } else {
                toSymbol = baseTokenSymbol
                fromSymbol = quoteTokenSymbol
                amountFOut = baseFilled
                amountFIn = quoteFilled
                amountOut = baseAmount
                amountIn = quoteAmount
                settledOut = baseSettled
                settledIn = quoteSettled
                _price = {
                  from: baseTokenSymbol,
                  key: quoteTokenSymbol,
                  value: getValuePrecisionThousand(
                    price,
                    tokenMap[quoteTokenSymbol].precision,
                    tokenMap[quoteTokenSymbol].precision,
                    undefined,
                  ),
                }
              }

              const fromToken = tokenMap[fromSymbol]
              const toToken = tokenMap[toSymbol]

              const fromAmount = getValuePrecisionThousand(
                sdk.toBig(amountIn).div('1e' + fromToken.decimals),
                fromToken.precision,
                fromToken.precision,
                undefined,
              )
              const fromFAmount = getValuePrecisionThousand(
                sdk.toBig(amountFIn).div('1e' + fromToken.decimals),
                fromToken.precision,
                fromToken.precision,
                undefined,
              )
              const settledFromAmount = getValuePrecisionThousand(
                sdk.toBig(settledIn).div('1e' + fromToken.decimals),
                fromToken.precision,
                fromToken.precision,
                undefined,
              )

              const toAmount = getValuePrecisionThousand(
                sdk.toBig(amountOut).div('1e' + toToken.decimals),
                toToken.precision,
                toToken.precision,
                undefined,
              )

              const toFAmount = getValuePrecisionThousand(
                sdk.toBig(amountFOut).div('1e' + toToken.decimals),
                toToken.precision,
                toToken.precision,
                undefined,
              )
              const settledToAmount = getValuePrecisionThousand(
                sdk.toBig(settledOut).div('1e' + toToken.decimals),
                toToken.precision,
                toToken.precision,
                undefined,
              )

              const feeAmount =
                fee && fee != 0
                  ? getValuePrecisionThousand(
                      sdk.toBig(fee ?? 0).div('1e' + toToken.decimals),
                      toToken.precision,
                      toToken.precision,
                      undefined,
                    )
                  : undefined
              const feeSymbol = toSymbol

              let type
              switch (status) {
                case 'processed':
                  type = BtradeSwapsType.Settled
                  break
                case 'failed':
                case 'cancelled':
                  type = BtradeSwapsType.Failed
                  break
                case 'filled':
                  type = BtradeSwapsType.Delivering
                  break
                case 'processing':
                default:
                  type = BtradeSwapsType.Pending
                  break
              }
              return {
                type,
                price: _price,
                fromAmount,
                fromSymbol,
                toAmount,
                fromFAmount,
                toFAmount,
                settledFromAmount,
                settledToAmount,
                toSymbol,
                time: Number(start + '000'),
                rawData: item,
                feeSymbol,
                feeAmount,
                filledPercent: sdk.toBig(amountFIn).div(amountIn).times(100).toFormat(2),
              }
            }, [])
            setBtradeOrderData(data)
          }
        }
        setShowLoading(false)
      }
    },
    [accountId, apiKey, setToastOpen, t, tokenMap],
  )

  return {
    getBtradeOrderList,
    btradeOrderData,
    onDetail: (item: R) => {
      const info = {
        sellToken: tokenMap[item.fromSymbol],
        buyToken: tokenMap[item.toSymbol],
        sellFStr: item.fromFAmount && item.fromFAmount !== '0' ? item.fromFAmount : undefined,
        sellStr: item.fromAmount,
        buyFStr: item.toFAmount && item.toFAmount !== '0' ? item.toFAmount : undefined,
        buyStr: item.toAmount,
        convertStr: `1${item.price.from} \u2248 ${item.price.value} ${item.price.key}`,
        // @ts-ignore
        feeStr: item?.feeAmount == 0 ? undefined : item?.feeAmount,
        settledToAmount: item.settledToAmount,
        settledFromAmount: item.settledFromAmount,
        time: item?.time ?? undefined,
      }
      switch (item.type) {
        case BtradeSwapsType.Delivering:
          setShowAccount({
            isShow: true,
            step: AccountStep.BtradeSwap_Delivering,
            info: {
              ...info,
              isDelivering: true,
            },
          })
          break

        case BtradeSwapsType.Settled:
          setShowAccount({
            isShow: true,
            step: AccountStep.BtradeSwap_Settled,
            info,
          })
          break
        case BtradeSwapsType.Cancelled:
        case BtradeSwapsType.Failed:
          setShowAccount({
            isShow: true,
            step: AccountStep.BtradeSwap_Failed,
            info,
          })
          break
        case BtradeSwapsType.Pending:
        default:
          setShowAccount({
            isShow: true,
            step: AccountStep.BtradeSwap_Pending,
            info,
          })
          break
      }
    },
    totalNum,
    showLoading,
  }
}

export function useGetLeverageETHRecord(setToastOpen: (props: any) => void) {
  const { t } = useTranslation(['error'])
  const [leverageETHList, setLeverageETHRecordList] = React.useState<sdk.UserDefiTxsHistory[]>([])
  const [leverageETHTotal, setLeverageETHTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  const { marketLeverageArray } = useDefiMap()
  const { accountId, apiKey } = store.getState().account
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const getLeverageETHTxList = React.useCallback(
    async ({ start, end, offset, limit }: any) => {
      setShowLoading(true)
      if (LoopringAPI.defiAPI && accountId && apiKey) {
        const types = leverageETHConfig.types[network]
        const response = await LoopringAPI.defiAPI.getDefiTransaction(
          {
            accountId,
            offset,
            start,
            end,
            limit,
            types: types.join(','),
          } as any,
          apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              'error : ' + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          })
        } else {
          // @ts-ignore
          const result = (response as any).userDefiTxs
          setLeverageETHRecordList(result)
          setShowLoading(false)
          setLeverageETHTotal((response as any).totalNum)
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, setToastOpen, t],
  )

  return {
    leverageETHList,
    showLoading,
    getLeverageETHTxList,
    leverageETHTotal,
  }
}
