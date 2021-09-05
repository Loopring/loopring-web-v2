import React, { useCallback, useState } from 'react'
import { useAccount } from 'stores/account/hook'
import {
    AmmSideTypes,
    RawDataAmmItem,
    RawDataTradeItem,
    RawDataTransactionItem,
    TransactionStatus
} from '@loopring-web/component-lib'
import { volumeToCount, volumeToCountAsBigNumber } from 'hooks/help'
import { LoopringAPI } from 'api_wrapper'
import store from 'stores'
import { getShowStr, TradeTypes } from '@loopring-web/common-resources'
import { AmmTxType, Side, toBig, UserTxTypes } from 'loopring-sdk'

export type TxsFilterProps = {
    // accountId: number;
    tokenSymbol?: string;
    start?: number;
    end?: number;
    offset?: number;
    limit?: number;
    types?: UserTxTypes[] | string;
}

export function useGetTxs() {

    const {account: {accountId, apiKey}} = useAccount()

    const [txs, setTxs] = useState<RawDataTransactionItem[]>([])
    const [txsTotal, setTxsTotal] = useState(0)
    const [showLoading, setShowLoading] = useState(false)

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

    const getUserTxnList = useCallback(async ({
                                                  tokenSymbol,
                                                  start,
                                                  end,
                                                  limit,
                                                  offset,
                                                  types,
                                              }: TxsFilterProps) => {
        if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey) {
            // const userTxnList = await Promise.all([
            //     LoopringAPI.userAPI.getUserTranferList({
            //         accountId,
            //     }, apiKey),
            //     LoopringAPI.userAPI.getUserDepositHistory({
            //         accountId,
            //     }, apiKey),
            //     LoopringAPI.userAPI.getUserOnchainWithdrawalHistory({
            //         accountId,
            //     }, apiKey)
            // ])
            setShowLoading(true)
            const userTxnList = await LoopringAPI.userAPI.getUserTxs({
                accountId,
                limit,
                tokenSymbol,
                start,
                end,
                offset,
                types,
            }, apiKey)

            const formattedList = userTxnList.userTxs.map(o => ({
                ...o,
                side: o.txType as any,
                amount: {
                    unit: o.symbol || '',
                    value: Number(volumeToCount(o.symbol, o.amount))
                },
                fee: {
                    unit: o.feeTokenSymbol || '',
                    value: Number(volumeToCountAsBigNumber(o.feeTokenSymbol, o.feeAmount || 0))
                },
                memo: o.memo || '',
                time: o.timestamp,
                txnHash: o.hash,
                status: getTxnStatus(o.status),
            }))
            setTxs(formattedList)
            setTxsTotal(userTxnList.totalNum)
            setShowLoading(false)
            //     const userTransferMapped = userTxnList[0].userTransfers?.map(o => ({
            //         side: TransactionTradeTypes.transfer,
            //         // token: o.symbol,
            //         // from: o.senderAddress,
            //         // to: o.receiverAddress,
            //         amount: {
            //             unit: o.symbol || '',
            //             value: Number(volumeToCount(o.symbol, o.amount))
            //         },
            //         fee: {
            //             unit: o.feeTokenSymbol || '',
            //             value: Number(volumeToCountAsBigNumber(o.feeTokenSymbol, o.feeAmount || 0))
            //         },
            //         memo: o.memo || '',
            //         time: o.timestamp,
            //         txnHash: o.hash,
            //         status: getTxnStatus(o.status),
            //         // tradeType: TransactionTradeTypes.transfer
            //     }))
            //     const userDepositMapped = userTxnList[1].userDepositHistory?.map(o => ({
            //         side: TransactionTradeTypes.deposit,
            //         symbol: o.symbol,
            //         // token: o.symbol,
            //         // from: o.hash,
            //         // to: 'My Loopring',
            //         // amount: Number(volumeToCount(o.symbol, o.amount)),
            //         amount: {
            //             unit: o.symbol || '',
            //             value: Number(volumeToCount(o.symbol, o.amount))
            //         },
            //         fee: {
            //             unit: '',
            //             value: 0
            //         },
            //         memo: '',
            //         time: o.timestamp,
            //         txnHash: o.txHash,
            //         status: getTxnStatus(o.status),
            //         // tradeType: TransactionTradeTypes.deposit
            //     }))
            //     const userWithdrawMapped = userTxnList[2].userOnchainWithdrawalHistory?.map((o => ({
            //         side: TransactionTradeTypes.withdraw,
            //         // token: o.symbol,
            //         // from: 'My Loopring',
            //         // to: o.distributeHash,
            //         amount: {
            //             unit: o.symbol || '',
            //             value: Number(volumeToCount(o.symbol, o.amount))
            //         },
            //         fee: {
            //             unit: o.feeTokenSymbol || '',
            //             value: Number(volumeToCount(o.feeTokenSymbol, o.feeAmount || 0)?.toFixed(6))
            //         },
            //         memo: '',
            //         time: o.timestamp,
            //         txnHash: o.txHash,
            //         status: getTxnStatus(o.status),
            //         // tradeType: TransactionTradeTypes.withdraw
            //     })))
            //     const mappingList = [...userTransferMapped??[], ...userDepositMapped??[], ...userWithdrawMapped??[]]
            //     const sortedMappingList = mappingList.sort((a, b) => b.time - a.time)
            //     setTxs(sortedMappingList)
            //     setIsLoading(false)
            // }
        }
    }, [accountId, apiKey])

    // useCustomDCEffect(() => {
    //     getUserTxnList()
    // }, [getUserTxnList])

    return {
        txs,
        txsTotal,
        showLoading,
        getUserTxnList
    }
}

