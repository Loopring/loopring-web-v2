import { useState } from 'react'

import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { TransactionStatus, RawDataTransactionItem, RawDataTradeItem } from '@loopring-web/component-lib'

import { FilledType, TxStatus, UserTrade } from 'loopring-sdk'
import { TransactionTradeTypes } from '@loopring-web/component-lib';
import { LoopringAPI } from 'stores/apis/api'

export function useGetTrades() {

    const { accountId, apiKey } = useAccount()

    const [userTrades, setUserTrades] = useState<RawDataTradeItem[]>()

    useCustomDCEffect(async() => {

        if (!LoopringAPI.userAPI || !accountId || !apiKey) {
            return
        }

        const response = await LoopringAPI.userAPI.getUserTrades({accountId: accountId}, apiKey)

        let userTrades: RawDataTradeItem[] = []

        response.userTrades.forEach((item: UserTrade, index: number) => {
        })

        setUserTrades(userTrades)

    }, [accountId, apiKey, LoopringAPI.userAPI])

    return {
        userTrades,
    }
}
