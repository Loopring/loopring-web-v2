import { useState } from 'react'

import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { OrderHistoryRawDataItem } from '@loopring-web/component-lib'

import { OrderDetail } from 'loopring-sdk'
import { TransactionTradeTypes } from '@loopring-web/component-lib';
import { LoopringAPI } from 'stores/apis/api'

export function useGetTxs() {

    const { accountId, apiKey } = useAccount()

    const [orders, setOrders] = useState<OrderHistoryRawDataItem[]>()

    useCustomDCEffect(async() => {

        if (!LoopringAPI.userAPI || !accountId || !apiKey) {
            return
        }

        const txs = await LoopringAPI.userAPI.getOrders({ accountId }, apiKey)

        let orders: OrderHistoryRawDataItem[] = []

        txs.orders.forEach((item: OrderDetail, index: number) => {
        })

        setOrders(orders)

    }, [accountId, apiKey, LoopringAPI.userAPI])

    return {
        orders,
    }
}
