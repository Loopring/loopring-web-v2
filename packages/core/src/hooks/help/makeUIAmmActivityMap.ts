import {
  AmmPoolActivityRule,
  AmmPoolActivityStatus,
  AmmUserRewardMap,
  LoopringMap,
  toBig,
} from "@loopring-web/loopring-sdk";
import {
  AmmActivity,
  AmmCardProps,
  getValuePrecisionThousand,
  MyAmmLP,
  myError,
} from "@loopring-web/common-resources";
import {
  AmmDetailStore,
  makeWalletLayer2,
  MyAmmLPMap,
  store,
  VolToNumberWithPrecision,
} from "../../index";
import BigNumber from "bignumber.js";
import * as sdk from "@loopring-web/loopring-sdk";
import { volumeToCount, volumeToCountAsBigNumber } from "./volumeToCount";
import { coinMap } from "@loopring-web/component-lib";
import _ from "lodash";

export type AmmActivityViewMap<R, I> = {
  [key in keyof R]?: AmmActivity<I>[] | undefined;
};
export const makeUIAmmActivityMap = <
  R extends { [key: string]: any },
  I extends { [key: string]: any }
>(
  {
    ammActivityMap,
    type,
    ammPoolActivityStatus,
  }: {
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined;
    type?:
      | "AMM_MINING"
      | "SWAP_VOLUME_RANKING"
      | "ORDERBOOK_MINING"
      | undefined;
    ammPoolActivityStatus: AmmPoolActivityStatus[];
  },
  myReward: AmmUserRewardMap | undefined
): Array<AmmCardProps<I>> => {
  const { coinMap, tokenMap, idIndex } = store.getState().tokenMap;

  let ammActivityViewMap: AmmActivityViewMap<R, I> = {};
  if (ammActivityMap) {
    const genView = (ammActivityMapItem: any) => {
      let ammActivityViewMapTmp: AmmActivityViewMap<R, I> = {};
      ammPoolActivityStatus.forEach((status: AmmPoolActivityStatus) => {
        if (ammActivityMapItem[status]) {
          // @ts-ignore
          ammActivityMapItem[status].reduce(
            (
              prev: AmmActivityViewMap<R, I>,
              ammPoolActivityRule: AmmPoolActivityRule
            ) => {
              if (
                coinMap &&
                ammPoolActivityRule.awardRules[0] &&
                idIndex &&
                tokenMap
              ) {
                // @ts-ignore
                const { current } = myReward
                  ? myReward[ammPoolActivityRule.market]
                  : { current: undefined };

                const symbol =
                  idIndex[ammPoolActivityRule.awardRules[0].tokenId as any];
                const totalRewards = VolToNumberWithPrecision(
                  ammPoolActivityRule.awardRules[0].volume,
                  symbol
                );
                const myRewardVol = current?.currentRewards[0]?.volume ?? 0;

                const item = {
                  // @ts-ignore
                  market: ammPoolActivityRule.market,
                  status: ammPoolActivityRule.status,
                  ruleType: ammPoolActivityRule.ruleType,
                  rewardToken: coinMap[symbol],
                  totalRewards: Number(totalRewards),
                  maxSpread: (ammPoolActivityRule?.maxSpread || 0) * 100,
                  myRewards:
                    status === AmmPoolActivityStatus.InProgress &&
                    myReward &&
                    myReward[ammPoolActivityRule.market]
                      ? volumeToCount(symbol, myRewardVol)
                      : 0,
                  duration: {
                    from: new Date(ammPoolActivityRule?.rangeFrom),
                    to: new Date(ammPoolActivityRule?.rangeTo),
                  },
                  isPass: AmmPoolActivityStatus.EndOfGame === status,
                };
                if (prev[ammPoolActivityRule.market]) {
                  // @ts-ignore
                  prev[ammPoolActivityRule.market].push(item);
                } else {
                  // @ts-ignore
                  prev[ammPoolActivityRule.market] = [item];
                }

                // return prev;
              }
              return prev;
            },
            ammActivityViewMapTmp
          );
        }
      });

      return ammActivityViewMapTmp;
    };

    if (type === undefined) {
      const keys = Object.keys(ammActivityMap);
      keys.forEach((item: any, _ind: number) => {
        const newMap = genView(ammActivityMap[item]);
        const copiedNewMap = _.cloneDeep(newMap);
        ammActivityViewMap = { ...ammActivityViewMap, [item]: copiedNewMap };
      });
    } else {
      ammActivityViewMap = genView(ammActivityMap[type]);
    }
  }

  const resultArray = makeAsCard(ammActivityViewMap);
  return resultArray;
};

