import React from 'react'
import { TradeTypes, TradeStatus } from '@loopring-web/common-resources'
import { OrderHistoryRawDataItem } from '@loopring-web/component-lib'
import { useAccount } from 'stores/account';
import { LoopringAPI } from 'api_wrapper'
import { volumeToCount, volumeToCountAsBigNumber } from 'hooks/help'
import { GetOrdersRequest, Side } from 'loopring-sdk'
import store from 'stores'

export const useOrderList = () => {
    const [orderOriginalData, setOrderOriginalData] = React.useState<OrderHistoryRawDataItem[]>([])
    const [totalNum, setTotalNum] = React.useState(0)
    const [showLoading, setShowLoading] = React.useState(false)
    const { account: {accountId, apiKey} } = useAccount()
    const { tokenMap: { marketArray } } = store.getState()
    const { ammMap: { ammMap } } = store.getState().amm

    const ammPairList = ammMap 
        ? Object.keys(ammMap)
        : []
    const jointPairs = (marketArray || []).concat(ammPairList)

    const getOrderList = React.useCallback(async (props: Omit<GetOrdersRequest, 'accountId'> ) => {
        if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
            setShowLoading(true)
            const userOrders = await LoopringAPI.userAPI.getOrders({
                ...props,
                accountId,
            }, apiKey)
            if (userOrders && Array.isArray(userOrders.orders)) {
                setTotalNum(userOrders.totalNum)
                console.log(userOrders.orders[0])
                setOrderOriginalData(userOrders.orders.map(o => {
                    const { baseAmount, quoteAmount, baseFilled, quoteFilled } = o.volumes

                    const marketList = o.market.split('-')
                    // due to AMM case, we cannot use first index
                    const side = o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
                    const isBuy = side === TradeTypes.Buy
                    const tokenFirst = marketList[marketList.length - 2]
                    const tokenLast = marketList[marketList.length - 1]
                    const baseToken = isBuy ? tokenLast : tokenFirst
                    const quoteToken = isBuy ? tokenFirst : tokenLast
                    const baseValue = isBuy ? volumeToCountAsBigNumber(quoteToken, quoteAmount)?.times(o.price) : volumeToCountAsBigNumber(baseToken, baseAmount)
                    const quoteValue = isBuy ? volumeToCountAsBigNumber(quoteToken, quoteAmount) : volumeToCountAsBigNumber(baseToken, baseAmount)?.times(o.price)

                    return ({
                        market: o.market,
                        side: o.side === 'BUY' ? TradeTypes.Buy : TradeTypes.Sell,
                        orderType: o.orderType,
                        amount: {
                            from: {
                                key: baseToken,
                                value: baseValue as any
                            },
                            to: {
                                key: quoteToken,
                                value: quoteValue as any
                            }
                        },
                        // average: Number(o.price),
                        average: Number(volumeToCount(quoteToken, quoteFilled)) / Number(volumeToCount(baseToken, baseFilled)),
                        // filledAmount: {
                        //     from: {
                        //         key: baseToken,
                        //         // value: Number(baseFilled)
                        //         value: Number(volumeToCount(baseToken, baseFilled))
                        //     },
                        //     to: {
                        //         key: quoteToken,
                        //         value: Number(volumeToCount(quoteToken, quoteFilled))
                        //     }
                        // },
                        price: {
                            key: quoteToken,
                            value: Number(o.price)
                        },
                        time: o.validity.start * 1000,
                        status: o.status as unknown as TradeStatus,
                        detailTable: []
                    })
                }))
            }
            setShowLoading(false)
        }
    }, [accountId, apiKey])

    React.useEffect(() => {
        getOrderList({})
    }, [getOrderList])

    return {
        marketArray: jointPairs,
        getOrderList,
        rawData: orderOriginalData,
        totalNum,
        showLoading,
    }
}

