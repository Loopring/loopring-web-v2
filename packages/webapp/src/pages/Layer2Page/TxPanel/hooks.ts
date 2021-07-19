import { useState, useCallback } from 'react'
// import { useAmmpoolAPI, useUserAPI } from "hooks/exchange/useApi"
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { TransactionStatus, RawDataTransactionItem } from '@loopring-web/component-lib'
import { volumeToCount } from 'hooks/help'
import { LoopringAPI } from 'stores/apis/api'

import { TransactionTradeTypes } from '@loopring-web/component-lib';

export function useGetTxs() {

    const { accountId, apiKey } = useAccount()

    // const userApi = useUserAPI()

    const [txs, setTxs] = useState<RawDataTransactionItem[]>([])

    const getTxnStatus = (status: string) => 
        status === ''
        ? TransactionStatus.processing :
        status === 'processed'
            ? TransactionStatus.processed
            : status === 'processing'
                ? TransactionStatus.processing 
                : status === 'received' 
                    ? TransactionStatus.received 
                    : TransactionStatus.failed

    const getUserTxnList = useCallback(async () => {
        if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
            const userTxnList = await Promise.all([
                LoopringAPI.userAPI.getUserTranferList({
                    accountId,
                }, apiKey),
                LoopringAPI.userAPI.getUserDepositHistory({
                    accountId,
                }, apiKey),
                LoopringAPI.userAPI.getUserOnchainWithdrawalHistory({
                    accountId,
                }, apiKey)
            ])
            const userTransferMapped = userTxnList[0].userTransfers.map(o => ({
                side: TransactionTradeTypes.transfer,
                // token: o.symbol,
                // from: o.senderAddress,
                // to: o.receiverAddress,
                amount: Number(volumeToCount(o.symbol, o.amount)),
                fee: {
                    unit: o.feeTokenSymbol || '',
                    value: Number(volumeToCount(o.symbol, o.feeAmount || 0))
                },
                memo: o.memo || '',
                time: o.timestamp,
                txnHash: o.hash,
                status: getTxnStatus(o.status),
                // tradeType: TransactionTradeTypes.transfer
            }))
            const userDepositMapped = userTxnList[1].userDepositHistory.map(o => ({
                side: TransactionTradeTypes.deposit,
                symbol: o.symbol,
                // token: o.symbol,
                // from: o.hash,
                // to: 'My Loopring',
                amount: Number(volumeToCount(o.symbol, o.amount)),
                fee: {
                    unit: '',
                    value: 0
                },
                memo: '',
                time: o.timestamp,
                txnHash: o.txHash,
                status: getTxnStatus(o.status),
                // tradeType: TransactionTradeTypes.deposit
            }))
            const userWithdrawMapped = userTxnList[2].userOnchainWithdrawalHistory.map((o => ({
                side: TransactionTradeTypes.withdraw,
                // token: o.symbol,
                // from: 'My Loopring',
                // to: o.distributeHash,
                amount: Number(volumeToCount(o.symbol, o.amount)),
                fee: {
                    unit: o.feeTokenSymbol,
                    value: Number(volumeToCount(o.feeTokenSymbol, o.feeAmount))
                },
                memo: '',
                time: o.timestamp,
                txnHash: o.txHash,
                status: getTxnStatus(o.status),
                // tradeType: TransactionTradeTypes.withdraw
            })))
            const mappingList = [...userTransferMapped, ...userDepositMapped, ...userWithdrawMapped]
            const sortedMappingList = mappingList.sort((a, b) => b.time - a.time)
            setTxs(sortedMappingList)
        }
    }, [accountId, apiKey])

    useCustomDCEffect(() => {
        getUserTxnList()
    }, [getUserTxnList])

    return {
        txs,
    }
}