const makeAsCard = <
  _R extends { [key: string]: any },
  I extends { [key: string]: any }
>(
  ammActivityViewMap: any,
  _myReward?: any
): Array<AmmCardProps<I>> => {
  const { coinMap } = store.getState().tokenMap;
  const { ammMap } = store.getState().amm.ammMap;
  const { tokenPrices } = store.getState().tokenPrices;
  try {
    if (ammActivityViewMap && coinMap) {
      // @ts-ignore
      // return ammActivityViewMap.map()
      let finalArray = [] as any[];
      const catogoriedMap = Object.keys(ammActivityViewMap);
      catogoriedMap.forEach((item) => {
        const basicArray = Object.keys(ammActivityViewMap[item]).reduce(
          (prev: Array<AmmCardProps<I>>, key: string) => {
            const activities = ammActivityViewMap[item][key];

            const _ammInfo = ammMap[key as string];
            if (activities) {
              //_ammInfo && _ammInfo.coinA && coinMap &&

              // @ts-ignore
              const itemArray = activities.map((item: AmmActivity) => {
                const matchRes = (item.market as string)
                  .replace("AMM-", "")
                  .match(/(\w+)-(\w+)/i);

                if (matchRes) {
                  const coinAInfo = coinMap[matchRes[1]];
                  const coinBInfo = coinMap[matchRes[2]];
                  const coinApriceU = tokenPrices
                    ? tokenPrices[coinAInfo?.simpleName]
                    : 0;
                  const coinBpriceU = tokenPrices
                    ? tokenPrices[coinBInfo?.simpleName]
                    : 0;
                  const rewardTokenU = tokenPrices
                    ? tokenPrices[item?.rewardToken?.simpleName]
                    : 0;
                  // myLog('matchRes:', matchRes, ' coinAInfo:', coinAInfo, ' coinBInfo:', coinBInfo)
                  return {
                    ..._.cloneDeep(_ammInfo),
                    coinAInfo,
                    coinBInfo,
                    coinApriceU,
                    coinBpriceU,
                    activity: {
                      ...item,
                      rewardTokenU: rewardTokenU,
                    },
                  };
                }

                return {};
              });
              prev = [...prev, ...itemArray];
            }
            return prev;
          },
          [] as Array<AmmCardProps<I>>
        ) as Array<AmmCardProps<I>>;

        finalArray = [...finalArray, ...basicArray];
      });
      return finalArray;
    } else {
      return [] as Array<AmmCardProps<I>>;
    }
  } catch (error: any) {
    myError(error);
    return [];
  }
};
type Value = undefined | number | string;
export type SummaryMyInvest = {
  rewardU: Value;
  feeU: Value;
  investDollar?: Value;
  ammPoolDollar?: Value;
  stakeETHDollar?: Value;
  stakeLRCDollar?: Value;
  dualStakeDollar?: Value;
};
export const makeSummaryMyAmm = <C extends { [key: string]: any }>({
  userRewardsMap,
}: {
  userRewardsMap: AmmUserRewardMap | undefined;
}): {
  myAmmLPMap: MyAmmLPMap<C> | undefined;
  rewardU: string;
  feeU: string;
} => {
  const { idIndex, tokenMap } = store.getState().tokenMap;
  const { ammMap } = store.getState().amm.ammMap;
  if (ammMap && idIndex && tokenMap) {
    return Object.keys(ammMap).reduce(
      (prev, key) => {
        let ammInfo = ammMap[key];
        if (ammInfo) {
          const value = getMyAmmInfo({
            ammInfo,
            ammUserReward: userRewardsMap && userRewardsMap[key],
          });

          return {
            myAmmLPMap: {
              ...prev.myAmmLPMap,
              [ammInfo.market]: value,
            },
            rewardU: value.rewardU
              ? toBig(value.rewardU).plus(prev.rewardU).toString()
              : prev.rewardU,
            feeU: value.feeU
              ? toBig(value.feeU).plus(prev.feeU).toString()
              : prev.feeU,
          };
        } else {
          return prev;
        }
      },
      {
        myAmmLPMap: {} as any,
        rewardU: "0",
        feeU: "0",
      } as any
    );
  } else {
    return {
      myAmmLPMap: {} as any,
      rewardU: "0",
      feeU: "0",
    };
  }
};
/** userRewradCalc **/
const getRewardCalc = ({
  ammInfo,
  ammUserReward,
}: {
  ammInfo: AmmDetailStore<any>;
  ammUserReward?: {
    current: sdk.AmmUserReward;
    lastDay: sdk.AmmUserReward;
  };
}) => {
  let rewardToken,
    rewardToken2,
    feeA,
    feeB,
    feeU,
    reward,
    reward2,
    rewardU,
    feeA24,
    feeB24,
    feeU24,
    reward24,
    reward224,
    rewardU24,
    extraRewards24: any[] = [],
    extraU24 = 0;
  const { current, lastDay } = ammUserReward ?? {};
  const { tokenPrices } = store.getState().tokenPrices;
  const { idIndex } = store.getState().tokenMap;

  if (current) {
    rewardToken = current.currentRewards[0]
      ? idIndex[current.currentRewards[0].tokenId as number]
      : undefined;
    rewardToken2 = current.currentRewards[1]
      ? idIndex[current.currentRewards[1].tokenId as number]
      : undefined;
    feeA =
      volumeToCountAsBigNumber(ammInfo.coinA, current?.feeRewards[0] ?? 0) ??
      toBig(0);
    feeB =
      volumeToCountAsBigNumber(ammInfo.coinB, current?.feeRewards[1] ?? 0) ??
      toBig(0);
    feeU = feeA
      .times(tokenPrices[ammInfo.coinA] ? tokenPrices[ammInfo.coinA] : 0)
      .plus(
        feeB.times(tokenPrices[ammInfo.coinB] ? tokenPrices[ammInfo.coinB] : 0)
      );
    reward = rewardToken
      ? (volumeToCountAsBigNumber(
          rewardToken,
          current.currentRewards[0].volume
        ) as BigNumber)
      : toBig(0);
    reward2 = rewardToken2
      ? (volumeToCountAsBigNumber(
          rewardToken2,
          current.currentRewards[1].volume
        ) as BigNumber)
      : toBig(0);
    reward = reward ? reward : toBig(0);
    reward2 = reward2 ? reward2 : toBig(0);
    rewardU = reward
      .times(rewardToken ? tokenPrices[rewardToken] : 1)
      .plus(reward2.times(rewardToken2 ? tokenPrices[rewardToken2] : 1));
    if (lastDay) {
      feeA24 =
        volumeToCountAsBigNumber(ammInfo.coinA, lastDay?.feeRewards[0] ?? 0) ??
        toBig(0);
      feeB24 =
        volumeToCountAsBigNumber(ammInfo.coinB, lastDay.feeRewards[1] ?? 0) ??
        toBig(0);
      feeU24 = feeA24
        .times(tokenPrices[ammInfo.coinA] ? tokenPrices[ammInfo.coinA] : 0)
        .plus(
          feeB24.times(
            tokenPrices[ammInfo.coinB] ? tokenPrices[ammInfo.coinB] : 0
          )
        );
      reward24 = rewardToken
        ? (volumeToCountAsBigNumber(
            rewardToken,
            lastDay?.currentRewards[0]?.volume ?? 0
          ) as BigNumber)
        : toBig(0);
      reward224 = rewardToken2
        ? (volumeToCountAsBigNumber(
            rewardToken2,
            lastDay?.currentRewards[1]?.volume ?? 0
          ) as BigNumber)
        : toBig(0);
      rewardU24 = reward24
        .times(rewardToken ? tokenPrices[rewardToken] : 1)
        .plus(reward24.times(rewardToken2 ? tokenPrices[rewardToken2] : 1));
      extraU24 = 0;
      extraRewards24 = lastDay?.extraRewards?.map((item: any) => {
        const tokenSymbol = idIndex[item.tokenId as number];
        const extraItem = volumeToCountAsBigNumber(
          tokenSymbol,
          item.volume ?? 0
        );
        extraU24 += (extraItem ?? toBig(0))
          .times(tokenPrices[tokenSymbol] ?? 1)
          .toNumber();
        return {
          tokenSymbol,
          amount: extraItem?.toNumber(),
        };
      });
    }
  }
  return {
    rewardToken: rewardToken ? coinMap[rewardToken] : undefined,
    rewardToken2: rewardToken2 ? coinMap[rewardToken2] : undefined,
    feeA: feeA ? feeA.toNumber() : undefined,
    feeB: feeB ? feeB.toNumber() : undefined,
    reward: reward ? reward.toNumber() : undefined,
    reward2: reward2 ? reward2.toNumber() : undefined,
    rewardU: rewardU ? rewardU.toNumber() : undefined,
    feeU: feeU ? feeU.toNumber() : undefined,
    feeA24: feeA24 ? feeA24.toNumber() : undefined,
    feeB24: feeB24 ? feeB24.toNumber() : undefined,
    feeU24: feeU24 ? feeU24.toNumber() : undefined,
    reward24: reward24 ? reward24.toNumber() : undefined,
    reward224: reward224 ? reward224.toNumber() : undefined,
    rewardU24: rewardU24 ? rewardU24.toNumber() : undefined,
    extraRewards24: extraRewards24,
    extraU24: extraU24 ? extraU24 : undefined,
  };
};
/** userAmmAsset&Reward **/
const getMyAmmInfo = <C>({ ammInfo, ammUserReward }: any) => {
  let rewards;
  const { tokenPrices } = store.getState().tokenPrices;
  const { tokenMap } = store.getState().tokenMap;
  if (ammUserReward) {
    rewards = getRewardCalc({
      ammInfo,
      ammUserReward,
    });
  }
  let balanceA, balanceB, balanceU;
  const { walletMap } = makeWalletLayer2(false);

  if (walletMap && walletMap["LP-" + ammInfo.market] && ammInfo.totalLPToken) {
    // @ts-ignore
    const ratio = sdk
      .toBig(walletMap["LP-" + ammInfo.market]?.count ?? 0)
      .div(ammInfo.totalLPToken);
    balanceA = ratio.times(ammInfo.totalA);
    balanceB = ratio.times(ammInfo.totalB);
    balanceU = balanceA
      .times(tokenPrices[ammInfo.coinA])
      .plus(balanceB.times(tokenPrices[ammInfo.coinB]));
  }

  return {
    ...rewards,
    balanceA: balanceA ? balanceA.toNumber() : undefined,
    balanceB: balanceB ? balanceB.toNumber() : undefined,
    balanceAStr: getValuePrecisionThousand(
      balanceA,
      tokenMap[ammInfo.coinA].precision,
      tokenMap[ammInfo.coinA].precision,
      undefined,
      false
    ),
    balanceBStr: getValuePrecisionThousand(
      balanceB,
      tokenMap[ammInfo.coinB].precision,
      tokenMap[ammInfo.coinB].precision,
      undefined,
      false
    ),
    balanceU: balanceU ? balanceU.toNumber() : undefined,
  } as MyAmmLP<C>;
};

