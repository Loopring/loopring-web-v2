import React from 'react'
import { useState, useCallback } from 'react'
// import { useAmmpoolAPI, useUserAPI } from "hooks/exchange/useApi"
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'
import { useAccount } from 'stores/account/hook'
import { TransactionStatus, RawDataTransactionItem, RawDataTradeItem, AmmRecordRow } from '@loopring-web/component-lib'
import { volumeToCount, volumeToCountAsBigNumber, getUserAmmTransaction, makeMyAmmMarketArray } from 'hooks/help'
import { LoopringAPI } from 'stores/apis/api'
import store from 'stores'
import { TradeTypes, SagaStatus } from '@loopring-web/common-resources'
import { toBig, Side, AmmPoolActivityRule, LoopringMap } from 'loopring-sdk'
import { useWalletLayer2 } from 'stores/walletLayer2';
import { makeWalletLayer2 } from 'hooks/help/makeWallet';
import { useTokenMap } from 'stores/token';
import { useAmmMap } from 'stores/Amm/AmmMap';

import { TransactionTradeTypes } from '@loopring-web/component-lib';

export function useGetTxs() {

    const { account: {accountId, apiKey} } = useAccount()

    // const userApi = useUserAPI()

    const [txs, setTxs] = useState<RawDataTransactionItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

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
            const userTransferMapped = userTxnList[0].userTransfers?.map(o => ({
                side: TransactionTradeTypes.transfer,
                // token: o.symbol,
                // from: o.senderAddress,
                // to: o.receiverAddress,
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
                // tradeType: TransactionTradeTypes.transfer
            }))
            const userDepositMapped = userTxnList[1].userDepositHistory?.map(o => ({
                side: TransactionTradeTypes.deposit,
                symbol: o.symbol,
                // token: o.symbol,
                // from: o.hash,
                // to: 'My Loopring',
                // amount: Number(volumeToCount(o.symbol, o.amount)),
                amount: {
                    unit: o.symbol || '',
                    value: Number(volumeToCount(o.symbol, o.amount))
                },
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
            const userWithdrawMapped = userTxnList[2].userOnchainWithdrawalHistory?.map((o => ({
                side: TransactionTradeTypes.withdraw,
                // token: o.symbol,
                // from: 'My Loopring',
                // to: o.distributeHash,
                amount: {
                    unit: o.symbol || '',
                    value: Number(volumeToCount(o.symbol, o.amount))
                },
                fee: {
                    unit: o.feeTokenSymbol || '',
                    value: Number(volumeToCount(o.feeTokenSymbol, o.feeAmount || 0)?.toFixed(6))
                },
                memo: '',
                time: o.timestamp,
                txnHash: o.txHash,
                status: getTxnStatus(o.status),
                // tradeType: TransactionTradeTypes.withdraw
            })))
            const mappingList = [...userTransferMapped??[], ...userDepositMapped??[], ...userWithdrawMapped??[]]
            const sortedMappingList = mappingList.sort((a, b) => b.time - a.time)
            setTxs(sortedMappingList)
            setIsLoading(false)
        }
    }, [accountId, apiKey])

    useCustomDCEffect(() => {
        getUserTxnList()
    }, [getUserTxnList])

    return {
        txs,
        isLoading
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
                    const baseToken = marketList[marketList.length - 2]
                    const quoteToken = marketList[marketList.length - 1]

                    // const amt = toBig(o.volume).times(o.price).toString()

                    const feeKey = o.side === Side.Buy ? baseToken : quoteToken


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
                            value: feeKey ? volumeToCount(feeKey, o.fee)?.toFixed(6) : undefined
                        },
                        time: Number(o.tradeTime),
                        amount: {
                            from: {
                            key: baseToken,
                            // value: VolToNumberWithPrecision(o.volume, baseToken),
                            value: baseToken ? volumeToCount(baseToken, o.volume) : undefined
                            },
                            to: {
                            key: quoteToken,
                            // value: VolToNumberWithPrecision(amt, quoteToken)
                            value: baseToken ? volumeToCountAsBigNumber(baseToken, o.volume)?.times(o.price).toNumber() : undefined
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

export const useOverview = <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>(
    {
        ammActivityMap
    }: { ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined }
): {
    myAmmMarketArray: AmmRecordRow<R>[],
    // summaryReward: SummaryMyAmm | undefined,
    // myPoolRow: MyPoolRow<R>[]
    // ammActivityViewMap: Array<AmmCardProps<I>>,
    // ammActivityPastViewMap: Array<AmmCardProps<I>>
} => {
    const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();
    // const userRewardsMapState = useUserRewards();
    const {marketArray} = useTokenMap();
    const ammMapState = useAmmMap();
    const {ammMap} = ammMapState;

    // const [walletMap, setWalletMap] = React.useState<WalletMapExtend<R> | undefined>(undefined);
    // const [summaryReward, setSummaryReward] = React.useState<SummaryMyAmm | undefined>(undefined);
    // const [myPoolRow, setMyPoolRow] = React.useState<MyPoolRow<R>[]>([])
    const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<AmmRecordRow<R>[]>([]);
    // const [ammUserRewardMap, setAmmUserRewardMap] = React.useState<AmmUserRewardMap|undefined>(undefined);
    // const [snapShotData,setSnapShotData] = React.useState<{
    //     tickerData: TickerData|undefined
    //     ammPoolsBalance: AmmPoolSnapshot|undefined
    // }|undefined>(undefined);
    const walletLayer2DoIt = React.useCallback(() => {
        const {walletMap: _walletMap} = makeWalletLayer2();
        // setWalletMap(_walletMap as WalletMapExtend<any>)
        if (_walletMap) {
            getUserAmmTransaction()?.then((marketTrades) => {
                let _myTradeArray = makeMyAmmMarketArray(undefined, marketTrades)
                setMyAmmMarketArray(_myTradeArray ? _myTradeArray : [])
            })
        }
        return _walletMap
    }, [makeWalletLayer2, getUserAmmTransaction, makeMyAmmMarketArray, marketArray])
    // const makeMyPoolRow = React.useCallback((_walletMap): MyPoolRow<R>[] => {
    //     if (_walletMap && ammMap) {
    //         // @ts-ignore
    //         const _myPoolRow: MyPoolRow<R>[] = Reflect.ownKeys(_walletMap).reduce((prev: MyPoolRow<R>[], walletKey: string) => {
    //             if (/LP-/i.test(walletKey)) {
    //                 const ammKey = walletKey.replace('LP-', 'AMM-');
    //                 const marketKey = walletKey.replace('LP-', '');
    //                 let rowData: MyPoolRow<R> | undefined;
    //                 //TODO：websocket open
    //                 //  if(ammPoolSnapShots)
    //                 // makeData by snapshot else
    //                 // else

    //                 rowData = makeMyPoolRowWithPoolState(
    //                     {
    //                         ammDetail: ammMap[ ammKey ],
    //                         walletMap: _walletMap,
    //                         market: marketKey,
    //                         ammUserRewardMap: userRewardsMapState.userRewardsMap
    //                     }
    //                 ) as any
    //                 if (rowData !== undefined) {
    //                     prev.push(rowData);
    //                 }
    //             }
    //             return prev
    //         }, [] as MyPoolRow<R>[])
    //         // console.log('rowData',_myPoolRow);
    //         return _myPoolRow;
    //     }
    //     return [];
    // }, [ammMap, userRewardsMapState.userRewardsMap])

    React.useEffect(() => {
        if (walletLayer2) {
            walletLayer2DoIt();
            // if (ammMap) {
            //     const _myPoolRow = makeMyPoolRow(_walletMap)
            //     setMyPoolRow(_myPoolRow)
            // }
        }
    }, []);
    // const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();

    React.useEffect(() => {
        //ammMapState.ammMap or
        if (walletLayer2Status === SagaStatus.UNSET && ammMapState.ammMap) {
            const _walletMap = walletLayer2DoIt();
            // //TODO check AmmMap state or ammSnapshot sockets
            // //userRewardsMapState is an option but  walletLayer2 amd ammMapState.ammMap is required
            //     if () {
            // const _myPoolRow = makeMyPoolRow(_walletMap);
            // setMyPoolRow(_myPoolRow)
            // }
        }
        // }
    }, [walletLayer2Status])

    React.useEffect(() => {
        if (ammMapState.status === "ERROR") {
            //TODO: solve error
            ammMapState.statusUnset();
        } else if (ammMapState.status === "DONE") {
            ammMapState.statusUnset();
            //TODO check AmmMap state or ammSnapshot sockets when websocket open  ammMapState done should not effect myPoolRow
            if (walletLayer2) {
                const _walletMap = walletLayer2DoIt();
                //userRewardsMapState is an option and walletLayer2 is required
                // const _myPoolRow = makeMyPoolRow(_walletMap);
                // setMyPoolRow(_myPoolRow);
            }
        }
    }, [ammMapState.status])

    // React.useEffect(() => {
    //     if (userRewardsMapState.status === "ERROR") {
    //         //TODO: solve error
    //         userRewardsMapState.statusUnset();
    //     } else if (userRewardsMapState.status === "DONE") {
    //         userRewardsMapState.statusUnset();
    //         // setAmmUserRewardMap()
    //         const summaryReward = makeSummaryMyAmm({userRewardsMap: userRewardsMapState.userRewardsMap});
    //         setSummaryReward(summaryReward);

    //         //TODO check AmmMap state or ammSnapshot sockets
    //         if (walletLayer2 && ammMapState.ammMap) {  //  ammMapState.ammMap or websocket
    //             //userRewardsMapState is an option and walletLayer2 is required
    //             const _myPoolRow = makeMyPoolRow(walletLayer2);
    //             setMyPoolRow(_myPoolRow);
    //         }

    //     }
    // }, [userRewardsMapState.status])
    return {
        myAmmMarketArray,
        // summaryReward,
        // myPoolRow,
        // ammActivityViewMap,
        // ammActivityPastViewMap
    }
}
