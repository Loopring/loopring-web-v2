import React from 'react'
import {
  LoopringAPI,
  makeDualOrderedItem,
  store,
  tradeItemToTableDataItem,
  useAccount,
  useDefiMap,
  useDualMap,
  useSystem,
  useTokenMap,
  useWalletLayer2,
  volumeToCount,
  volumeToCountAsBigNumber,
  useVaultMap,
  numberFormat,
  numberStringListSum,
  fiatNumberDisplay,
  useTokenPrices,
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
  RawDataVaultTxItem,
  ToastType,
  TransactionStatus,
  useOpenModals,
  useSettings,
  VaultRecordType,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE, GetOrdersRequest, Side } from '@loopring-web/loopring-sdk'
import {
  AccountStatus,
  BTRDE_PRE,
  DEFI_CONFIG,
  getValuePrecisionThousand,
  LEVERAGE_ETH_CONFIG,
  MapChainId,
  SDK_ERROR_MAP_TO_UI,
  TradeStatus,
  TradeTypes,
  EmptyValueTag,
  DirectionTag,
  PriceTag,
  CurrencyToTag,
  mapSpecialTokenName,
} from '@loopring-web/common-resources'
import { TFunction, useTranslation } from 'react-i18next'
import BigNumber from 'bignumber.js'
import { useLocation } from 'react-router-dom'
import { isEmpty } from 'lodash'
import { number } from 'prop-types'
import { utils } from 'ethers'
import Decimal from 'decimal.js'

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
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
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
            const feePrecision = tokenMap ? tokenMap[order.feeTokenSymbol]?.precision : undefined
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
    searchValue: searchParams?.get('searchValue'),
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
        const markets = DEFI_CONFIG.MARKETS[network]
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