// export const makeMyAmmWithSnapshot = <C extends { [key: string]: any }>(
//   market: any,
//   _walletMap: WalletMapExtend<C> | undefined,
//   ammUserRewardMap: AmmUserRewardMap | undefined,
//   snapShotData?:
//     | {
//         tickerData?: TickerData | undefined;
//         ammPoolSnapshot: AmmPoolSnapshot | undefined;
//       }
//     | undefined
// ) => {
//   const { coinMap, idIndex, tokenMap } = store.getState().tokenMap;
//   const { tokenPrices } = store.getState().tokenPrices;
//   const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
//   let _myAmm: Partial<MyAmmLP<C>> = {};
//   if (
//     ammUserRewardMap &&
//     ammUserRewardMap["AMM-" + market] &&
//     snapShotData &&
//     snapShotData.ammPoolSnapshot
//   ) {
//     const ammUserReward = ammUserRewardMap["AMM-" + market];
//     if (coinMap && tokenMap && idIndex) {
//       // _myAmm = getOneRewardInfo({
//       //   coinA,
//       //   coinB,
//       //   ammUserReward,
//       //   idIndex,
//       //   tokenPrices,
//       //   walletMap: _walletMap,
//       //   snapShotData,
//       // });
//       return _myAmm as MyAmmLP<C>;
//     }
//   }
//   return {
//     feeA: undefined,
//     feeB: undefined,
//     feeU: undefined,
//     reward: undefined,
//     rewardToken: undefined as any,
//     balanceA: undefined,
//     balanceB: undefined,
//     balanceU: undefined,
//   };
// };

