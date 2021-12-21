import React from 'react'
import { TradeStatus, TradeTypes } from '@loopring-web/common-resources'
import { OrderHistoryRawDataItem, OrderHistoryTableDetailItem } from '@loopring-web/component-lib'
import { useAccount } from 'stores/account';
import { LoopringAPI } from 'api_wrapper'
import { volumeToCount, volumeToCountAsBigNumber } from 'hooks/help'
import { GetOrdersRequest, Side } from '@loopring-web/loopring-sdk'
import store from 'stores'
import BigNumber from 'bignumber.js';
import {TFunction} from 'react-i18next'
import {useWalletLayer2} from 'stores/walletLayer2'

export const useOrderList = () => {
    const [orderOriginalData, setOrderOriginalData] = React.useState<OrderHistoryRawDataItem[]>([])
    // const [orderDetailList, setOrderDetailList] = React.useState<OrderHistoryTableDetailItem[]>([])
    const [totalNum, setTotalNum] = React.useState(0)
    const [showLoading, setShowLoading] = React.useState(false)
    const [showDetailLoading, setShowDetailLoading] = React.useState(false)
    // const [openOrderList, setOpenOrderList] = React.useState<OrderHistoryRawDataItem[]>([])
    const {account: {accountId, apiKey}} = useAccount()
    const {tokenMap: {marketArray, tokenMap, marketMap}} = store.getState()
    const {ammMap: {ammMap}} = store.getState().amm
    const {sk: privateKey} = store.getState().account.eddsaKey
    const { updateWalletLayer2 } = useWalletLayer2()

    const ammPairList = ammMap
        ? Object.keys(ammMap)
        : []
    const jointPairs = (marketArray || []).concat(ammPairList)

    const getOrderList = React.useCallback(async (props: Omit<GetOrdersRequest, 'accountId'>) => {
        // const isOpenOrder = props.status && props.status === 'processing'
        if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
            setShowLoading(true)
            const userOrders = await LoopringAPI.userAPI.getOrders({
                ...props,
                accountId,
            }, apiKey)
            if (userOrders && Array.isArray(userOrders.orders)) {
                setTotalNum(userOrders.totalNum)
                const data = userOrders.orders.map(o => {
                    const {baseAmount, quoteAmount, baseFilled, quoteFilled} = o.volumes

                    const marketList = o.market.split('-')
                    if (marketList.length === 3) {
                        marketList.shift()
                    }
                    // due to AMM case, we cannot use first index
                    const side = o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
                    const isBuy = side === TradeTypes.Buy
                    // const tokenFirst = marketList[marketList.length - 2]
                    // const tokenLast = marketList[marketList.length - 1]
                    const [tokenFirst, tokenLast] = marketList
                    const baseToken = isBuy ? tokenLast : tokenFirst
                    const quoteToken = isBuy ? tokenFirst : tokenLast
                    const actualBaseFilled = (isBuy ? quoteFilled : baseFilled) as any
                    const actualQuoteFilled = (isBuy ? baseFilled : quoteFilled) as any
                    const baseValue = isBuy ? volumeToCount(baseToken, quoteAmount) : volumeToCount(baseToken, baseAmount)
                    const quoteValue = isBuy ? volumeToCount(quoteToken, baseAmount) : (volumeToCount(baseToken, baseAmount) || 0) * Number(o.price || 0)
                    const baseVolume = volumeToCountAsBigNumber(baseToken, actualBaseFilled)
                    const quoteVolume = volumeToCountAsBigNumber(quoteToken, actualQuoteFilled)
                    const quotefilledValue = volumeToCount(quoteToken, actualQuoteFilled)

                    const average = isBuy
                        ? baseVolume?.div(quoteVolume || new BigNumber(1)).toNumber() || 0
                        : quoteVolume?.div(baseVolume || new BigNumber(1)).toNumber() || 0
                    const completion = (quotefilledValue || 0)  / (quoteValue || 1)

                    const precisionFrom = tokenMap ? (tokenMap as any)[baseToken]?.precisionForOrder : undefined
                    const precisionTo = tokenMap ? (tokenMap as any)[quoteToken]?.precisionForOrder : undefined
                    const precisionMarket = marketMap ? marketMap[o.market]?.precisionForPrice : undefined
                    return ({
                        market: o.market,
                        side: o.side === 'BUY' ? TradeTypes.Buy : TradeTypes.Sell,
                        orderType: o.orderType,
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
                            }
                        },
                        average: average,
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
                        hash: o.hash,
                        orderId: o.clientOrderId,
                        tradeChannel: o.tradeChannel,
                        completion: completion,
                        precisionMarket: precisionMarket,
                    })
                })
                // if (isOpenOrder) {
                //     setOpenOrderList(data)
                // } else {
                    setOrderOriginalData(data)
                // } 
            }
            setShowLoading(false)
        }
    }, [accountId, apiKey])

    const cancelOrder = React.useCallback(async({orderHash, clientOrderId}) => {
        if (LoopringAPI && LoopringAPI.userAPI && accountId && privateKey && apiKey) {
            // console.log({
            //     accountId,
            //     orderHash,
            // clientOrderId, privateKey, apiKey})
            setShowLoading(true)
            await LoopringAPI.userAPI.cancelOrder({
                accountId,
                orderHash,
                clientOrderId,
            }, privateKey, apiKey)
            setTimeout(()=> {
                getOrderList({
                    status: 'processing'
                })
            }, 100)
            updateWalletLayer2()
            // setShowLoading(false)
        }
    }, [accountId, apiKey, privateKey])

    // const getOrderDetail = React.useCallback(async (orderHash: string, t: TFunction) => {
    //     if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
    //         setShowDetailLoading(true)
    //         const orderDetail = await LoopringAPI.userAPI.getOrderDetails({
    //             accountId,
    //             orderHash,
    //         }, apiKey)
    //         const formattedData = [orderDetail.orderDetail].map(o => {
    //             const {baseAmount, quoteAmount, baseFilled, quoteFilled, fee} = o.volumes
    //             const marketList = o.market.split('-')
    //             if (marketList.length === 3) {
    //                 marketList.shift()
    //             }
    //             // due to AMM case, we cannot use first index
    //             const side = o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
    //             const isBuy = side === TradeTypes.Buy
    //             const role = isBuy ? t('labelOrderDetailMaker') : t('labelOrderDetailTaker')
    //             const [tokenFirst, tokenLast] = marketList
    //             const baseToken = isBuy ? tokenLast : tokenFirst
    //             const quoteToken = isBuy ? tokenFirst : tokenLast
    //             const baseValue = isBuy ? volumeToCount(baseToken, quoteAmount) : volumeToCount(baseToken, baseAmount)
    //             const quoteValue = isBuy ? volumeToCount(quoteToken, baseAmount) : (volumeToCount(baseToken, baseAmount) || 0) * Number(o.price || 0)
    //             const actualBaseFilled = isBuy ? quoteFilled : baseFilled
    //             const actualQuoteFilled = isBuy ? baseFilled : quoteFilled
    //             const baseVolume = volumeToCountAsBigNumber(baseToken, actualBaseFilled)
    //             const quoteVolume = volumeToCountAsBigNumber(quoteToken, actualQuoteFilled)
    //             const filledPrice = baseVolume?.div(quoteVolume || new BigNumber(1)).toNumber() || 0
    //             const feeValue = volumeToCountAsBigNumber(quoteToken, fee)?.toNumber() || 0

    //             const precisionFrom = tokenMap ? (tokenMap as any)[baseToken]?.precisionForOrder : undefined
    //             const precisionTo = tokenMap ? (tokenMap as any)[quoteToken]?.precisionForOrder : undefined
    //             const precisionMarket = marketMap ? marketMap[o.market]?.precisionForPrice : undefined
    //             const precisionFee = tokenMap ? (tokenMap as any)[quoteToken]?.precisionForOrder : undefined

    //             return ({
    //                 amount: {
    //                     from: {
    //                         key: baseToken,
    //                         value: baseValue as any,
    //                         precision: precisionFrom,
    //                     },
    //                     to: {
    //                         key: quoteToken,
    //                         value: quoteValue as any,
    //                         precision: precisionTo,
    //                     }
    //                 },
    //                 filledPrice: {
    //                     value: filledPrice,
    //                     precision: precisionMarket,
    //                 } ,
    //                 fee: {
    //                     key: quoteToken,
    //                     value: feeValue,
    //                     precision: precisionFee,
    //                 },
    //                 role: role,
    //                 time: o.validity.start * 1000,
    //                 volume: quoteVolume?.toNumber(),
    //                 orderId: o.clientOrderId,
    //             })
    //         })
    //         setOrderDetailList(formattedData)
    //         setShowDetailLoading(false)
    //     }
    // }, [accountId, apiKey, marketMap, tokenMap])
    
    const clearData = React.useCallback(() => {
        setOrderOriginalData([])
    }, [])

    return {
        marketArray: jointPairs,
        getOrderList,
        rawData: orderOriginalData,
        clearRawData: clearData,
        // openOrderList,
        totalNum,
        showLoading,
        showDetailLoading,
        // getOrderDetail,
        // orderDetailList,
        cancelOrder,
    }
}
