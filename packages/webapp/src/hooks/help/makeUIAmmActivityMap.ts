import {
    AmmPoolActivityRule,
    AmmPoolActivityStatus,
    AmmPoolSnapshot,
    AmmUserReward,
    AmmUserRewardMap,
    LoopringMap,
    TickerData,
    toBig,
} from 'loopring-sdk';
import { AmmActivity, AmmCardProps, MyAmmLP } from '@loopring-web/common-resources';
import store from '../../stores';
import { deepClone } from '../../utils/obj_tools';
import BigNumber from 'bignumber.js';
import { volumeToCount, volumeToCountAsBigNumber } from './volumeToCount';
import { coinMap } from '@loopring-web/component-lib';
import { AmmDetailStore } from '../../stores/Amm/AmmMap';
import { WalletMapExtend } from './makeWallet';
import { VolToNumberWithPrecision } from '../../utils/formatter_tool';
import { myError } from 'utils/log_tools';

export type AmmActivityViewMap<R, I> = {
    [key in keyof R]?: AmmActivity<I>[] | undefined
}
export const makeUIAmmActivityMap = <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>
({ammActivityMap, type, ammPoolActivityStatus}: {
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[ ]>> | undefined,
    type: 'AMM_MINING' | 'SWAP_VOLUME_RANKING',
    ammPoolActivityStatus: AmmPoolActivityStatus[]
}, myReward: AmmUserRewardMap | undefined):
    Array<AmmCardProps<I>> => {
    const {coinMap, tokenMap, idIndex} = store.getState().tokenMap
    let ammActivityViewMap: AmmActivityViewMap<R, I> = {}
    if (ammActivityMap && ammActivityMap[ type ]) {

        // @ts-ignore
        ammPoolActivityStatus.forEach((status: AmmPoolActivityStatus) => {

            if (ammActivityMap[ type ][ status ]) {
                // @ts-ignore
                ammActivityMap[ type ][ status ].reduce((prev: AmmActivityViewMap<R, I>, ammPoolActivityRule: AmmPoolActivityRule) => {

                    if (coinMap && ammPoolActivityRule.awardRules[ 0 ] && idIndex && tokenMap) {

                        const symbol = idIndex[ ammPoolActivityRule.awardRules[ 0 ].tokenId as any ]
                        const totalRewards = VolToNumberWithPrecision(ammPoolActivityRule.awardRules[ 0 ].volume, symbol)
                        // @ts-ignore
                        const item = {
                            // @ts-ignore
                            rewardToken: coinMap[ symbol ],
                            totalRewards: Number(totalRewards),
                            myRewards: status === AmmPoolActivityStatus.InProgress && myReward && myReward[ ammPoolActivityRule.market ] ?
                                volumeToCount(symbol, myReward[ ammPoolActivityRule.market ]?.currentRewards[ 0 ].volume) : 0,
                            duration: {
                                from: new Date(ammPoolActivityRule?.rangeFrom),
                                to: new Date(ammPoolActivityRule?.rangeTo),
                            },
                            isPass: AmmPoolActivityStatus.EndOfGame === status,
                        }
                        if (prev[ ammPoolActivityRule.market ]) {
                            // @ts-ignore
                            prev[ ammPoolActivityRule.market ].push(item);
                        } else {
                            // @ts-ignore
                            prev[ ammPoolActivityRule.market ] = [item];
                        }


                        // return prev;
                    }
                    return prev;
                }, ammActivityViewMap)

            }
        })
    }
    const resultArray = makeAsCard(ammActivityViewMap)
    // console.log(resultArray)
    return resultArray;


}
const makeAsCard = <R extends { [ key: string ]: any }, I extends { [ key: string ]: any }>
(ammActivityViewMap: AmmActivityViewMap<R, I> | undefined, myReward?: any): Array<AmmCardProps<I>> => {
    const {coinMap} = store.getState().tokenMap
    const {ammMap} = store.getState().amm.ammMap
    try {
        if (ammActivityViewMap && coinMap) {
            // @ts-ignore
            return Reflect.ownKeys(ammActivityViewMap).reduce((prev: Array<AmmCardProps<I>>, key: string) => {
                const _ammInfo = ammMap[ key as string ]
                if (_ammInfo && _ammInfo.coinA && coinMap && ammActivityViewMap[ key ]) {

                    // @ts-ignore
                    const itemArray = ammActivityViewMap[ key ].map((item) => {
                        return {
                            ...deepClone(_ammInfo),
                            // @ts-ignore
                            coinAInfo: coinMap[ _ammInfo.coinA ],
                            // @ts-ignore
                            coinBInfo: coinMap[ _ammInfo.coinB ],
                            activity: item,
                        }
                    })
                    prev = [...prev, ...itemArray]
                }
                return prev;
            }, [] as Array<AmmCardProps<I>>) as Array<AmmCardProps<I>>
        } else {
            return [] as Array<AmmCardProps<I>>
        }
    } catch (error) {
        myError(error)
        return []
    }
}
type Value = undefined | number;
export type SummaryMyAmm = {
    rewardDollar: Value,
    rewardYuan: Value,
    feeDollar: Value,
    feeYuan: Value,
}
export const makeSummaryMyAmm = <C extends { [ key: string ]: any }>({
                                                                         userRewardsMap
                                                                     }: {
    userRewardsMap: LoopringMap<AmmUserReward> | undefined
}):
    SummaryMyAmm | undefined => {
    const {coinMap, idIndex, tokenMap} = store.getState().tokenMap;
    const {faitPrices, forex} = store.getState().system;
    if (userRewardsMap && idIndex && coinMap && tokenMap && faitPrices && forex) {
        let summaryMyAmm = Object.keys(userRewardsMap).reduce((prev, key) => {
            if (/AMM-/i.test(key)) {
                // @ts-ignore
                const [, coinA, coinB] = key.match(/AMM-(\w+)-(\w+)/i);
                const ammUserReward = userRewardsMap[ key ]
                const {
                    rewardDollar,
                    rewardYuan,
                    feeDollar,
                    feeYuan
                } = getOneRewardInfo({coinB, coinA, ammUserReward, idIndex, faitPrices, forex})
                prev.rewardDollar = rewardDollar ? toBig(rewardDollar).plus(prev.rewardDollar).toNumber() : 0;
                prev.rewardYuan = rewardYuan ? toBig(rewardYuan).plus(prev.rewardYuan).toNumber() : 0;
                prev.feeDollar = feeDollar ? toBig(feeDollar).plus(prev.feeDollar).toNumber() : 0;
                prev.feeYuan = feeYuan ? toBig(feeYuan).plus(prev.feeYuan).toNumber() : 0;
            }
            return prev
        }, {
            rewardDollar: 0,
            rewardYuan: 0,
            feeDollar: 0,
            feeYuan: 0
        })

        return summaryMyAmm
    }
    return undefined
}
const getOneRewardInfo = <C>({
                                 coinA,
                                 coinB,
                                 ammUserReward,
                                 idIndex,
                                 faitPrices,
                                 forex,
                                 walletMap,
                                 snapShotData
                             }: any) => {
    let rewardToken, rewardToken2, feeA, feeB, feeDollar, feeYuan, reward, reward2, rewardDollar, rewardYuan;
    if (ammUserReward) {
        rewardToken = ammUserReward.currentRewards[ 0 ] ? idIndex[ ammUserReward.currentRewards[ 0 ].tokenId as number ] : undefined
        rewardToken2 = ammUserReward.currentRewards[ 1 ] ? idIndex[ ammUserReward.currentRewards[ 1 ].tokenId as number ] : undefined
        feeA = ammUserReward ? volumeToCountAsBigNumber(coinA, ammUserReward.feeRewards[ 0 ]) : toBig(0);
        feeB = ammUserReward ? volumeToCountAsBigNumber(coinB, ammUserReward.feeRewards[ 1 ]) : toBig(0);
        feeA = feeA ? feeA : toBig(0);
        feeB = feeB ? feeB : toBig(0);
        feeDollar = feeA.times(faitPrices[ coinA ] ? faitPrices[ coinA ].price : 0).plus(feeB.times(faitPrices[ coinB ] ? faitPrices[ coinB ].price : 0))
        feeYuan = feeDollar.times(forex);
        reward = rewardToken ? volumeToCountAsBigNumber(rewardToken, ammUserReward.currentRewards[ 0 ].volume) as BigNumber : toBig(0);
        reward2 = rewardToken2 ? volumeToCountAsBigNumber(rewardToken2, ammUserReward.currentRewards[ 1 ].volume) as BigNumber : toBig(0);
        reward = reward ? reward : toBig(0);
        reward2 = reward2 ? reward2 : toBig(0);
        rewardDollar = reward.times(rewardToken ? faitPrices[ rewardToken ].price : 1).plus(reward2.times(rewardToken2 ? faitPrices[ rewardToken2 ].price : 1));
        rewardYuan = rewardDollar.times(forex);
    }
    let balanceA, balanceB, balanceDollar, balanceYuan;
    if (walletMap && walletMap[ 'LP-' + coinA + '-' + coinB ] && snapShotData) {
        // @ts-ignore
        const ratio = new BigNumber(walletMap[ 'LP-' + coinA + '-' + coinB ].count).div(snapShotData.ammPoolSnapshot.lp.volume);
        balanceA = ratio.times(volumeToCountAsBigNumber(coinA, snapShotData.ammPoolSnapshot.pooled[ 0 ].volume) || 1);
        balanceB = ratio.times(volumeToCountAsBigNumber(coinB, snapShotData.ammPoolSnapshot.pooled[ 1 ].volume) || 1);
        // @ts-ignore
        balanceDollar = balanceA.times(faitPrices[ coinA ].price).plus(balanceB.times(faitPrices[ coinB ].price))
        balanceYuan = balanceDollar.times(forex)
    }

    return {
        feeA: feeA ? feeA.toNumber() : undefined,
        feeB: feeB ? feeB.toNumber() : undefined,
        reward: reward ? reward.toNumber() : undefined,
        rewardToken: rewardToken ? coinMap[ rewardToken ] : undefined,
        reward2: reward2 ? reward2.toNumber() : undefined,
        rewardToken2: rewardToken2 ? coinMap[ rewardToken2 ] : undefined,
        rewardDollar: rewardDollar ? rewardDollar.toNumber() : undefined,
        rewardYuan: rewardYuan ? rewardYuan.toNumber() : undefined,
        feeDollar: feeDollar ? feeDollar.toNumber() : undefined,
        feeYuan: feeYuan ? feeYuan.toNumber() : undefined,
        ammDetail: {
            coinAInfo: coinMap[ coinA ],
            coinBInfo: coinMap[ coinB ]
        },
        balanceA: balanceA ? balanceA.toNumber() : undefined,
        balanceB: balanceB ? balanceB.toNumber() : undefined,
        balanceDollar: balanceDollar ? balanceDollar.toNumber() : undefined,
        balanceYuan: balanceYuan ? balanceYuan.toNumber() : undefined,
    } as MyAmmLP<C>
}