export function useTaikoFarmingRecord(setToastOpen: (props: any) => void) {
  const { t } = useTranslation(['error'])
  const { tokenMap } = useTokenMap()
  const [sideStakingList, setSideStakingRecordList] = React.useState<{
    accountId: number;
    tokenId: number;
    amount: string;
    productId: string;
    hash: string;
    stakingType: "subscribe" | "unsubscribe" | "redeem";
    createdAt: number;
    updatedAt: number;
}[]>(
    [],
  )
  const [sideStakingTotal, setSideStakingTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(true)
  const { accountId, apiKey } = store.getState().account
  const tokenInfo = tokenMap['TAIKO']
  const getSideStakingTxList = React.useCallback(
    async ({ start, end, offset, limit }: any) => {
      setShowLoading(true)
      if (LoopringAPI.defiAPI && accountId && apiKey) {
        const response = await LoopringAPI.defiAPI.getTaikoFarmingTransactions(
          {
            accountId,
            tokenId: tokenInfo.tokenId,
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

          const result = response.transactions

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
    sideStakingList: sideStakingList.filter(
      (item) =>
        !(item.stakingType === 'redeem' && (item.amount === '' || new Decimal(item.amount).eq(0))),
    ),
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
    async ({ orderHash, clientOrderId }: any) => {
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
  const { chainId, baseURL} = useSystem()

  const getBtradeOrderList = React.useCallback(
    async (props: Omit<sdk.GetOrdersRequest, 'accountId'>) => {
      
      if (chainId && baseURL && accountId && apiKey) {
        const defiAPI = new sdk.DefiAPI({
          chainId: chainId as sdk.ChainId,
          baseUrl: baseURL
        })
        setShowLoading(true)
        const userOrders = await defiAPI.getBtradeOrders({
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

              const fromAmount = sdk.toBig(amountIn).div('1e' + fromToken.decimals)
              const fromFAmount = sdk.toBig(amountFIn).div('1e' + fromToken.decimals)
              const settledFromAmount = sdk.toBig(settledIn).div('1e' + fromToken.decimals)
              const toAmount = sdk.toBig(amountOut).div('1e' + toToken.decimals)
              const toFAmount = sdk.toBig(amountFOut).div('1e' + toToken.decimals)
              const settledToAmount = sdk.toBig(settledOut).div('1e' + toToken.decimals)
              const fromAmountDisplay = getValuePrecisionThousand(
                sdk.toBig(amountIn).div('1e' + fromToken.decimals),
                undefined,
                fromToken.precision,
                fromToken.precision,
                false,
              )

              const toAmountDisplay = getValuePrecisionThousand(
                sdk.toBig(amountOut).div('1e' + toToken.decimals),
                undefined,
                toToken.precision,
                toToken.precision,
                false,
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
                fromAmountDisplay,
                toAmountDisplay,
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
    [accountId, apiKey, setToastOpen, t, tokenMap, baseURL, chainId],
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
        convertStr: `1 ${item.price.from} \u2248 ${item.price.value} ${item.price.key}`,
        // @ts-ignore
        feeStr: item?.feeAmount == 0 ? undefined : item?.feeAmount,
        settledToAmount: item.settledToAmount,
        settledFromAmount: item.settledFromAmount,
        time: item?.time ?? undefined,
        placedAmount:
          tokenMap && item.fromSymbol && item.fromAmount && sdk.toBig(item.fromAmount).gt(0)
            ? `${getValuePrecisionThousand(
                sdk.toBig(item.fromAmount),
                undefined,
                undefined,
                tokenMap[item.fromSymbol].precision,
                false,
                { isAbbreviate: true },
              )} ${item.fromSymbol}`
            : EmptyValueTag,
        executedAmount:
          tokenMap && item.fromSymbol && item.settledFromAmount && sdk.toBig(item.settledFromAmount).gt(0)
            ? `${getValuePrecisionThousand(
                sdk.toBig(item.settledFromAmount),
                undefined,
                undefined,
                tokenMap[item.fromSymbol].precision,
                false,
                { isAbbreviate: true },
              )} ${item.fromSymbol}`
            : EmptyValueTag,
        executedRate:
          tokenMap && item.fromSymbol && item.settledFromAmount && item.fromAmount && sdk.toBig(item.fromAmount).gt(0)
            ? `${sdk
                .toBig(item.settledFromAmount)
                .div(item.fromAmount)
                .multipliedBy('100')
                .toFixed(2)}%`
            : EmptyValueTag,
        convertedAmount:
          tokenMap && item.toSymbol && item.settledToAmount && sdk.toBig(item.settledToAmount).gt(0)
            ? `${getValuePrecisionThousand(
                sdk.toBig(item.settledToAmount),
                undefined,
                undefined,
                tokenMap[item.toSymbol].precision,
                false,
                { isAbbreviate: true },
              )} ${item.toSymbol}`
            : EmptyValueTag,
        settledAmount:
          tokenMap && item.toSymbol && item.settledToAmount && item.feeAmount && sdk.toBig(item.settledToAmount).gt(0)
            ? `${getValuePrecisionThousand(
                sdk.toBig(item.settledToAmount).minus(item.feeAmount),
                undefined,
                undefined,
                tokenMap[item.toSymbol].precision,
                false,
                { isAbbreviate: true },
              )} ${item.toSymbol}`
            : EmptyValueTag,
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
        const types = LEVERAGE_ETH_CONFIG.types[network]
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

export const useVaultTransaction = <R extends RawDataVaultTxItem>(
  setToastOpen: (props: any) => void,
) => {
  const { t } = useTranslation(['common', 'error'])
  const { t: t2 } = useTranslation(['tables'])
  const [vaultOrderData, setVaultOrderData] = React.useState<R[]>([])
  const [totalNum, setTotalNum] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(false)
  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { currency, coinJson } = useSettings()
  const { forexMap, getValueInCurrency } = useSystem()
  const { tokenMap: vaultTokenMap, idIndex: vaultIdIndex, erc20Map, tokenPrices: vaultTokenPrices } = useVaultMap()
  const { tokenMap, idIndex } = useTokenMap()
  const { setShowAccount } = useOpenModals()
  const getVaultOrderList = React.useCallback(
    async (
      props: Omit<
        {
          operateTypes: string
          offset: number
          start?: number
          end?: number
          limit: number
        },
        'accountId'
      >,
    ) => {
      if (LoopringAPI && LoopringAPI.vaultAPI && accountId && apiKey) {
        setShowLoading(true)
        const response = await LoopringAPI.vaultAPI.getVaultGetOperationHistory(
          {
            accountId,
            limit: props.limit ?? 20,
            offset: props.offset ?? 0,
            operateTypes:
              props?.operateTypes ??
              [
                0, 1, 2, 3, 4, 5, 6, 7
              ].join(','),
          },
          apiKey,
          '1'
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
          const { list, totalNum } = response as any
          if (list && Array.isArray(list) && vaultIdIndex && !isEmpty(vaultIdIndex)) {
            setTotalNum(totalNum)
            const data = list.map(
              ({ operation, order }: { operation: sdk.VaultOperation; order: sdk.VaultOrder }) => {
                const {
                  operateSubType,
                  operateType,
                  status,
                  amountIn: amountS,
                  tokenIn: tokenS,
                  tokenOut: tokenB,
                  amountOut: amountB,
                } = operation
                let fillAmountB, fillAmountS
                const { fee, price } = order ?? {}
                // const { fillAmountS, amountS, tokenS, tokenB, amountB, fillAmountB, price } = order
                let type,
                  mainContentRender,
                  erc20Symbol,
                  erc20SymbolB,
                  vSymbol,
                  precision,
                  precisionB,
                  vToken,
                  fillAmount,
                  amount,
                  vTokenB,
                  tokenBSymbol,
                  vSymbolB,
                  symbolB,
                  percentage,
                  fillAmountSStr,
                  fillAmountBStr,
                  feeStr,
                  feeToken
                switch (operateType) {
                  case sdk.VaultOperationType.VAULT_OPEN_POSITION:
                  case sdk.VaultOperationType.VAULT_MARGIN_CALL:
                  case sdk.VaultOperationType.VAULT_JOIN_REDEEM:
                    type =
                      sdk.VaultOperationType.VAULT_OPEN_POSITION == operateType
                        ? VaultRecordType.open
                        : sdk.VaultOperationType.VAULT_JOIN_REDEEM == operateType
                        ? VaultRecordType.redeem
                        : VaultRecordType.margin
                    //@ts-ignore
                    const erc20Token = tokenMap[idIndex[tokenS ?? '']]
                    //@ts-ignore
                    vToken = vaultTokenMap[vaultIdIndex[erc20Map[erc20Token.symbol]?.vaultTokenId]]
                    precision = vToken?.precision
                    vSymbol = vToken.symbol
                    erc20Symbol = vToken.symbol.slice(2)
                    amount = sdk.toBig(amountS ?? 0).div('1e' + vToken.decimals).abs()
                    fillAmountS =
                      status == sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED ? amountS : 0
                    fillAmount = sdk.toBig(fillAmountS).div('1e' + vToken.decimals)
                    percentage = sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED ? 100 : 0
                    const amountStr = !amount.eq(0)
                      ? getValuePrecisionThousand(amount, precision, precision)
                      : EmptyValueTag
                    mainContentRender = `${amountStr.toString()} ${mapSpecialTokenName(erc20Symbol)}`
                    break
                  case sdk.VaultOperationType.VAULT_BORROW:
                    type = VaultRecordType.borrow
                    //@ts-ignore
                    vToken = vaultTokenMap[vaultIdIndex[tokenB ?? '']] ?? {}
                    erc20Symbol = vToken?.symbol.slice(2)
                    precision = vToken.precision
                    vSymbol = vToken?.symbol
                    amount = sdk.toBig(amountB ?? 0).div('1e' + vToken.decimals)
                    fillAmountB =
                      status == sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED ? amountB : 0
                    fillAmount = sdk.toBig(fillAmountB).div('1e' + vToken.decimals)
                    percentage = sdk
                      .toBig(fillAmountB ?? 0)
                      .div(amountB ?? 1)
                      .times(100)
                      .toFixed(2)

                    mainContentRender = `${
                      amount.gte(0)
                        ? getValuePrecisionThousand(amount, precision, precision)
                        : EmptyValueTag
                    } ${mapSpecialTokenName(erc20Symbol)}`
                    break
                  case sdk.VaultOperationType.VAULT_REPAY:
                    type = VaultRecordType.repay
                    //@ts-ignore
                    vToken = vaultTokenMap[vaultIdIndex[tokenS ?? '']] ?? {}
                    erc20Symbol = vToken?.symbol.slice(2)
                    precision = vToken?.precision
                    vSymbol = vToken?.symbol
                    amount = sdk.toBig(amountS ?? 0).div('1e' + vToken.decimals)
                    fillAmountS =
                      status == sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED ? amountS : 0
                    fillAmount = sdk.toBig(fillAmountS).div('1e' + vToken.decimals)
                    percentage = sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED ? 100 : 0
                    // percentage = sdk
                    //   .toBig(fillAmountS ?? 0)
                    //   .div(amountS ?? 1)
                    //   .times(100)
                    //   .toFixed(2)

                    mainContentRender = `${
                      amount.gte(0)
                        ? getValuePrecisionThousand(amount, precision, precision)
                        : EmptyValueTag
                    } ${mapSpecialTokenName(erc20Symbol)}`
                    break
                  case sdk.VaultOperationType.VAULT_TRADE:
                    type = VaultRecordType.trade
                    //@ts-ignore
                    vToken = vaultTokenMap[vaultIdIndex[tokenS ?? '']]
                    //@ts-ignore
                    vTokenB = vaultTokenMap[vaultIdIndex[tokenB ?? '']]
                    feeToken = vTokenB
                    erc20Symbol = vToken.symbol.slice(2)
                    erc20SymbolB = vTokenB.symbol.slice(2)
                    precision = vToken.precision
                    precisionB = vTokenB.precision
                    vSymbol = vToken.symbol
                    vSymbolB = vTokenB.symbol

                    fillAmountS = sdk.toBig(order.fillAmountS ?? 0).div('1e' + vToken.decimals)
                    fillAmountB = sdk.toBig(order.fillAmountB ?? 0).div('1e' + vTokenB.decimals)
                    fillAmountSStr = getValuePrecisionThousand(fillAmountS, precision, precision)
                    fillAmountBStr = getValuePrecisionThousand(fillAmountB, precisionB, precisionB)
                    const _amountS = sdk.toBig(order.amountS ?? 0).div('1e' + vToken.decimals)
                    const _amountB = sdk.toBig(order.amountB ?? 0).div('1e' + vTokenB.decimals)
                    const _amountSStr = getValuePrecisionThousand(_amountS, precision, precision)
                    const _amountBStr = getValuePrecisionThousand(_amountB, precisionB, precisionB)

                    percentage = sdk
                      .toBig(order?.fillAmountS ?? 0)
                      .div(order?.amountS ?? 1)
                      .times(100)
                      .toFixed(2)
                    feeStr = getValuePrecisionThousand(
                      sdk.toBig(fee ?? 0).div('1e' + feeToken.decimals),
                      precisionB,
                      precisionB,
                    )
                    mainContentRender = `${fillAmountS.gte(0) ? fillAmountSStr : EmptyValueTag}  ${mapSpecialTokenName(erc20Symbol)} ${DirectionTag} ${
                      fillAmountB.gte(0) ? fillAmountBStr : EmptyValueTag
                    } ${mapSpecialTokenName(erc20SymbolB)}`
                    break
                  case sdk.VaultOperationType.VAULT_CLOSE_OUT:
                    type = VaultRecordType.closeout
                    let erc20B = tokenMap[idIndex[tokenB ?? '']]
                    tokenBSymbol = erc20B.symbol
                    //@ts-ignore
                    // vTokenB = vaultTokenMap[vaultIdIndex[tokenB ?? '']]
                    amount = sdk.toBig(amountB ?? 0).div('1e' + erc20B?.decimals ?? 0)
                    //@ts-ignore
                    precision = erc20B.precision
                    fillAmountB =
                      status == sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED ? amountB : 0
                    fillAmount = sdk.toBig(fillAmountB).div('1e' + erc20B.decimals)
                    percentage = sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED ? 100 : 0
                    // percentage = sdk
                    //   .toBig(amountB ?? 0)
                    //   .div(fillAmountB ?? 1)
                    //   .times(100)
                    //   .toFixed(2)
                    mainContentRender = `${
                      amount.gte(0)
                        ? getValuePrecisionThousand(amount, precision, precision)
                        : EmptyValueTag
                    } ${mapSpecialTokenName(tokenBSymbol)}`
                    break
                  case sdk.VaultOperationType.VAULT_CONVERT:
                      type = VaultRecordType.convert
                      const buyAmountList : string[] = (operation as any).executionHistory.map((item: string) => {
                        const itemObj = JSON.parse(item)
                        const {
                          amountOut,
                          tokenOut,
                        } = itemObj
                        const vTokenBuyInfo = vaultTokenMap[vaultIdIndex[tokenOut]]
                        const buyAmount = numberFormat(utils.formatUnits(amountOut, vTokenBuyInfo.decimals), {fixed: vTokenBuyInfo.precision})
                        return buyAmount
                      })
                      const repaymentInUSDT = numberFormat(numberStringListSum(buyAmountList), {fixed: 2});
                      mainContentRender = repaymentInUSDT + ' USDT'
                      break
                }

                let item = {
                  status,
                  type,
                  vSymbol,
                  vTokenB,
                  operateSubType,
                  operateType,
                  symbolB,
                  vSymbolB,
                  feeStr,
                  feeTokenSymbol: feeToken?.symbol,
                  feeErc20Symbol: erc20SymbolB,
                  erc20SymbolB,
                  erc20Symbol,
                  mainContentRender,
                  fillAmount: fillAmount?.toString(),
                  percentage,
                  raw_data: {
                    order,
                    operation,
                  },
                } as unknown as R
                return item
              },
            )
            setVaultOrderData(data)
          }
        }
        setShowLoading(false)
      }
    },
    [accountId, apiKey, setToastOpen, t, tokenMap, vaultIdIndex],
  )
  const [detail, setShowDetail] = React.useState<
    | {
        isShow: true
        detail:
          | {
              type:
                | 'VAULT_OPEN_POSITION'
                | 'VAULT_MARGIN_CALL'
                | 'VAULT_BORROW'
                | 'VAULT_REPAY'
                | 'VAULT_JOIN_REDEEM'
              statusColor: string
              statusLabel: string
              statusType: 'success' | 'processing' | 'failed'
              // collateralSymbol?: string
              // collateralAmount?: string
              time: number
              amount: string
              amountSymbol: string
            }
          | {
              type: 'VAULT_TRADE'
              statusColor: string
              statusLabel: string
              statusType: 'success' | 'processing' | 'failed'
              fromSymbol: string
              toSymbol: string
              placedAmount: string
              executedAmount: string
              executedRate: string
              convertedAmount: string
              price: string
              feeSymbol: string
              feeAmount: string
              time: number
            }
          | {
              type: 'VAULT_CLOSE_OUT'
              vaultCloseDetail: any
            }
          | {
              type: 'VAULT_CONVERT'
              status: 'success' | 'processing' | 'failed'
              totalValueInCurrency: string
              convertedInUSDT: string
              repaymentInUSDT: string
              time: number
              dusts: Array<{
                symbol: string
                coinJSON: any
                amount: string
                valueInCurrency: string
              }>
            }
      }
    | { isShow: false }
  >({
    isShow: false,
  })

  const onItemClick = (item: R) => {

    setShowDetail((_state: any) => {
      const {
        raw_data: { operation, order },
      } = item
      const statusColor = [
        sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
        'VAULT_STATUS_EARNING',
      ].includes(operation.status)
        ? 'var(--color-success)'
        : [
            sdk.VaultOperationStatus.VAULT_STATUS_PENDING,
            sdk.VaultOperationStatus.VAULT_STATUS_PROCESSING,
          ].includes(operation.status)
        ? 'var(--color-primary)'
        : operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
        ? 'var(--color-error)'
        : 'var(--color-text-primary)'
      const statusType = [
        sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
        'VAULT_STATUS_EARNING',
      ].includes(operation.status)
        ? 'success'
        : [
            sdk.VaultOperationStatus.VAULT_STATUS_PENDING,
            sdk.VaultOperationStatus.VAULT_STATUS_PROCESSING,
          ].includes(operation.status)
        ? 'processing'
        : operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
        ? 'failed'
        : 'processing'
      const statusLabel = t2(`labelVault${operation.status}`)
      switch (operation.operateType) {
        case 'VAULT_BORROW':
        case 'VAULT_MARGIN_CALL':
        case 'VAULT_JOIN_REDEEM':
        case 'VAULT_REPAY':
        case 'VAULT_OPEN_POSITION': {
          const collateralToken = tokenMap[idIndex[operation.tokenIn]]
          let amount, amountSymbol: string 
          if (operation.operateType === 'VAULT_BORROW' ) {
            const vAmountToken = vaultTokenMap[vaultIdIndex[operation.tokenOut]]
            amount = getValuePrecisionThousand(
              sdk.toBig(operation.amountOut ?? 0).div('1e' + vAmountToken.decimals),
              vAmountToken.precision,
              vAmountToken.precision,
              undefined,
              false,
              {
                floor: false,
              },
            )
            amountSymbol = vAmountToken && vAmountToken.symbol.slice(2)
          } else if (operation.operateType === 'VAULT_REPAY') {
            const vAmountToken = vaultTokenMap[vaultIdIndex[operation.tokenIn]]
            amount = getValuePrecisionThousand(
              sdk.toBig(operation.amountIn ?? 0).div('1e' + vAmountToken.decimals).abs(),
              vAmountToken.precision,
              vAmountToken.precision,
              undefined,
              false,
              {
                floor: false,
              },
            )
            amountSymbol = vAmountToken && vAmountToken.symbol.slice(2)
          } else {
            const amountToken = tokenMap[idIndex[operation.tokenIn]]
            amount = getValuePrecisionThousand(
              sdk.toBig(operation.amountIn ?? 0).div('1e' + amountToken.decimals).abs(),
              amountToken.precision,
              amountToken.precision,
              undefined,
              false,
              {
                floor: false,
              },
            )
            amountSymbol = amountToken && amountToken.symbol
          }
          return {
            isShow: true,
            detail: {
              type: operation.operateType,
              time: operation && operation.createdAt,
              statusColor,
              statusLabel,
              statusType,
              amount: amount,
              amountSymbol: amountSymbol
            },
          }
        }
        case 'VAULT_CLOSE_OUT': {
          const profit =
            (operation as any).accountType === 0 
            ? (operation?.totalEquity && operation?.Collateral
              ? sdk.toBig(operation?.totalEquity ?? 0).minus(operation?.Collateral ?? 0)
              : undefined)
            : (operation as any)?.profit as string
          const outTokenInfo = tokenMap[idIndex[operation.tokenOut]]
          const amount = sdk.toBig(operation.amountOut).div('1e' + outTokenInfo.decimals)

          return {
            isShow: true,
            detail: {
              ...item,
              type: 'VAULT_CLOSE_OUT',
              vaultCloseDetail: {
                statusType,
                statusLabel,
                status: t(`labelVault${operation.status}`),
                amount: amount.gte(0)
                  ? getValuePrecisionThousand(
                      amount,
                      outTokenInfo.precision,
                      outTokenInfo.precision,
                      outTokenInfo.precision,
                      true,
                      { floor: true },
                    ) +
                    ' ' +
                    outTokenInfo.symbol
                  : EmptyValueTag,
                executionHistory: operation?.executionHistory,
                profit: profit
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      sdk.toBig(profit).times(forexMap[currency] ?? 0),
                      2,
                      2,
                      2,
                      true,
                      { floor: true },
                    )
                  : EmptyValueTag,
                profitPercent:
                  profit && Number(operation?.Collateral ?? 0)
                    ? numberFormat(new Decimal(profit.toString()).div(operation?.Collateral).times(100).toString(), {fixed: 2}) + '%'
                    : EmptyValueTag,
                usdValue: operation?.totalBalance
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      sdk.toBig(operation?.totalBalance ?? 0).times(forexMap[currency] ?? 0),
                      2,
                      2,
                      2,
                      true,
                      { floor: true },
                    )
                  : EmptyValueTag,
                usdDebt: operation?.totalDebt
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      sdk.toBig(operation?.totalDebt ?? 0).times(forexMap[currency] ?? 0),
                      2,
                      2,
                      2,
                      true,
                      { floor: true },
                    )
                  : EmptyValueTag,
                usdEquity: operation?.totalEquity
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      sdk.toBig(operation?.totalEquity ?? 0).times(forexMap[currency] ?? 0),
                      2,
                      2,
                      2,
                      true,
                      { floor: true },
                    )
                  : EmptyValueTag,
                forexMap,
                tokenSymbol: outTokenInfo.symbol,
                isForcedLiqudation:
                  (item.raw_data.operation.operateSubType as string) === 'VAULT_FORCE_SETTLEMENT' ||
                  (item.raw_data.operation.operateSubType as string) === 'VAULT_FORCE_WITHDRAW',
              },
            },
          }
        }
        case 'VAULT_TRADE': {
          const vTokenSellInfo = (vaultTokenMap && vaultIdIndex) ? vaultTokenMap[vaultIdIndex[order.tokenS]] : undefined
          const vTokenBuyInfo = (vaultTokenMap && vaultIdIndex) ? vaultTokenMap[vaultIdIndex[order.tokenB]] : undefined

          return {
            isShow: true,
            detail: {
              type: 'VAULT_TRADE',
              statusColor,
              statusLabel,
              statusType,
              fromSymbol: vTokenSellInfo && vTokenSellInfo.symbol.slice(2),
              toSymbol: vTokenBuyInfo && vTokenBuyInfo.symbol.slice(2),
              placedAmount: vTokenSellInfo && getValuePrecisionThousand(
                sdk.toBig(order.amountS).div('1e' + vTokenSellInfo.decimals),
                vTokenSellInfo.precision,
                vTokenSellInfo.precision,
                undefined,
                false,
                {
                  floor: false,
                },
              ),
              executedAmount: vTokenSellInfo && getValuePrecisionThousand(
                sdk.toBig(order.fillAmountS).div('1e' + vTokenSellInfo.decimals),
                vTokenSellInfo.precision,
                vTokenSellInfo.precision,
                undefined,
                false,
                {
                  floor: false,
                },
              ),
              executedRate:
                sdk.toBig(order.fillAmountS).div(order.amountS).multipliedBy('100').toFixed(2) +
                '%',
              convertedAmount: vTokenBuyInfo && getValuePrecisionThousand(
                sdk.toBig(order.fillAmountB).div('1e' + vTokenBuyInfo.decimals),
                vTokenBuyInfo.precision,
                vTokenBuyInfo.precision,
                undefined,
                false,
                {
                  floor: false,
                },
              ),
              price: order.price,
              feeSymbol: vTokenBuyInfo && vTokenBuyInfo.symbol.slice(2),
              feeAmount: vTokenBuyInfo && getValuePrecisionThousand(
                sdk.toBig(order.fee).div('1e' + vTokenBuyInfo.decimals),
                vTokenBuyInfo.precision,
                vTokenBuyInfo.precision,
                undefined,
                false,
                {
                  floor: false,
                },
              ),
              time: order.createdAt,
            },
          }
        }
        case 'VAULT_CONVERT': {
          const executionHistory = (operation as any).executionHistory as string[]
          const dustList : {
            symbol: string;
            coinJSON: any;
            amount: string;
            amountRaw: string;
            valueInCurrency: string | undefined;
            valueInCurrencyRaw: string | undefined;
            buyAmount: string | undefined;
          }[] = executionHistory.map(item => {
            const itemObj = JSON.parse(item)
            const {
              tokenIn,
              amountIn,
              amountOut,
              tokenOut,
            } = itemObj
            const vTokenSellInfo = vaultTokenMap[vaultIdIndex[tokenIn]]
            const vTokenBuyInfo = vaultTokenMap[vaultIdIndex[tokenOut]]
            const amount = numberFormat(utils.formatUnits(amountIn, vTokenSellInfo.decimals), {fixed: vTokenSellInfo.precision, removeTrailingZero: true})
            const buyAmount = numberFormat(utils.formatUnits(amountOut, vTokenBuyInfo.decimals), {fixed: vTokenBuyInfo.precision, removeTrailingZero: true})
            const sellTokenPrice = vaultTokenPrices[vTokenSellInfo.symbol]
            return {
              symbol: vTokenSellInfo.symbol.slice(2),
              coinJSON: coinJson[vTokenSellInfo.symbol.slice(2)],
              amount,
              amountRaw: amountIn,
              valueInCurrency: fiatNumberDisplay(
                getValueInCurrency(new Decimal(amount).times(sellTokenPrice).toString()),
                currency
              ),
              valueInCurrencyRaw: getValueInCurrency(new Decimal(amount).times(sellTokenPrice).toString()),
              buyAmount,
            }
          })

          return {
            isShow: true,
            detail: {
              type: 'VAULT_CONVERT',
              statusColor,
              statusLabel,
              statusType,
              status: operation.status === sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED ? 'success' : operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED ? 'failed' : 'processing',
              totalValueInCurrency: fiatNumberDisplay(numberStringListSum(dustList.map(dust => dust.valueInCurrencyRaw ?? '0')), currency),
              convertedInUSDT: numberFormat(numberStringListSum(dustList.map(dust => dust.valueInCurrencyRaw ?? '0')), {fixed: 2}),
              repaymentInUSDT: numberFormat(numberStringListSum(dustList.map(dust => dust.buyAmount ?? '0')), {fixed: 2}), 
              time: operation.createdAt,
              dusts: dustList,
            },
          }
        }

        default: {
          throw 'err'
        }
      }
    })
  }
  return {
    getVaultOrderList,
    vaultOrderData,
    totalNum,
    showLoading,
    onItemClick,
    vaultOperationDetail: detail.isShow ? detail.detail : undefined,
    openVaultDetail: detail.isShow,
    onVaultDetailClose: () =>
      setShowDetail({
        isShow: false,
      }),
  }
}