export function useGetTrades() {
    const [userTrades, setUserTrades] = React.useState<RawDataTradeItem[]>([])
    const [showLoading, setShowLoading] = React.useState(true)
    const {account: {accountId, apiKey}} = useAccount()

    const tokenMap = store.getState().tokenMap.tokenMap

    const getUserTradeList = React.useCallback(async () => {
        if (LoopringAPI && LoopringAPI.userAPI && accountId && apiKey && tokenMap) {
            const userTrades = await LoopringAPI.userAPI.getUserTrades({
                accountId,
            }, apiKey)

            if (userTrades && userTrades.userTrades) {
                // @ts-ignore
                setUserTrades(userTrades.userTrades.map(o => {
                    const marketList = o.market.split('-')
                    // due to AMM case, we cannot use first index
                    const side = o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell
                    const isBuy = side === TradeTypes.Buy
                    
                    const base = marketList[ marketList.length - 2 ]
                    const quote = marketList[ marketList.length - 1 ]
                    const baseValue = volumeToCountAsBigNumber(base, o.volume)
                    const quoteValue = baseValue?.times(o.price)
                    const sellToken = isBuy ? quote : base
                    const buyToken = isBuy ? base : quote
                    const sellValue = getShowStr((isBuy ? quoteValue : baseValue)?.toNumber())
                    const buyValue = getShowStr((isBuy ? baseValue: quoteValue)?.toNumber())
                    
                    const feeKey = buyToken
                    const feeValue = getShowStr(volumeToCountAsBigNumber(feeKey, o.fee)?.toString())

                    return ({
                        side: o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell,
                        price: {
                            key: sellToken,
                            value: toBig(o.price).toNumber()
                        },
                        fee: {
                            key: feeKey,
                            value: feeKey && feeValue ? feeValue : '--'
                        },
                        time: Number(o.tradeTime),
                        amount: {
                            from: {
                                key: sellToken,
                                value: sellToken ? sellValue : undefined
                            },
                            to: {
                                key: buyToken,
                                value: buyValue ? buyValue : undefined
                            }
                        }
                    })
                }))
                setShowLoading(false)
            }
        }
    }, [accountId, apiKey, tokenMap])

    React.useEffect(() => {
        getUserTradeList()
    }, [getUserTradeList])

    // useCustomDCEffect(async() => {

    //     if (!LoopringAPI.userAPI || !accountId || !apiKey) {
    //         return
    //     }

    //     const response = await LoopringAPI.userAPI.getUserTrades({accountId: accountId}, apiKey)

    //     let userTrades: RawDataTradeItem[] = []

    //     response.userTrades.forEach((item: UserTrade, index: number) => {
    //     })

    //     setUserTrades(userTrades)

    // }, [accountId, apiKey, LoopringAPI.userAPI])

    return {
        userTrades,
        showLoading,
    }
}

export function useGetAmmRecord() {
    const [ammRecordList, setAmmRecordList] = React.useState<RawDataAmmItem[]>([])
    const [showLoading, setShowLoading] = React.useState(true)
    const {accountId, apiKey} = store.getState().account;
    const {tokenMap} = store.getState().tokenMap

    const getTokenName = React.useCallback((tokenId?: number) => {
        if (tokenMap) {
            const keys = Object.keys(tokenMap)
            const values = Object.values(tokenMap)
            const index = values.findIndex(o => o.tokenId === tokenId)
            if (index > -1) {
                return keys[ index ]
            }
            return ''
        }
        return ''
    }, [tokenMap])

    const getAmmpoolList = React.useCallback(async () => {
        if (LoopringAPI.ammpoolAPI && accountId && apiKey) {
            const ammpool = await LoopringAPI.ammpoolAPI.getUserAmmPoolTxs({
                accountId,
            }, apiKey)
            if (ammpool && ammpool.userAmmPoolTxs) {
                const result = ammpool.userAmmPoolTxs.map(o => ({
                    side: o.txType === AmmTxType.JOIN ? AmmSideTypes.Join : AmmSideTypes.Exit,
                    amount: {
                        from: {
                            key: getTokenName(o.poolTokens[ 0 ]?.tokenId),
                            value: String(volumeToCount(getTokenName(o.poolTokens[ 0 ]?.tokenId), o.poolTokens[ 0 ]?.actualAmount))
                        },
                        to: {
                            key: getTokenName(o.poolTokens[ 1 ]?.tokenId),
                            value: String(volumeToCount(getTokenName(o.poolTokens[ 1 ]?.tokenId), o.poolTokens[ 1 ]?.actualAmount))
                        }
                    },
                    lpTokenAmount: String(volumeToCount(getTokenName(o.lpToken?.tokenId), o.lpToken?.actualAmount)),
                    fee: {
                        key: getTokenName(o.poolTokens[ 1 ]?.tokenId),
                        value: volumeToCount(getTokenName(o.poolTokens[ 1 ]?.tokenId), o.poolTokens[ 1 ]?.feeAmount)?.toFixed(6)
                    },
                    time: o.updatedAt
                }))
                setAmmRecordList(result)
                setShowLoading(false)
            }
        }
    }, [accountId, apiKey, getTokenName])

    React.useEffect(() => {
        getAmmpoolList()
    }, [getAmmpoolList])

    return {
        ammRecordList,
        showLoading,
    }
}
