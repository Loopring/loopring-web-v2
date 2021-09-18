import { AmmCardProps, myLog } from '@loopring-web/common-resources';
import { AmmPoolActivityRule, AmmPoolActivityStatus, LoopringMap, RewardItem } from 'loopring-sdk';
import React from 'react';
import { makeUIAmmActivityMap } from '../../hooks/help';
import { LoopringAPI } from 'api_wrapper';

import { useUserRewards } from '../../stores/userRewards';
import store from 'stores'

export const useAmmMiningUI = <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>(
    {
        ammActivityMap
    }: { ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined }
): {
    ammActivityViewMap: Array<AmmCardProps<I>>,
    ammRewardRecordList: RewardItem[],
    ammActivityPastViewMap: Array<AmmCardProps<I>>,
    getLiquidityMining: (market: string, size?: number) => Promise<void>,
} => {
    const userRewardsMapState = useUserRewards();// store.getState().userRewardsMap
    // const {coinMap} = useTokenMap();
    // const ammMapState = useAmmMap();
    // const walletLayer2State = useWalletLayer2();
    const {apiKey, accountId} = store.getState().account
    const [ammActivityViewMap, setAmmActivityViewMap] = React.useState<Array<AmmCardProps<I>>>([]);
    const [ammRewardRecordList, setAmmRewardRecordList] = React.useState<RewardItem[]>([])
    const [ammActivityPastViewMap, setAmmActivityPastViewMap] = React.useState<Array<AmmCardProps<I>>>(
        []);
    // const [ammUserRewardMap, setAmmUserRewardMap] = React.useState<AmmUserRewardMap>(
    //     {});

    const getLiquidityMining = React.useCallback(async (market: string, size: number = 120) => {
        if (LoopringAPI && LoopringAPI.ammpoolAPI) {
            const ammRewardList = await LoopringAPI.ammpoolAPI.getLiquidityMining({
                accountId: accountId,
                market: market,
                size: size,
            }, apiKey)
            const { rewards } = ammRewardList
            setAmmRewardRecordList(rewards)
        }
    }, [apiKey, accountId])

    // );
    React.useEffect(() => {
        if (ammActivityMap && Object.keys(ammActivityMap).length > 0) {
            myLog({ammActivityMap})

            // getAmmPoolUserRewards().then((ammUserRewardMap)=>{
            // setAmmUserRewardMap(ammUserRewardMap as AmmUserRewardMap);
            setAmmActivityViewMap(makeUIAmmActivityMap(
                {
                    ammActivityMap,
                    ammPoolActivityStatus: [AmmPoolActivityStatus.NotStarted, AmmPoolActivityStatus.InProgress]
                }, userRewardsMapState.userRewardsMap
            ));
            setAmmActivityPastViewMap(
                makeUIAmmActivityMap(
                    {
                        ammActivityMap,
                        ammPoolActivityStatus: [AmmPoolActivityStatus.EndOfGame]
                    }, userRewardsMapState.userRewardsMap
                ))
            //  })
        }

    }, [ammActivityMap])
    React.useEffect(() => {
            if (userRewardsMapState.status === "ERROR") {
                //TODO: solve error
                userRewardsMapState.statusUnset();
            } else if (userRewardsMapState.status === "DONE") {
                userRewardsMapState.statusUnset();
                setAmmActivityViewMap(
                    makeUIAmmActivityMap(
                        {
                            ammActivityMap,
                            ammPoolActivityStatus: [AmmPoolActivityStatus.NotStarted, AmmPoolActivityStatus.InProgress]
                        }, userRewardsMapState.userRewardsMap
                    ));
                setAmmActivityPastViewMap(
                    makeUIAmmActivityMap(
                        {
                            ammActivityMap,
                            ammPoolActivityStatus: [AmmPoolActivityStatus.EndOfGame]
                        }, userRewardsMapState.userRewardsMap
                    ))
                // if (userRewardsMapState.ammMap) {
                //     setAmmActivityViewMap(
                //         makeUIAmmActivityMap(
                //             {
                //                 ammActivityMap,
                //                 type: 'AMM_MINING',
                //                 ammPoolActivityStatus: [AmmPoolActivityStatus.NotStarted, AmmPoolActivityStatus.InProgress]
                //             }, ammUserRewardMap
                //         ))
                //     setAmmActivityPastViewMap(
                //         makeUIAmmActivityMap(
                //             {
                //                 ammActivityMap,
                //                 type: 'AMM_MINING',
                //                 ammPoolActivityStatus: [AmmPoolActivityStatus.EndOfGame]
                //             }, ammUserRewardMap
                //         ))
                //
                // }

            }
        },
        [userRewardsMapState.status]
    )


    return {
        ammActivityViewMap,
        ammRewardRecordList,
        ammActivityPastViewMap,
        getLiquidityMining,
    }

}
