import React, { useEffect } from 'react'
import { TransactionTable, RawDataTransactionItem, TransactionTradeTypes, TransactionStatus } from '@loopring-web/component-lib'
import { WithTranslation, withTranslation } from 'react-i18next'
import store from 'stores'
import { LoopringAPI } from 'stores/apis/api'
import { volumeToCount } from 'hooks/help'
import { StylePaper } from '../../styled'

const TxPanel = withTranslation('common')((rest:WithTranslation<'common'>) => {
    const container = React.useRef(null);
    const [pageSize, setPageSize] = React.useState(10);
    const [txTableData, setTxTableData] = React.useState<RawDataTransactionItem[]>([]);

    const { accountId,apiKey } = store.getState().account;

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

    const getUserTxnList = React.useCallback(async () => {
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
                token: o.symbol,
                from: o.senderAddress,
                to: o.receiverAddress,
                amount: Number(volumeToCount(o.symbol, o.amount)),
                fee: {
                    unit: o.feeTokenSymbol || '',
                    value: Number(volumeToCount(o.symbol, o.feeAmount || 0))
                },
                memo: o.memo || '',
                time: o.timestamp,
                txnHash: o.hash,
                status: getTxnStatus(o.status),
                tradeType: TransactionTradeTypes.transfer
            }))
            const userDepositMapped = userTxnList[1].userDepositHistory.map(o => ({
                token: o.symbol,
                from: o.hash,
                to: 'My Loopring',
                amount: Number(volumeToCount(o.symbol, o.amount)),
                fee: {
                    unit: '',
                    value: 0
                },
                memo: '',
                time: o.timestamp,
                txnHash: o.txHash,
                status: getTxnStatus(o.status),
                tradeType: TransactionTradeTypes.deposit
            }))
            const userWithdrawMapped = userTxnList[2].userOnchainWithdrawalHistory.map((o => ({
                token: o.symbol,
                from: 'My Loopring',
                to: o.distributeHash,
                amount: Number(volumeToCount(o.symbol, o.amount)),
                fee: {
                    unit: o.feeTokenSymbol,
                    value: Number(volumeToCount(o.feeTokenSymbol, o.feeAmount))
                },
                memo: '',
                time: o.timestamp,
                txnHash: o.txHash,
                status: getTxnStatus(o.status),
                tradeType: TransactionTradeTypes.withdraw
            })))
            const mappingList = [...userTransferMapped, ...userDepositMapped, ...userWithdrawMapped]
            const sortedMappingList = mappingList.sort((a, b) => b.time - a.time)
            setTxTableData(sortedMappingList)
        }
    }, [accountId, apiKey])

    useEffect(() => {
        getUserTxnList()
    }, [getUserTxnList])

    React.useEffect(() => {
        // @ts-ignore
        let height = container?.current?.offsetHeight;
        if (height) {
            setPageSize(Math.floor((height - 120) / 44) - 2);
        }
    }, [container, pageSize]);

    return (
        <StylePaper ref={container}>
            <div className="title">Transactions</div>
            <div className="tableWrapper">
                <TransactionTable {...{
                    // rawData: txList,
                    rawData: txTableData,
                    pagination: {
                        pageSize: pageSize
                    },
                    showFilter: true,
                    ...rest
                }} />
            </div>
        </StylePaper>
    )
})

export default TxPanel
