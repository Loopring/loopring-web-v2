import { AmmPoolActivityRule, LoopringMap } from '@loopring-web/loopring-sdk';
import React from 'react';
import { AmmRecordRow, MyPoolRow } from '@loopring-web/component-lib';
import { makeWalletLayer2 } from 'hooks/help/makeWallet';
import {
    getUserAmmTransaction,
    makeMyAmmMarketArray,
    makeMyPoolRowWithPoolState,
    makeSummaryMyAmm,
    SummaryMyAmm,
    useAmmTotalValue,
} from 'hooks/help';
import { useTokenMap } from 'stores/token';
import { useWalletLayer2 } from 'stores/walletLayer2';
import { useUserRewards } from 'stores/userRewards';
import { useAmmMap } from 'stores/Amm/AmmMap';
import { SagaStatus } from '@loopring-web/common-resources';
import { useWalletLayer2Socket } from 'services/socket/';
import { useSystem } from 'stores/system';
import store from 'stores'

export const useOverview = <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>(
    {
        ammActivityMap
    }: { ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined }
): {
    myAmmMarketArray: AmmRecordRow<R>[],
    summaryReward: SummaryMyAmm | undefined,
    myPoolRow: MyPoolRow<R>[],
    showLoading: boolean,
    // ammActivityViewMap: Array<AmmCardProps<I>>,
    // ammActivityPastViewMap: Array<AmmCardProps<I>>
} => {
    const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();
    const {status: userRewardsStatus, userRewardsMap, getUserRewards} = useUserRewards();
    const {marketArray, addressIndex, tokenMap} = useTokenMap();
    // const {marketArray, addressIndex, tokenMap,} = store.getState().tokenMap
    const {status: ammMapStatus, ammMap, getAmmMap} = useAmmMap();
    const {getAmmLiquidity} = useAmmTotalValue()
    const {forex} = useSystem()
    const {tokenPrices} = store.getState().tokenPrices

    // const [walletMap, setWalletMap] = React.useState<WalletMapExtend<R> | undefined>(undefined);
    const [summaryReward, setSummaryReward] = React.useState<SummaryMyAmm | undefined>(undefined);
    const [myPoolRow, setMyPoolRow] = React.useState<MyPoolRow<R>[]>([])
    const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<AmmRecordRow<R>[]>([])
    // const [lpTokenList, setLpTokenList] = React.useState<{ addr: string; price: number }[]>([])
    const [showLoading, setShowLoading] = React.useState(false)

    React.useEffect(() => {

        if (ammMapStatus === SagaStatus.UNSET && userRewardsStatus === SagaStatus.UNSET && walletLayer2Status === SagaStatus.UNSET) {
            walletLayer2Callback()
        }
    }, [ammMapStatus, userRewardsStatus, walletLayer2Status])

    React.useEffect(() => {
        setShowLoading(true)
    }, [])
    

    // React.useEffect(() => {
    //     if (ammMapStatus === SagaStatus.UNSET && userRewardsStatus === SagaStatus.UNSET) {
    //         walletLayer2Callback()
    //     }
    // }, [ammMapStatus, userRewardsStatus])

    // const getLpTokenList = React.useCallback(async () => {
    //     if (LoopringAPI.walletAPI) {
    //         const result = await LoopringAPI.walletAPI.getLatestTokenPrices()
    //         const list = Object.entries(result.tokenPrices).map(([addr, price]) => ({
    //             addr,
    //             price,
    //         }))
    //         setLpTokenList(list)
    //     }
    // }, [])

    // React.useEffect(() => {
    //     if (!lpTokenList.length) {
    //         getLpTokenList()
    //     }
    // }, [getLpTokenList, lpTokenList])

    // const getLpTokenPrice = React.useCallback((market: string) => {
    //     if (addressIndex) {
    //         const address = Object.entries(addressIndex).find(([_, token]) => token === market)?.[ 0 ]
    //         if (address && !!lpTokenList.length) {
    //             return lpTokenList.find((o) => o.addr === address)?.price
    //         }
    //         return undefined
    //     }
    //     return undefined
    // }, [addressIndex, lpTokenList])

    
    // const [ammUserRewardMap, setAmmUserRewardMap] = React.useState<AmmUserRewardMap|undefined>(undefined);
    // const [snapShotData,setSnapShotData] = React.useState<{
    //     tickerData: TickerData|undefined
    //     ammPoolSnapshot: AmmPoolSnapshot|undefined
    // }|undefined>(undefined);
    const walletLayer2DoIt = React.useCallback(async() => {
        const {walletMap: _walletMap} = makeWalletLayer2(false);
        // setWalletMap(_walletMap as WalletMapExtend<any>)
        if (_walletMap) {
            // setShowLoading(true)
            const res = await getUserAmmTransaction({})
            let _myTradeArray = makeMyAmmMarketArray(undefined, res ? res.userAmmPoolTxs : [])
            setMyAmmMarketArray(_myTradeArray ? _myTradeArray : [])
            // getUserAmmTransaction({})?.then((marketTrades) => {
            //     let _myTradeArray = makeMyAmmMarketArray(undefined, marketTrades.userAmmPoolTxs)
            //     setMyAmmMarketArray(_myTradeArray ? _myTradeArray : [])
            //     // setShowLoading(false)
            // })
        }
        return _walletMap
    }, [])

    // const getLpTokenPrice = React.useCallback(async (market: string) => {
    //     if (addressIndex && LoopringAPI.walletAPI) {
    //         const result = await LoopringAPI.walletAPI.getLatestTokenPrices()
    //         const list = Object.entries(result.tokenPrices).map(([addr, price]) => ({
    //             addr,
    //             price,
    //         }))
    //         const address = Object.entries(addressIndex).find(([_, token]) => token === market)?.[0]
    //         if (address && !!list.length) {
    //             return list.find((o) => o.addr === address)?.price
    //         }
    //         return undefined
    //     }
    //     return undefined
    // }, [addressIndex])

    // const getAmmLiquidity = React.useCallback(async (market: string) => {
    //     const price = await getLpTokenPrice(market)
    //     const balance = Object.entries(walletLayer2 || {}).find(([token]) => token === market)?.[1].total
    //     const formattedBalance = volumeToCount(market, (balance || 0))
    //     return (price || 0) * (formattedBalance || 0)
    // }, [walletLayer2, getLpTokenPrice])

    const makeMyPoolRow = React.useCallback(async (_walletMap): Promise<MyPoolRow<R>[]> => {
        if (_walletMap && ammMap && userRewardsMap && tokenPrices && forex) {
            // @ts-ignore
            const _myPoolRow: MyPoolRow<R>[] = Reflect.ownKeys(_walletMap).reduce((prev: MyPoolRow<R>[], walletKey: string) => {
                if (/LP-/i.test(walletKey)) {
                    const ammKey = walletKey.replace('LP-', 'AMM-');
                    const marketKey = walletKey.replace('LP-', '');
                    let rowData: MyPoolRow<R> | undefined;
                    //TODO：websocket open
                    //  if(ammPoolSnapShots)
                    // makeData by snapshot else
                    // else
                    rowData = makeMyPoolRowWithPoolState(
                        {
                            ammDetail: ammMap[ ammKey ],
                            walletMap: _walletMap,
                            market: marketKey,
                            ammUserRewardMap: userRewardsMap
                        }
                    ) as any
                    if (rowData !== undefined) {
                        prev.push(rowData);
                    }
                }

                return prev
            }, [] as MyPoolRow<R>[])

            const formattedPoolRow = _myPoolRow.map((o: any) => {
                const market = `LP-${o.ammDetail?.coinAInfo.simpleName}-${o.ammDetail?.coinBInfo.simpleName}`
                const totalAmount = o.totalLpAmount
                const totalAmmValueDollar = (tokenPrices[market] || 0) * totalAmount
                const totalAmmValueYuan = (totalAmmValueDollar || 0) * forex
                const coinA = o.ammDetail?.coinAInfo?.simpleName
                const coinB = o.ammDetail?.coinBInfo?.simpleName
                const precisionA = tokenMap ? tokenMap[coinA]?.precision : undefined
                const precisionB = tokenMap ? tokenMap[coinB]?.precision : undefined

                return ({
                    ...o,
                    totalAmmValueDollar,
                    totalAmmValueYuan,
                    precisionA,
                    precisionB
                })
            })
            return formattedPoolRow as any;
        }
        return [];
    }, [ammMap, userRewardsMap, getAmmLiquidity, tokenPrices, forex])

    const walletLayer2Callback = React.useCallback(async () => {
        if (ammMap && tokenPrices && userRewardsMap && forex) {
            setShowLoading(true)
            const _walletMap = await walletLayer2DoIt();
            const _myPoolRow = await makeMyPoolRow(_walletMap);
            setMyPoolRow(_myPoolRow)
            setShowLoading(false)
        }
    }, [ammMap, makeMyPoolRow, walletLayer2DoIt, tokenPrices])

    // React.useEffect(() => {
    //     if (ammMap && tokenPrices) {
    //         walletLayer2Callback()
    //     }
    // }, [makeMyPoolRow, walletLayer2DoIt, ammMap, userRewardsMap, walletLayer2Callback, tokenPrices])

    // React.useEffect(() => {
    //     if (walletLayer2) {
    //         const _walletMap = walletLayer2DoIt();
    //         if (ammMap) {
    //             const _myPoolRow = makeMyPoolRow(_walletMap)
    //             setMyPoolRow(_myPoolRow)
    //         }
    //     }
    // }, []);
    // const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();
    

    useWalletLayer2Socket({walletLayer2Callback})

    React.useEffect(() => {
        if (userRewardsStatus === SagaStatus.UNSET) {
            const summaryReward = makeSummaryMyAmm({userRewardsMap});
            setSummaryReward(summaryReward);
            walletLayer2Callback()
        }
    }, [userRewardsStatus])
    return {
        myAmmMarketArray,
        summaryReward,
        myPoolRow,
        showLoading,
        // ammActivityViewMap,
        // ammActivityPastViewMap
    }

}
