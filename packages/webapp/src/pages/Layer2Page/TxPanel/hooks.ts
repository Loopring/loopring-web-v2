import { useState } from 'react'

import { useAmmpoolAPI, useUserAPI } from "hooks/exchange/useApi"
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { TransactionStatus, RawDataTransactionItem } from '@loopring-web/component-lib'

import { TxStatus } from 'loopring-sdk'
import { TransactionTradeTypes } from '@loopring-web/component-lib/components/tableList/transactionsTable/Interface';

export function useGetTxs() {

    const { accountId, apiKey } = useAccount()

    const userApi = useUserAPI()

    const [txs, setTxs] = useState<RawDataTransactionItem[]>()

    useCustomDCEffect(async() => {

        if (!userApi || !accountId || !apiKey) {
            return
        }

        const txs = await userApi.getUserTranferList({ accountId }, apiKey)

        let tmpTx: RawDataTransactionItem[] = []

        txs.userTransfers.forEach((item: any, index: number) => {
            tmpTx.push({from: {
                    address: item.senderAddress,
                    env: ''
                },
                to: {
                    address: item.receiverAddress,
                    env: ''
                },
                amount: item.amount,
                fee: {
                    unit: item.feeTokenSymbol,
                    value: item.feeAmount
                },
                memo: item.symbol,
                time: item.timestamp,
                txnHash: item.hash,
                status: item.status,
                token:item.token,
                tradeType:TransactionTradeTypes.allTypes,
            })
        })

        setTxs(tmpTx)

    }, [accountId, apiKey, userApi])

    return {
        txs,
    }
}
