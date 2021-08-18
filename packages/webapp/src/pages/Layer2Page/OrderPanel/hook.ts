import React from 'react'
import { TradeTypes, TradeStatus } from '@loopring-web/common-resources'
import { OrderHistoryRawDataItem } from '@loopring-web/component-lib'
import { useAccount } from 'stores/account';
import { LoopringAPI } from 'api_wrapper'
import { volumeToCount } from 'hooks/help'
import { GetOrdersRequest } from 'loopring-sdk'

export const useOrderList = () => {
    const [orderOriginalData, setOrderOriginalData] = React.useState<OrderHistoryRawDataItem[]>([])
    const [totalNum, setTotalNum] = React.useState(0)
    const [showLoading, setShowLoading] = React.useState(false)
    const { account: {accountId, apiKey} } = useAccount()

    const getOrderList = React.useCallback(async (props: Omit<GetOrdersRequest, 'accountId'> ) => {
        if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
            setShowLoading(true)
            const userOrders = await LoopringAPI.userAPI.getOrders({
                ...props,
                accountId,
            }, apiKey)
            if (userOrders && Array.isArray(userOrders.orders)) {
                setTotalNum(userOrders.totalNum)
                setOrderOriginalData(userOrders.orders.map(o => {
                    const marketList = o.market.split('-')
                    // due to AMM case, we cannot use first index
                    const baseToken = marketList[marketList.length - 2]
                    const quoteToken = marketList[marketList.length - 1]
                    const { baseAmount, quoteAmount, baseFilled, quoteFilled } = o.volumes

                    return ({
                        side: o.side === 'BUY' ? TradeTypes.Buy : TradeTypes.Sell,
                        amount: {
                            from: {
                                key: baseToken,
                                // value: Number(baseAmount)
                                value: Number(volumeToCount(baseToken, baseAmount))
                            },
                            to: {
                                key: quoteToken,
                                value: Number(volumeToCount(quoteToken, quoteAmount))
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
        getOrderList,
        rawData: orderOriginalData,
        totalNum,
        showLoading,
    }
}

