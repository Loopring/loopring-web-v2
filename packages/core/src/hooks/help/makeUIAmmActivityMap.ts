import {
  AmmPoolActivityRule,
  AmmPoolActivityStatus,
  AmmPoolSnapshot,
  AmmUserReward,
  AmmUserRewardMap,
  LoopringMap,
  TickerData,
  toBig,
} from "@loopring-web/loopring-sdk";
import {
  AmmActivity,
  AmmCardProps,
  MyAmmLP,
  myError,
} from "@loopring-web/common-resources";
import { AmmDetailStore, store, VolToNumberWithPrecision } from "../../index";
import BigNumber from "bignumber.js";
import { volumeToCount, volumeToCountAsBigNumber } from "./volumeToCount";
import { coinMap } from "@loopring-web/component-lib";
import { WalletMapExtend } from "./makeWallet";
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
                const symbol =
                  idIndex[ammPoolActivityRule.awardRules[0].tokenId as any];
                const totalRewards = VolToNumberWithPrecision(
                  ammPoolActivityRule.awardRules[0].volume,
                  symbol
                );
                // @ts-ignore
                const myRewardVol =
                  myReward &&
                  myReward[ammPoolActivityRule.market]?.currentRewards[0]
                    ? myReward[ammPoolActivityRule.market]?.currentRewards[0]
                        .volume
                    : 0;

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
  const { forex } = store.getState().system;
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
                  const coinAPriceDollar = tokenPrices
                    ? tokenPrices[coinAInfo?.simpleName]
                    : 0;
                  const coinAPriceYuan = coinAPriceDollar * (forex || 6.5);
                  const coinBPriceDollar = tokenPrices
                    ? tokenPrices[coinBInfo?.simpleName]
                    : 0;
                  const coinBPriceYuan = coinBPriceDollar * (forex || 6.5);
                  const rewardTokenDollar = tokenPrices
                    ? tokenPrices[item?.rewardToken?.simpleName]
                    : 0;
                  const rewardTokenYuan = rewardTokenDollar * (forex || 6.5);
                  // myLog('matchRes:', matchRes, ' coinAInfo:', coinAInfo, ' coinBInfo:', coinBInfo)
                  return {
                    ..._.cloneDeep(_ammInfo),
                    coinAInfo,
                    coinBInfo,
                    coinAPriceDollar,
                    coinAPriceYuan,
                    coinBPriceDollar,
                    coinBPriceYuan,
                    activity: {
                      ...item,
                      rewardTokenDollar: rewardTokenDollar,
                      rewardTokenYuan: rewardTokenYuan,
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
type Value = undefined | number;
export type SummaryMyAmm = {
  rewardDollar: Value;
  rewardYuan: Value;
  feeDollar: Value;
  feeYuan: Value;
};
export const makeSummaryMyAmm = <_C extends { [key: string]: any }>({
  userRewardsMap,
}: {
  userRewardsMap: LoopringMap<AmmUserReward> | undefined;
}): SummaryMyAmm | undefined => {
  const { coinMap, idIndex, tokenMap } = store.getState().tokenMap;
  const { fiatPrices, forex } = store.getState().system;
  if (userRewardsMap && idIndex && coinMap && tokenMap && fiatPrices && forex) {
    let summaryMyAmm = Object.keys(userRewardsMap).reduce(
      (prev, key) => {
        if (/AMM-/i.test(key)) {
          // @ts-ignore
          const [, coinA, coinB] = key.match(/AMM-(\w+)-(\w+)/i);
          const ammUserReward = userRewardsMap[key];
          const { rewardDollar, rewardYuan, feeDollar, feeYuan } =
            getOneRewardInfo({
              coinB,
              coinA,
              ammUserReward,
              idIndex,
              fiatPrices,
              forex,
            });
          prev.rewardDollar = rewardDollar
            ? toBig(rewardDollar).plus(prev.rewardDollar).toNumber()
            : 0;
          prev.rewardYuan = rewardYuan
            ? toBig(rewardYuan).plus(prev.rewardYuan).toNumber()
            : 0;
          prev.feeDollar = feeDollar
            ? toBig(feeDollar).plus(prev.feeDollar).toNumber()
            : 0;
          prev.feeYuan = feeYuan
            ? toBig(feeYuan).plus(prev.feeYuan).toNumber()
            : 0;
        }
        return prev;
      },
      {
        rewardDollar: 0,
        rewardYuan: 0,
        feeDollar: 0,
        feeYuan: 0,
      }
    );

    return summaryMyAmm;
  }
  return undefined;
};
const getOneRewardInfo = <C>({
  coinA,
  coinB,
  ammUserReward,
  idIndex,
  fiatPrices,
  forex,
  walletMap,
  snapShotData,
}: any) => {
  let rewardToken,
    rewardToken2,
    feeA,
    feeB,
    feeDollar,
    feeYuan,
    reward,
    reward2,
    rewardDollar,
    rewardYuan;
  if (ammUserReward) {
    rewardToken = ammUserReward.currentRewards[0]
      ? idIndex[ammUserReward.currentRewards[0].tokenId as number]
      : undefined;
    rewardToken2 = ammUserReward.currentRewards[1]
      ? idIndex[ammUserReward.currentRewards[1].tokenId as number]
      : undefined;
    feeA = ammUserReward
      ? volumeToCountAsBigNumber(coinA, ammUserReward.feeRewards[0])
      : toBig(0);
    feeB = ammUserReward
      ? volumeToCountAsBigNumber(coinB, ammUserReward.feeRewards[1])
      : toBig(0);
    feeA = feeA ? feeA : toBig(0);
    feeB = feeB ? feeB : toBig(0);
    feeDollar = feeA
      .times(fiatPrices[coinA] ? fiatPrices[coinA].price : 0)
      .plus(feeB.times(fiatPrices[coinB] ? fiatPrices[coinB].price : 0));
    feeYuan = feeDollar.times(forex);
    reward = rewardToken
      ? (volumeToCountAsBigNumber(
          rewardToken,
          ammUserReward.currentRewards[0].volume
        ) as BigNumber)
      : toBig(0);
    reward2 = rewardToken2
      ? (volumeToCountAsBigNumber(
          rewardToken2,
          ammUserReward.currentRewards[1].volume
        ) as BigNumber)
      : toBig(0);
    reward = reward ? reward : toBig(0);
    reward2 = reward2 ? reward2 : toBig(0);
    rewardDollar = reward
      .times(rewardToken ? fiatPrices[rewardToken].price : 1)
      .plus(reward2.times(rewardToken2 ? fiatPrices[rewardToken2].price : 1));
    rewardYuan = rewardDollar.times(forex);
  }
  let balanceA, balanceB, balanceDollar, balanceYuan;
  if (walletMap && walletMap["LP-" + coinA + "-" + coinB] && snapShotData) {
    // @ts-ignore
    const ratio = new BigNumber(
      walletMap["LP-" + coinA + "-" + coinB].count
    ).div(snapShotData.ammPoolSnapshot.lp.volume);
    balanceA = ratio.times(
      volumeToCountAsBigNumber(
        coinA,
        snapShotData.ammPoolSnapshot.pooled[0].volume
      ) || 1
    );
    balanceB = ratio.times(
      volumeToCountAsBigNumber(
        coinB,
        snapShotData.ammPoolSnapshot.pooled[1].volume
      ) || 1
    );
    // @ts-ignore
    balanceDollar = balanceA
      .times(fiatPrices[coinA].price)
      .plus(balanceB.times(fiatPrices[coinB].price));
    balanceYuan = balanceDollar.times(forex);
  }

  return {
    feeA: feeA ? feeA.toNumber() : undefined,
    feeB: feeB ? feeB.toNumber() : undefined,
    reward: reward ? reward.toNumber() : undefined,
    rewardToken: rewardToken ? coinMap[rewardToken] : undefined,
    reward2: reward2 ? reward2.toNumber() : undefined,
    rewardToken2: rewardToken2 ? coinMap[rewardToken2] : undefined,
    rewardDollar: rewardDollar ? rewardDollar.toNumber() : undefined,
    rewardYuan: rewardYuan ? rewardYuan.toNumber() : undefined,
    feeDollar: feeDollar ? feeDollar.toNumber() : undefined,
    feeYuan: feeYuan ? feeYuan.toNumber() : undefined,
    ammDetail: {
      coinAInfo: coinMap[coinA],
      coinBInfo: coinMap[coinB],
    },
    balanceA: balanceA ? balanceA.toNumber() : undefined,
    balanceB: balanceB ? balanceB.toNumber() : undefined,
    balanceDollar: balanceDollar ? balanceDollar.toNumber() : undefined,
    balanceYuan: balanceYuan ? balanceYuan.toNumber() : undefined,
  } as MyAmmLP<C>;
};

export const makeMyAmmWithSnapshot = <C extends { [key: string]: any }>(
  market: any,
  _walletMap: WalletMapExtend<C> | undefined,
  ammUserRewardMap: LoopringMap<AmmUserReward> | undefined,
  snapShotData?:
    | {
        tickerData?: TickerData | undefined;
        ammPoolSnapshot: AmmPoolSnapshot | undefined;
      }
    | undefined
) => {
  const { coinMap, idIndex, tokenMap } = store.getState().tokenMap;
  const { fiatPrices, forex } = store.getState().system;
  const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
  let _myAmm: Partial<MyAmmLP<C>> = {};
  if (
    ammUserRewardMap &&
    ammUserRewardMap["AMM-" + market] &&
    snapShotData &&
    snapShotData.ammPoolSnapshot
  ) {
    const ammUserReward: AmmUserReward = ammUserRewardMap["AMM-" + market];
    // @ts-ignore
    if (coinMap && tokenMap && idIndex && forex && fiatPrices) {
      _myAmm = getOneRewardInfo({
        coinA,
        coinB,
        ammUserReward,
        idIndex,
        fiatPrices,
        forex,
        walletMap: _walletMap,
        snapShotData,
      });

      return _myAmm as MyAmmLP<C>;
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
  };
};

export const makeMyAmmWithStat = <C extends { [key: string]: any }>(
  market: any,
  _walletMap: WalletMapExtend<C> | undefined,
  ammUserRewardMap: LoopringMap<AmmUserReward> | undefined,
  ammDetail: AmmDetailStore<C>
) => {
  const { coinMap, idIndex, tokenMap } = store.getState().tokenMap;
  const { fiatPrices, forex } = store.getState().system;
  const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
  let _myAmm = {};
  let balanceA, balanceB, balanceDollar, balanceYuan;
  if (_walletMap && _walletMap["LP-" + coinA + "-" + coinB] && forex) {
    // @ts-ignore
    const totalLpAmount = _walletMap["LP-" + coinA + "-" + coinB].count || 0;
    // const ratio = new BigNumber(_walletMap[ 'LP-' + coinA + '-' + coinB ].count).div(ammDetail.totalLPToken);
    const ratio = totalLpAmount / (ammDetail.totalLPToken || 1);
    // balanceA = ratio.times(volumeToCountAsBigNumber(coinA, ammDetail.totalA ? ammDetail.totalA : 0) || 1);
    balanceA = ratio * (ammDetail.totalA || 0);
    // balanceB = ratio.times(volumeToCountAsBigNumber(coinB, ammDetail.totalB ? ammDetail.totalB : 0) || 1);
    balanceB = ratio * (ammDetail.totalB || 0);
    // @ts-ignore
    // balanceDollar = balanceA.times(fiatPrices[ coinA ] ? fiatPrices[ coinA ].price : 0).plus(balanceB.times(fiatPrices[ coinB ] ? fiatPrices[ coinB ].price : 0))

    // WARNING! NOT ACCERATE
    balanceDollar =
      balanceA * (fiatPrices[coinA] ? fiatPrices[coinA].price : 0) +
      balanceB * (fiatPrices[coinB] ? fiatPrices[coinB].price : 0);
    balanceYuan = balanceDollar * forex;

    _myAmm = {
      // ...ammDetail,
      balanceA: balanceA,
      balanceB: balanceB,
      balanceYuan: balanceYuan,
      balanceDollar: balanceDollar,
      totalLpAmount: totalLpAmount,
    };
  }
  if (
    ammUserRewardMap &&
    ammUserRewardMap["AMM-" + market] &&
    ammDetail &&
    forex
  ) {
    const ammUserReward: AmmUserReward = ammUserRewardMap["AMM-" + market];
    let rewardToken,
      rewardToken2,
      feeA,
      feeB,
      feeDollar,
      feeYuan,
      reward,
      reward2,
      rewardDollar,
      rewardYuan;

    if (
      coinMap &&
      tokenMap &&
      idIndex &&
      forex &&
      fiatPrices &&
      ammUserReward
    ) {
      rewardToken = ammUserReward.currentRewards[0]
        ? idIndex[ammUserReward.currentRewards[0].tokenId as number]
        : undefined;
      rewardToken2 = ammUserReward.currentRewards[1]
        ? idIndex[ammUserReward.currentRewards[1].tokenId as number]
        : undefined;
      feeA = ammUserReward
        ? volumeToCountAsBigNumber(coinA, ammUserReward.feeRewards[0])
        : toBig(0);
      feeB = ammUserReward
        ? volumeToCountAsBigNumber(coinB, ammUserReward.feeRewards[1])
        : toBig(0);
      feeA = feeA ? feeA : toBig(0);
      feeB = feeB ? feeB : toBig(0);
      feeDollar = feeA
        .times(fiatPrices[coinA] ? fiatPrices[coinA].price : 0)
        .plus(feeB.times(fiatPrices[coinB] ? fiatPrices[coinB].price : 0));
      feeYuan = feeDollar.times(forex);
      reward = rewardToken
        ? (volumeToCountAsBigNumber(
            rewardToken,
            ammUserReward.currentRewards[0].volume
          ) as BigNumber)
        : toBig(0);
      reward2 = rewardToken2
        ? (volumeToCountAsBigNumber(
            rewardToken2,
            ammUserReward.currentRewards[1].volume
          ) as BigNumber)
        : toBig(0);
      reward = reward ? reward : toBig(0);
      reward2 = reward2 ? reward2 : toBig(0);
      rewardDollar = reward
        .times(rewardToken ? fiatPrices[rewardToken].price : 1)
        .plus(reward2.times(rewardToken2 ? fiatPrices[rewardToken2].price : 1));
      rewardYuan = rewardDollar.times(forex);
      _myAmm = {
        ..._myAmm,
        feeA: feeA ? feeA.toNumber() : undefined,
        feeB: feeB ? feeB.toNumber() : undefined,
        reward: reward ? reward.toNumber() : undefined,
        // @ts-ignore
        rewardToken: rewardToken ? coinMap[rewardToken] : undefined,
        reward2: reward2 ? reward2.toNumber() : undefined,
        // @ts-ignore
        rewardToken2: rewardToken2 ? coinMap[rewardToken2] : undefined,
        rewardDollar: rewardDollar ? rewardDollar.toNumber() : undefined,
        rewardYuan: rewardYuan ? rewardYuan.toNumber() : undefined,
        feeDollar: feeDollar ? feeDollar.toNumber() : undefined,
        feeYuan: feeYuan ? feeYuan.toNumber() : undefined,
        ammDetail: {
          // @ts-ignore
          coinAInfo: coinA ? coinMap[coinA] : undefined,
          // @ts-ignore
          coinBInfo: coinB ? coinMap[coinB] : undefined,
        },
      };
    }
    return _myAmm as MyAmmLP<C>;
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
  };
};
