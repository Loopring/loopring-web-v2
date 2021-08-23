import React from 'react'
import { useState, useCallback } from 'react'
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { TransactionStatus, RawDataTransactionItem, RawDataTradeItem, RawDataAmmItem, AmmSideTypes } from '@loopring-web/component-lib'
import { volumeToCount, volumeToCountAsBigNumber } from 'hooks/help'
import { LoopringAPI } from 'api_wrapper'
import store from 'stores'
import { TradeTypes } from '@loopring-web/common-resources'
import { toBig, Side, AmmTxType, UserTxTypes } from 'loopring-sdk'

import { TransactionTradeTypes } from '@loopring-web/component-lib';

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

    const { account: {accountId, apiKey} } = useAccount()

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
    const { account:{accountId, apiKey} } = useAccount()

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
                    const tokenFirst = marketList[marketList.length - 2]
                    const tokenLast = marketList[marketList.length - 1]
                    const baseToken = isBuy ? tokenLast : tokenFirst
                    const quoteToken = isBuy ? tokenFirst : tokenLast
                    const feeKey = isBuy ? quoteToken : baseToken
                    const baseValue = isBuy ? volumeToCountAsBigNumber(quoteToken, o.volume)?.times(o.price).toNumber() : volumeToCountAsBigNumber(baseToken, o.volume)
                    const quoteValue = isBuy ? volumeToCountAsBigNumber(quoteToken, o.volume) : volumeToCountAsBigNumber(baseToken, o.volume)?.times(o.price).toNumber()
                    const feeValue = volumeToCountAsBigNumber(feeKey, o.fee)

                    return ({
                        side: o.side === Side.Buy ? TradeTypes.Buy : TradeTypes.Sell ,
                        price: {
                            key: baseToken,
                            // value: StringToNumberWithPrecision(o.price, baseToken)
                            value: toBig(o.price).toNumber()
                        },
                        fee: {
                            key: feeKey,
                            // value: VolToNumberWithPrecision(o.fee, quoteToken),
                            // value: feeKey ? volumeToCount(feeKey, o.fee)?.toFixed(6) : undefined
                            value: feeKey 
                                ? Number(feeValue) > 1 ? feeValue?.toFixed(6) : feeValue?.toPrecision(2) as any
                                : '--'
                        },
                        time: Number(o.tradeTime),
                        amount: {
                            from: {
                                key: baseToken,
                                // value: VolToNumberWithPrecision(o.volume, baseToken),
                                // value: baseToken ? volumeToCount(baseToken, o.volume) : undefined
                                value: baseToken ? baseValue : undefined
                            },
                            to: {
                                key: quoteToken,
                                // value: VolToNumberWithPrecision(amt, quoteToken)
                                // value: baseToken ? volumeToCountAsBigNumber(baseToken, o.volume)?.times(o.price).toNumber() : undefined
                                value: baseToken ? quoteValue : undefined
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
    const { accountId,apiKey } = store.getState().account;
    const { tokenMap } = store.getState().tokenMap

    const getTokenName = React.useCallback((tokenId?: number) => {
        if (tokenMap) {
            const keys = Object.keys(tokenMap)
            const values = Object.values(tokenMap)
            const index = values.findIndex(o => o.tokenId === tokenId)
            if (index > -1) {
                return keys[index]
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
                            key: getTokenName(o.poolTokens[0]?.tokenId),
                            value: String(volumeToCount(getTokenName(o.poolTokens[0]?.tokenId), o.poolTokens[0]?.actualAmount))
                        },
                        to: {
                            key: getTokenName(o.poolTokens[1]?.tokenId),
                            value: String(volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.actualAmount))
                        }
                    },
                    lpTokenAmount: String(volumeToCount(getTokenName(o.lpToken?.tokenId), o.lpToken?.actualAmount)),
                    fee: {
                        key: getTokenName(o.poolTokens[1]?.tokenId),
                        value: volumeToCount(getTokenName(o.poolTokens[1]?.tokenId), o.poolTokens[1]?.feeAmount)?.toFixed(6)
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

    return  {
        ammRecordList,
        showLoading,
    }
}
