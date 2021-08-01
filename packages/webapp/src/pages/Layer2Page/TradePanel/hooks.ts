import React from 'react'

import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { TransactionStatus, RawDataTransactionItem, RawDataTradeItem } from '@loopring-web/component-lib'

import { FilledType, TxStatus, UserTrade } from 'loopring-sdk'
import { TransactionTradeTypes } from '@loopring-web/component-lib';
import { LoopringAPI } from 'stores/apis/api'
import store from 'stores'
import { TradeTypes } from '@loopring-web/common-resources'
import { toBig, Side } from 'loopring-sdk'
import { volumeToCount, volumeToCountAsBigNumber } from 'hooks/help'

export function useGetTrades() {
    const [userTrades, setUserTrades] = React.useState<RawDataTradeItem[]>([])
    const [showLoading, setShowLoading] = React.useState(true)
    const { account:{accountId, apiKey} } = useAccount()

    const tokenMap = store.getState().tokenMap.tokenMap

    const getUserTradeList = React.useCallback(async () => {
        if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey && tokenMap) {
            const userTrades = await LoopringAPI.userAPI.getUserTrades({
                accountId,
            }, apiKey)

            if (userTrades && userTrades.userTrades) {
                // @ts-ignore
                setUserTrades(userTrades.userTrades.map(o => {
                    const marketList = o.market.split('-')
                    // due to AMM case, we cannot use first index
                    const baseToken = marketList[marketList.length - 2]
                    const quoteToken = marketList[marketList.length - 1]

                    // const amt = toBig(o.volume).times(o.price).toString()

                    const feeKey = o.side === Side.Buy ? baseToken : quoteToken


                    return ({
                        side: o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell ,
                        price: {
                            key: baseToken,
                            // value: StringToNumberWithPrecision(o.price, baseToken)
                            value: toBig(o.price).toNumber()
                        },
                        fee: {
                            key: feeKey,
                            // value: VolToNumberWithPrecision(o.fee, quoteToken),
                            value: feeKey ? volumeToCount(feeKey, o.fee)?.toFixed(6) : undefined
                        },
                        time: Number(o.tradeTime),
                        amount: {
                            from: {
                            key: baseToken,
                            // value: VolToNumberWithPrecision(o.volume, baseToken),
                            value: baseToken ? volumeToCount(baseToken, o.volume) : undefined
                            },
                            to: {
                            key: quoteToken,
                            // value: VolToNumberWithPrecision(amt, quoteToken)
                            value: baseToken ? volumeToCountAsBigNumber(baseToken, o.volume)?.times(o.price).toNumber() : undefined
                            }
                        }
                    })
                }))
                setShowLoading(false)
            }
        }
    }, [accountId, apiKey, tokenMap])

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
    }
}
