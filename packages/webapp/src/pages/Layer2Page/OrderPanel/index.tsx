
import React, { useEffect } from 'react'
import { OrderHistoryTable, OrderHistoryRawDataItem } from '@loopring-web/component-lib'
import { TradeTypes } from '@loopring-web/component-lib/static-resource'
import { WithTranslation, withTranslation } from 'react-i18next'
import store from 'stores'
import { LoopringAPI } from 'stores/apis/api'
import { volumeToCount } from 'hooks/help'
import { StylePaper } from '../../styled'



const OrderPanel = withTranslation('common')((rest: WithTranslation) => {
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(10);
    const [orderOriginalData, setOrderOriginalData] = React.useState<OrderHistoryRawDataItem[]>([])

    const { accountId,apiKey } = store.getState().account;

    useEffect(() => {
        (async function getUserApi () {
            if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
                const userOrders = await LoopringAPI.userAPI.getOrders({
                    accountId,
                }, apiKey)
                if (userOrders && Array.isArray(userOrders.orders) && !!userOrders.orders.length) {
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
                            filledAmount: {
                                from: {
                                    key: baseToken,
                                    // value: Number(baseFilled)
                                    value: Number(volumeToCount(baseToken, baseFilled))
                                },
                                to: {
                                    key: quoteToken,
                                    value: Number(volumeToCount(quoteToken, quoteFilled))
                                }
                            },
                            filledPrice: {
                                key: quoteToken,
                                value: Number(o.price)
                            },
                            time: o.validity.start * 1000,
                            status: o.status,
                            detailTable: []
                        })
                    }))
                }
            }
        })()
    }, [accountId, apiKey])

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 2);
        }
    }, [container, pageSize]);

    return (
        <>
            <StylePaper ref={container}>
                <div className="title">Order History</div>
                <div className="tableWrapper">
                    <OrderHistoryTable {...{
                        pagination: {
                            pageSize: pageSize
                        },
                        rawData: orderOriginalData,
                        showFilter: true,
                        ...rest
                    }} />
                </div>
            </StylePaper>
        </>
    )
})

export default OrderPanel