export const makeMyAmmWithSnapshot = <C extends { [ key: string ]: any }>(market: any, _walletMap: WalletMapExtend<C> | undefined, ammUserRewardMap: LoopringMap<AmmUserReward> | undefined, snapShotData?: {
    tickerData?: TickerData | undefined
    ammPoolSnapshot: AmmPoolSnapshot | undefined
} | undefined) => {
    const {coinMap, idIndex, tokenMap} = store.getState().tokenMap;
    const {faitPrices, forex} = store.getState().system;
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
    let _myAmm: Partial<MyAmmLP<C>> = {};
    if (ammUserRewardMap && ammUserRewardMap[ 'AMM-' + market ]
        && snapShotData && snapShotData.ammPoolSnapshot) {
        const ammUserReward: AmmUserReward = ammUserRewardMap[ 'AMM-' + market ];
        // @ts-ignore
        if (coinMap && tokenMap && idIndex && forex && faitPrices) {
            _myAmm = getOneRewardInfo({
                coinA, coinB, ammUserReward,
                idIndex, faitPrices, forex, walletMap: _walletMap, snapShotData
            })

            return _myAmm as MyAmmLP<C>
        }
    }
    return {
        feeA: undefined,
        feeB: undefined,
        feeDollar: undefined,
        feeYuan: undefined,
        reward: undefined,
        rewardToken: undefined as any,
        balanceA: undefined,
        balanceB: undefined,
        balanceYuan: undefined,
        balanceDollar: undefined,
    }
}

