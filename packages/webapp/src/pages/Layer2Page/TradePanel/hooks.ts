import { useState } from 'react'

import { useAmmpoolAPI, useUserAPI } from "hooks/exchange/useApi"
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { TransactionStatus, RawDataTransactionItem, RawDataTradeItem } from '@loopring-web/component-lib'

import { FilledType, TxStatus, UserTrade } from 'loopring-sdk'
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

export function useGetTrades() {

    const { accountId, apiKey } = useAccount()

    const userApi = useUserAPI()

    const [userTrades, setUserTrades] = useState<RawDataTradeItem[]>()

    useCustomDCEffect(async() => {

        if (!userApi || !accountId || !apiKey) {
            return
        }

        const response = await userApi.getUserTrades({accountId: accountId}, apiKey)

        let userTrades: RawDataTradeItem[] = []

        response.userTrades.forEach((item: UserTrade, index: number) => {
        })

        setUserTrades(userTrades)

    }, [accountId, apiKey, userApi])

    return {
        userTrades,
    }
}
