import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk';
import React from 'react';
import { AmmRecordRow, MyPoolRow } from '@loopring-web/component-lib';
import { makeWalletLayer2, WalletMapExtend } from '../../../hooks/help/makeWallet';
import { LoopringAPI } from 'api_wrapper'
import {
    getUserAmmTransaction,
    makeMyAmmMarketArray,
    makeMyPoolRowWithPoolState,
    makeSummaryMyAmm,
    SummaryMyAmm
} from '../../../hooks/help';
import { useTokenMap } from '../../../stores/token';
import { useWalletLayer2 } from '../../../stores/walletLayer2';
import { useUserRewards } from '../../../stores/userRewards';
import { useAmmMap } from '../../../stores/Amm/AmmMap';
import { SagaStatus } from '@loopring-web/common-resources';
import { useWalletHook } from '../../../services/wallet/useWalletHook';
import { volumeToCount } from 'hooks/help'

export const useOverview = <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>(
    {
        ammActivityMap
    }: { ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined }
): {
    myAmmMarketArray: AmmRecordRow<R>[],
    summaryReward: SummaryMyAmm | undefined,
    myPoolRow: MyPoolRow<R>[],
    // ammActivityViewMap: Array<AmmCardProps<I>>,
    // ammActivityPastViewMap: Array<AmmCardProps<I>>
} => {
    const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();
    const {status: userRewardsStatus,userRewardsMap} = useUserRewards();
    const {marketArray, addressIndex} = useTokenMap();
    const {status: ammMapStatus,ammMap} = useAmmMap();

    // const [walletMap, setWalletMap] = React.useState<WalletMapExtend<R> | undefined>(undefined);
    const [summaryReward, setSummaryReward] = React.useState<SummaryMyAmm | undefined>(undefined);
    const [myPoolRow, setMyPoolRow] = React.useState<MyPoolRow<R>[]>([])
    const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<AmmRecordRow<R>[]>([])
    const [lpTokenList, setLpTokenList] = React.useState<{addr: string; price: number}[]>([])

    const getLpTokenList = React.useCallback(async () => {
        if (LoopringAPI.walletAPI) {
            const result = await LoopringAPI.walletAPI.getLatestTokenPrices()
            const list = Object.entries(result.tokenPrices).map(([addr, price]) => ({
                addr,
                price,
            }))
            setLpTokenList(list)
        }
    }, [])

    React.useEffect(() => {
        getLpTokenList()
    }, [getLpTokenList])
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

    const getLpTokenPrice = React.useCallback((market: string) => {
        if (addressIndex) {
            const address = Object.entries(addressIndex).find(([_, token]) => token === market)?.[0]
            if (address && !!lpTokenList.length) {
                return lpTokenList.find((o) => o.addr === address)?.price
            }
            return undefined
        }
        return undefined
    }, [addressIndex, lpTokenList])

    const getAmmLiquidity = React.useCallback((market: string) => {
        const price = getLpTokenPrice(market)
        const balance = Object.entries(walletLayer2 || {}).find(([token]) => token === market)?.[1].total
        const formattedBalance = volumeToCount(market, (balance || 0))
        console.log(price, balance)
        return (price || 0) * (formattedBalance || 0)
    }, [getLpTokenPrice, walletLayer2])

    const makeMyPoolRow = React.useCallback((_walletMap): MyPoolRow<R>[] => {
        if (_walletMap && ammMap) {
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
            console.log(_myPoolRow)
            // const formattedPoolRow = _myPoolRow.map((o) => {
            //     console.log(o.ammDetail)
            //     const ammValue = getAmmLiquidity(`LP-${o.ammDetail?.coinAInfo.simpleName}-${o.ammDetail?.coinBInfo.simpleName}`)
            //     console.log(ammValue)
            //     return ({
            //         ...o,
            //         ammValue,
            //     })
            // })
            // console.log('rowData',_myPoolRow);
            return _myPoolRow;
        }
        return [];
    }, [ammMap, userRewardsMap, getAmmLiquidity])

    

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
    const walletLayer2Callback =React.useCallback(()=>{
        if(ammMap && !!lpTokenList.length) {
            const _walletMap = walletLayer2DoIt();
            const _myPoolRow = makeMyPoolRow(_walletMap);

            setMyPoolRow(_myPoolRow)
        }
    },[ammMap, lpTokenList])
    useWalletHook({walletLayer2Callback})


    React.useEffect(() => {
        if (ammMapStatus === SagaStatus.UNSET) {
            walletLayer2Callback()
        }
    }, [ammMapStatus])

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
        // ammActivityViewMap,
        // ammActivityPastViewMap
    }

}