export const makeMyAmmWithStat = <C extends { [ key: string ]: any }>
(market: any,
 _walletMap: WalletMapExtend<C> | undefined,
 ammUserRewardMap: LoopringMap<AmmUserReward> | undefined,
 ammDetail: AmmDetailStore<C>) => {
    const {coinMap, idIndex, tokenMap} = store.getState().tokenMap;
    const {faitPrices, forex} = store.getState().system;
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
    let _myAmm = {};
    let balanceA, balanceB, balanceDollar, balanceYuan;
    if (_walletMap && _walletMap[ 'LP-' + coinA + '-' + coinB ] && forex) {
        // @ts-ignore
        const ratio = new BigNumber(_walletMap[ 'LP-' + coinA + '-' + coinB ].count).div(ammDetail.totalLPToken);
        balanceA = ratio.times(volumeToCountAsBigNumber(coinA, ammDetail.totalA ? ammDetail.totalA : 0) || 1);
        balanceB = ratio.times(volumeToCountAsBigNumber(coinB, ammDetail.totalB ? ammDetail.totalB : 0) || 1);
        // @ts-ignore
        balanceDollar = balanceA.times(faitPrices[ coinA ] ? faitPrices[ coinA ].price : 0).plus(balanceB.times(faitPrices[ coinB ] ? faitPrices[ coinB ].price : 0))
        balanceYuan = balanceDollar.times(forex);
        _myAmm = {
            // ...ammDetail,
            balanceA: balanceA.toNumber(),
            balanceB: balanceB.toNumber(),
            balanceYuan: balanceYuan.toNumber(),
            balanceDollar: balanceDollar.toNumber(),
        }
    }
    if (ammUserRewardMap && ammUserRewardMap[ 'AMM-' + market ]
        && ammDetail && forex) {
        const ammUserReward: AmmUserReward = ammUserRewardMap[ 'AMM-' + market ];
        let rewardToken, rewardToken2, feeA, feeB, feeDollar, feeYuan, reward, reward2, rewardDollar, rewardYuan;

        if (coinMap && tokenMap && idIndex && forex && faitPrices && ammUserReward) {
            rewardToken = ammUserReward.currentRewards[ 0 ] ? idIndex[ ammUserReward.currentRewards[ 0 ].tokenId as number ] : undefined
            rewardToken2 = ammUserReward.currentRewards[ 1 ] ? idIndex[ ammUserReward.currentRewards[ 1 ].tokenId as number ] : undefined
            feeA = ammUserReward ? volumeToCountAsBigNumber(coinA, ammUserReward.feeRewards[ 0 ]) : toBig(0);
            feeB = ammUserReward ? volumeToCountAsBigNumber(coinB, ammUserReward.feeRewards[ 1 ]) : toBig(0);
            feeA = feeA ? feeA : toBig(0);
            feeB = feeB ? feeB : toBig(0);
            feeDollar = feeA.times(faitPrices[ coinA ] ? faitPrices[ coinA ].price : 0).plus(feeB.times(faitPrices[ coinB ] ? faitPrices[ coinB ].price : 0))
            feeYuan = feeDollar.times(forex);
            reward = rewardToken ? volumeToCountAsBigNumber(rewardToken, ammUserReward.currentRewards[ 0 ].volume) as BigNumber : toBig(0);
            reward2 = rewardToken2 ? volumeToCountAsBigNumber(rewardToken2, ammUserReward.currentRewards[ 1 ].volume) as BigNumber : toBig(0);
            reward = reward ? reward : toBig(0);
            reward2 = reward2 ? reward2 : toBig(0);
            rewardDollar = reward.times(rewardToken ? faitPrices[ rewardToken ].price : 1).plus(reward2.times(rewardToken2 ? faitPrices[ rewardToken2 ].price : 1));
            rewardYuan = rewardDollar.times(forex);
            _myAmm = {
                ..._myAmm,
                feeA: feeA ? feeA.toNumber() : undefined,
                feeB: feeB ? feeB.toNumber() : undefined,
                reward: reward ? reward.toNumber() : undefined,
                // @ts-ignore
                rewardToken: rewardToken ? coinMap[ rewardToken ] : undefined,
                reward2: reward2 ? reward2.toNumber() : undefined,
                // @ts-ignore
                rewardToken2: rewardToken2 ? coinMap[ rewardToken2 ] : undefined,
                rewardDollar: rewardDollar ? rewardDollar.toNumber() : undefined,
                rewardYuan: rewardYuan ? rewardYuan.toNumber() : undefined,
                feeDollar: feeDollar ? feeDollar.toNumber() : undefined,
                feeYuan: feeYuan ? feeYuan.toNumber() : undefined,
                ammDetail: {
                    // @ts-ignore
                    coinAInfo: coinA ? coinMap[ coinA ] : undefined,
                    // @ts-ignore
                    coinBInfo: coinB ? coinMap[ coinB ] : undefined,
                },
            }

        }
        return _myAmm as MyAmmLP<C>
    }
    return {
        feeA: undefined,
        feeB: undefined,
        feeDollar: undefined,
        feeYuan: undefined,
        reward: undefined,
        rewardToken: undefined as any,
        balanceA: undefined,
        balanceB: undefined,
        balanceYuan: undefined,
        balanceDollar: undefined,
    }
}

