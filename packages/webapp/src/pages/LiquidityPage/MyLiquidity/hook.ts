import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk';
import React from 'react';
import { AmmRecordRow, MyPoolRow } from '@loopring-web/component-lib';
import { makeWallet, WalletMapExtend } from '../../../hooks/help/makeWallet';
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


export const useOverview = <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>(
    {
        ammActivityMap
    }: { ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined }
): {
    myAmmMarketArray: AmmRecordRow<R>[],
    summaryReward: SummaryMyAmm | undefined,
    myPoolRow: AmmRecordRow<R>[]
    // ammActivityViewMap: Array<AmmCardProps<I>>,
    // ammActivityPastViewMap: Array<AmmCardProps<I>>
} => {
    const walletLayer2State = useWalletLayer2();
    const userRewardsMapState = useUserRewards();
    const {marketArray} = useTokenMap();
    const ammMapState = useAmmMap();
    const {ammMap} = ammMapState;

    const [walletMap, setWalletMap] = React.useState<WalletMapExtend<R> | undefined>(undefined);
    const [summaryReward, setSummaryReward] = React.useState<SummaryMyAmm | undefined>(undefined);
    const [myPoolRow, setMyPoolRow] = React.useState<MyPoolRow<R>[]>([])
    const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<AmmRecordRow<R>[]>([]);
    // const [ammUserRewardMap, setAmmUserRewardMap] = React.useState<AmmUserRewardMap|undefined>(undefined);
    // const [snapShotData,setSnapShotData] = React.useState<{
    //     tickerData: TickerData|undefined
    //     ammPoolsBalance: AmmPoolSnapshot|undefined
    // }|undefined>(undefined);
    const walletLayer2DoIt = React.useCallback(() => {
        const {walletMap: _walletMap} = makeWallet();
        setWalletMap(_walletMap)
        if (_walletMap) {
            getUserAmmTransaction()?.then((marketTrades) => {
                let _myTradeArray = makeMyAmmMarketArray(undefined, marketTrades)
                setMyAmmMarketArray(_myTradeArray ? _myTradeArray : [])
            })
        }
        return _walletMap
    }, [makeWallet, getUserAmmTransaction, makeMyAmmMarketArray, marketArray])
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
                            ammUserRewardMap: userRewardsMapState.userRewardsMap
                        }
                    )
                    if (rowData !== undefined) {
                        prev.push(rowData);
                    }
                }
                return prev
            }, [] as MyPoolRow<R>[])
            // console.log('rowData',_myPoolRow);
            return _myPoolRow;
        }
        return [];
    }, [ammMap, userRewardsMapState.userRewardsMap])

    React.useEffect(() => {
        if (walletLayer2State.walletLayer2) {
            const _walletMap = walletLayer2DoIt();
            if (ammMap) {
                const _myPoolRow = makeMyPoolRow(_walletMap)
                setMyPoolRow(_myPoolRow)
            }
        }
    }, []);

    React.useEffect(() => {
        //ammMapState.ammMap or

        switch (walletLayer2State.status) {
            case "ERROR":
                walletLayer2State.statusUnset();
                break;
            case "DONE":
                walletLayer2State.statusUnset();
               // const _walletMap = walletLayer2DoIt()
                const _walletMap = walletLayer2DoIt();
                //TODO check AmmMap state or ammSnapshot sockets
                //userRewardsMapState is an option but  walletLayer2 amd ammMapState.ammMap is required
                if (ammMapState.ammMap) {
                    const _myPoolRow = makeMyPoolRow(_walletMap);
                    setMyPoolRow(_myPoolRow)
                }
                break;
            default:
                break;

        }
        // }
    }, [walletLayer2State.status])

    React.useEffect(() => {
        if (ammMapState.status === "ERROR") {
            //TODO: solve error
            ammMapState.statusUnset();
        } else if (ammMapState.status === "DONE") {
            ammMapState.statusUnset();
            //TODO check AmmMap state or ammSnapshot sockets when websocket open  ammMapState done should not effect myPoolRow
            if (walletLayer2State.walletLayer2) {
                const _walletMap = walletLayer2DoIt();
                //userRewardsMapState is an option and walletLayer2 is required
                const _myPoolRow = makeMyPoolRow(_walletMap);
                setMyPoolRow(_myPoolRow);
            }
        }
    }, [ammMapState.status])

    React.useEffect(() => {
        if (userRewardsMapState.status === "ERROR") {
            //TODO: solve error
            userRewardsMapState.statusUnset();
        } else if (userRewardsMapState.status === "DONE") {
            userRewardsMapState.statusUnset();
            // setAmmUserRewardMap()
            const summaryReward = makeSummaryMyAmm({userRewardsMap: userRewardsMapState.userRewardsMap});
            setSummaryReward(summaryReward);

            //TODO check AmmMap state or ammSnapshot sockets
            if (walletLayer2State.walletLayer2 && ammMapState.ammMap) {  //  ammMapState.ammMap or websocket
                //userRewardsMapState is an option and walletLayer2 is required
                const _myPoolRow = makeMyPoolRow(walletLayer2State.walletLayer2);
                setMyPoolRow(_myPoolRow);
            }

        }
    }, [userRewardsMapState.status])
    return {
        myAmmMarketArray,
        summaryReward,
        myPoolRow,
        // ammActivityViewMap,
        // ammActivityPastViewMap
    }

}
