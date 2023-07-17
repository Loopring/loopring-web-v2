import React from 'react'
import { RawDataTradeItem } from '@loopring-web/component-lib'

import { Side, toBig, GetUserTradesRequest } from '@loopring-web/loopring-sdk'
import {
  store,
  LoopringAPI,
  useAccount,
  volumeToCount,
  volumeToCountAsBigNumber,
} from '../../index'
import { TradeTypes } from '@loopring-web//common-resources'

export function useGetOrderHistorys() {
  const [userTrades, setUserTrades] = React.useState<RawDataTradeItem[]>([])
  const [showLoading, setShowLoading] = React.useState(true)
  const [userOrderDetailList, setUserOrderDetailList] = React.useState<any[]>([])

  const {
    account: { accountId, apiKey },
  } = useAccount()

  const tokenMap = store.getState().tokenMap.tokenMap

  const getUserTrade = React.useCallback(
    async (props?: Omit<GetUserTradesRequest, 'accountId'>) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey && tokenMap) {
        const userTrades = await LoopringAPI.userAPI.getUserTrades(
          {
            ...props,
            accountId,
          },
          apiKey,
        )
        return userTrades
      }
    },
    [accountId, apiKey, tokenMap],
  )

  const getUserOrderDetailTradeList = React.useCallback(
    async (props?: Omit<GetUserTradesRequest, 'accountId'>) => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey && tokenMap) {
        const userTrades = await getUserTrade({ ...props })
        if (userTrades && userTrades.userTrades) {
          setUserOrderDetailList(
            userTrades.userTrades.map((o) => {
              const marketList = o.market.split('-')
              // due to AMM case, we cannot use first index
              // const side = o.side === 'BUY' ? TradeTypes.Buy : TradeTypes.Sell
              const tokenFirst = marketList[marketList.length - 2]
              const tokenLast = marketList[marketList.length - 1]
              const baseToken = o.side === 'BUY' ? tokenFirst : tokenLast
              const quoteToken = o.side === 'BUY' ? tokenLast : tokenFirst

              const volumeToken = o.side === 'BUY' ? baseToken : quoteToken
              const volume = volumeToCount(volumeToken, o.volume)
              const feeKey = o.side === 'BUY' ? baseToken : quoteToken

              return {
                market: o.market,
                amount: volume,
                filledPrice: o.price,
                time: Number(o.tradeTime),
                volumeToken,
                fee: {
                  key: feeKey,
                  value: o.fee ? volumeToCount(feeKey, o.fee) : undefined,
                },
              }
            }),
          )
        }
      }
    },
    [accountId, apiKey, getUserTrade, tokenMap],
  )

  const getUserTradeList = React.useCallback(async () => {
    if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey && tokenMap) {
      const userTrades = await getUserTrade()

      if (userTrades && userTrades.userTrades) {
        setUserTrades(
          // @ts-ignore
          userTrades.userTrades.map((o) => {
            const marketList = o.market.split('-')
            // due to AMM case, we cannot use first index
            const side = o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
            const tokenFirst = marketList[marketList.length - 2]
            const tokenLast = marketList[marketList.length - 1]
            const baseToken = side === TradeTypes.Buy ? tokenFirst : tokenLast
            const quoteToken = side === TradeTypes.Buy ? tokenLast : tokenFirst

            // const amt = toBig(o.volume).times(o.price).toString()

            const feeKey = o.side === Side.Buy ? baseToken : quoteToken

            return {
              side: side,
              price: {
                key: baseToken,
                // value: StringToNumberWithPrecision(o.price, baseToken)
                value: toBig(o.price).toNumber(),
              },
              fee: {
                key: feeKey,
                // value: VolToNumberWithPrecision(o.fee, quoteToken),
                value: feeKey ? volumeToCount(feeKey, o.fee)?.toFixed(6) : undefined,
              },
              time: Number(o.tradeTime),
              amount: {
                from: {
                  key: baseToken,
                  // value: VolToNumberWithPrecision(o.volume, baseToken),
                  value: baseToken ? volumeToCount(baseToken, o.volume) : undefined,
                },
                to: {
                  key: quoteToken,
                  // value: VolToNumberWithPrecision(amt, quoteToken)
                  value: baseToken
                    ? volumeToCountAsBigNumber(baseToken, o.volume)?.times(o.price).toNumber()
                    : undefined,
                },
              },
            }
          }),
        )
        setShowLoading(false)
      }
    }
  }, [accountId, apiKey, getUserTrade, tokenMap])

  React.useEffect(() => {
    getUserTradeList()
  }, [getUserTradeList])

  // useCustomDCEffect(async() => {

  //     if (!LoopringAPI.userAPI || !accountId || !apiKey) {
  //         return
  //     }

  //     const response = await LoopringAPI.userAPI.getUserTrades({accountId: accountId}, apiKey)

  //     let userTrades: RawDataTradeItem[] = []

  //     response.userTrades.forEach((item: UserTrade, index: number) => {
  //     })

  //     setUserTrades(userTrades)

  // }, [accountId, apiKey, LoopringAPI.userAPI])

  return {
    userTrades,
    showLoading,
    userOrderDetailList,
    getUserOrderDetailTradeList,
  }
}
