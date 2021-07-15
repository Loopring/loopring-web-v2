import { useState } from 'react'

import { useAmmpoolAPI, useUserAPI } from "hooks/exchange/useApi"
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { OrderHistoryRawDataItem } from '@loopring-web/component-lib'

import { OrderDetail } from 'loopring-sdk'
import { TransactionTradeTypes } from '@loopring-web/component-lib/components/tableList/transactionsTable/Interface';

/*
    {
        from: {
            address: '0x5e8cxxxxxe741',
            env: 'Ethereum'
        },
        to: 'My Loopring',
        amount: 25987.09324,
        fee: {
            unit: 'ETH',
            value: 0.0993
        },
        memo: 'NoteNoteNoteNoteNoteNoteNote',
        time: 3,
        txnHash: '0x2b21xxxxxxx02',
        status: TransactionStatus.success
    },
 */

export function useGetTxs() {

    const { accountId, apiKey } = useAccount()

    const userApi = useUserAPI()

    const [orders, setOrders] = useState<OrderHistoryRawDataItem[]>()

    useCustomDCEffect(async() => {

        if (!userApi || !accountId || !apiKey) {
            return
        }

        const txs = await userApi.getOrders({ accountId }, apiKey)

        let orders: OrderHistoryRawDataItem[] = []

        txs.orders.forEach((item: OrderDetail, index: number) => {
        })

        setOrders(orders)

    }, [accountId, apiKey, userApi])

    return {
        orders,
    }
}