// export const makeMyAmmWithStat = <C extends { [key: string]: any }>(
//   market: any,
//   _walletMap: WalletMapExtend<C> | undefined,
//   ammUserRewardMap: AmmUserRewardMap | undefined,
//   ammDetail: AmmDetailStore<C>
// ) => {
//   const { coinMap, idIndex, tokenMap } = store.getState().tokenMap;
//   const { tokenPrices } = store.getState().tokenPrices;
//   const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
//   let _myAmm = {},
//     result = {};
//   if (ammUserRewardMap) {
//     const ammUserReward = ammUserRewardMap["AMM-" + market];
//     result = getRewardCalc({
//       coinA,
//       coinB,
//       ammUserReward,
//       idIndex,
//       tokenPrices,
//     });
//   }
//
//   let balanceA, balanceB, balanceU;
//
//   if (_walletMap && _walletMap["LP-" + coinA + "-" + coinB] && coinMap) {
//     // @ts-ignore
//     const totalLpAmount = _walletMap["LP-" + coinA + "-" + coinB].count || 0;
//     // const ratio = new BigNumber(_walletMap[ 'LP-' + coinA + '-' + coinB ].count).div(ammDetail.totalLPToken);
//     const ratio = totalLpAmount / (ammDetail.totalLPToken || 1);
//     // balanceA = ratio.times(volumeToCountAsBigNumber(coinA, ammDetail.totalA ? ammDetail.totalA : 0) || 1);
//     balanceA = ratio * (ammDetail.totalA || 0);
//     // balanceB = ratio.times(volumeToCountAsBigNumber(coinB, ammDetail.totalB ? ammDetail.totalB : 0) || 1);
//     balanceB = ratio * (ammDetail.totalB || 0);
//     // @ts-ignore
//     // balanceU = balanceA.times(fiatPrices[ coinA ] ? fiatPrices[ coinA ].price : 0).plus(balanceB.times(fiatPrices[ coinB ] ? fiatPrices[ coinB ].price : 0))
//
//     // WARNING! NOT ACCERATE
//     balanceU =
//       balanceA * (tokenPrices[coinA] ? tokenPrices[coinA] : 0) +
//       balanceB * (tokenPrices[coinB] ? tokenPrices[coinB] : 0);
//     const isSmallBalance = balanceU < 1;
//
//     _myAmm = {
//       balanceA: balanceA,
//       balanceB: balanceB,
//       balanceAStr: getValuePrecisionThousand(
//         balanceA,
//         tokenMap[coinA].precision,
//         tokenMap[coinA].precision,
//         undefined
//       ),
//       balanceBStr: getValuePrecisionThousand(
//         balanceB,
//         tokenMap[coinB].precision,
//         tokenMap[coinB].precision,
//         undefined
//       ),
//       balanceU: balanceU,
//       totalLpAmount: totalLpAmount,
//       smallBalance: isSmallBalance,
//       ammDetail: {
//         ...ammDetail,
//         coinAInfo: coinA ? coinMap[coinA] : undefined,
//         coinBInfo: coinB ? coinMap[coinB] : undefined,
//       },
//     };
//   }
//   return {
//     ...result,
//     ..._myAmm,
//   };
// };