// if (ammUserReward) {
//     const symbol = ammUserReward.currentRewards[ 0 ] ? idIndex[ ammUserReward.currentRewards[ 0 ].tokenId as number ] : undefined
//     const symbol2 = ammUserReward.currentRewards[ 1 ] ? idIndex[ ammUserReward.currentRewards[ 1 ].tokenId as number ] : undefined
//
//     _myAmm = {
//         ..._myAmm,
//         feeA: ammUserReward ? volumeToCount(coinA, ammUserReward.feeRewards[ 0 ]) : 0,//Number(ammUserReward.feeRewards[ 0 ]) : 0,
//         feeB: ammUserReward ? volumeToCount(coinB, ammUserReward.feeRewards[ 1 ]) : 0,//Number(ammUserReward.feeRewards[ 1 ]) : 0,
//         reward: symbol ? volumeToCount(symbol, ammUserReward.currentRewards[ 0 ].volume) : 0,
//         // @ts-ignore
//         rewardToken: symbol ? coinMap[ symbol ] : undefined,
//         reward2: symbol2 ? volumeToCount(symbol2, ammUserReward.currentRewards[ 1 ].volume) : 0,
//         // @ts-ignore
//         rewardToken2: symbol2 ? coinMap[ symbol2 ] : undefined,
//
//
//     }
//     _myAmm.feeDollar = _myAmm.feeA && _myAmm.feeA * faitPrices[ coinA ].price;
//     _myAmm.feeDollar = _myAmm.feeB && _myAmm.feeB * faitPrices[ coinB ].price;
// }
//
//
// if (_walletMap && _walletMap[ 'LP-' + market ]) {
//     // @ts-ignore
//     const ratio = new BigNumber(_walletMap[ 'LP-' + market ].detail.total).div(snapShotData.ammPoolSnapshot.lp.volume);
//     _myAmm = {
//         ..._myAmm,  //snapShotData.ammPoolSnapshot.pooled[ 0 ].volume).div(BIG10.pow(tokenMap[coinA].decimals)
//         balanceA: ratio.times(volumeToCountAsBigNumber(coinA, snapShotData.ammPoolSnapshot.pooled[ 0 ].volume) || 1).toNumber(),
//         balanceB: ratio.times(volumeToCountAsBigNumber(coinB, snapShotData.ammPoolSnapshot.pooled[ 1 ].volume) || 1).toNumber(),
//     }
//     // @ts-ignore
//     _myAmm.balanceDollar = _myAmm.balanceA * faitPrices[ coinA ].price + _myAmm.balanceB * faitPrices[ coinB ].price
//     _myAmm.balanceYuan = _myAmm.balanceDollar * forex
// }
// export const getAmmPoolGameUserRanks = ():Promise<AmmUserRewardMap> => {
//     const {accountId} = store.getState().account
//     //https://api3.loopring.io/api/v2/amm/user/rewards?owner=10917
//     if(LoopringAPI.ammpoolAPI){
//         return LoopringAPI.ammpoolAPI.getAmmPoolUserRewards({owner:accountId}).then(({ammUserRewardMap}:any)=>{
//               return ammUserRewardMap  as AmmUserRewardMap
//         })
//     }else{
//         return  Promise.resolve({} as AmmUserRewardMap);
//     }
//
//     // return LoopringAPI.ammpoolAPI?.getUserAmmPoolTxs({accountId}, apiKey).then(({userAmmPoolTxs}) => {
//     //     return userAmmPoolTxs
//     // })
//     // if(LoopringAPI.ammpoolAPI)   {
//     //    let promiseList =  marketKeys.map((key)=>{
//     //         // @ts-ignore
//     //         return LoopringAPI.ammpoolAPI.getAmmPoolGameUserRank({owner:accAddr,ammPoolMarket:'key'},apiKey)
//     //     })
//     //     return Promise.all(promiseList).then(
//     //         (array:any[])=>{
//     //
//     //           return  array.reduce((prev,item:{userRankList:GameRankInfo[]},index)=>{
//     //                 const market = marketKeys[index]
//     //                 prev[ market] = item.userRankList[0]
//     //                 return item.userRankList[0]
//     //             },{})
//     //
//     //         }
//     //     )
//     // }else{
//     //   return  Promise.resolve({});
//     // }
//
//
//
//
// }
//
// {
//     userRankList: GameRankInfo[];
//     raw_data: any;
// }
