import { AmmCardProps } from "@loopring-web/common-resources";
import {
  AmmPoolActivityRule,
  AmmPoolActivityStatus,
  LoopringMap,
} from "@loopring-web/loopring-sdk";
import React from "react";
import {
  makeUIAmmActivityMap,
  makeMyPoolRowWithPoolState,
  makeWalletLayer2,
  LoopringAPI,
  useAmmMap,
  useUserRewards,
  store,
  useSystem,
} from "@loopring-web/core";
export type RewardListItem = {
  amount: string;
  time: number;
};

export const useAmmMiningUI = <
  R extends { [key: string]: any },
  I extends { [key: string]: any }
>({
  ammActivityMap,
}: {
  ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined;
}): {
  ammActivityViewMap: Array<AmmCardProps<I>>;
  ammRewardRecordList: RewardListItem[];
  ammActivityPastViewMap: Array<AmmCardProps<I>>;
  getLiquidityMining: (market: string, size?: number) => Promise<void>;
  showRewardDetail: boolean;
  setShowRewardDetail: React.Dispatch<React.SetStateAction<boolean>>;
  getMyAmmShare: (market: string) => any;
} => {
  const userRewardsMapState = useUserRewards(); // store.getState().userRewardsMap
  const { userRewardsMap } = useUserRewards();
  const { apiKey, accountId } = store.getState().account;
  const { tokenPrices } = store.getState().tokenPrices;
  const { tokenMap } = store.getState().tokenMap;
  const { forex } = useSystem();
  const { ammMap } = useAmmMap();
  const { walletMap: _walletMap } = makeWalletLayer2(false);
  const [ammActivityViewMap, setAmmActivityViewMap] = React.useState<
    Array<AmmCardProps<I>>
  >([]);
  const [ammRewardRecordList, setAmmRewardRecordList] = React.useState<
    RewardListItem[]
  >([]);
  const [ammActivityPastViewMap, setAmmActivityPastViewMap] = React.useState<
    Array<AmmCardProps<I>>
  >([]);
  // const [ammUserRewardMap, setAmmUserRewardMap] = React.useState<AmmUserRewardMap>(
  //     {});
  const [showRewardDetail, setShowRewardDetail] = React.useState(false);

  const getLiquidityMining = React.useCallback(
    async (market: string, size: number = 120) => {
      if (LoopringAPI && LoopringAPI.ammpoolAPI) {
        const ammRewardList = await LoopringAPI.ammpoolAPI.getLiquidityMining(
          {
            accountId: accountId,
            market: market,
            size: size,
          },
          apiKey
        );
        const { rewards } = ammRewardList;
        const formattedRes = rewards.map((o) => ({
          amount: o.amount,
          time: o.startAt,
        }));
        setAmmRewardRecordList(formattedRes);
      }
    },
    [apiKey, accountId]
  );

  const getMyAmmShare = React.useCallback(
    (market: string) => {
      if (
        _walletMap &&
        ammMap &&
        userRewardsMap &&
        tokenPrices &&
        forex &&
        tokenMap
      ) {
        const ammKey = market.replace("LP-", "AMM-");
        const marketKey = market.replace("LP-", "");
        const rawData = makeMyPoolRowWithPoolState({
          ammDetail: ammMap[ammKey],
          walletMap: _walletMap,
          market: marketKey,
          ammUserRewardMap: userRewardsMap,
        }) as any;
        const formattedPoolRow = [rawData].map((o: any) => {
          const market = `LP-${o?.ammDetail?.coinAInfo.simpleName}-${o?.ammDetail?.coinBInfo.simpleName}`;
          const totalAmount = o.totalLpAmount;
          const totalAmmValueDollar = (tokenPrices[market] || 0) * totalAmount;
          const totalAmmValueYuan = (totalAmmValueDollar || 0) * forex;
          const coinA = o?.ammDetail?.coinAInfo?.simpleName;
          const coinB = o?.ammDetail?.coinBInfo?.simpleName;
          const precisionA = tokenMap ? tokenMap[coinA]?.precision : undefined;
          const precisionB = tokenMap ? tokenMap[coinB]?.precision : undefined;

          return {
            ...o,
            totalAmmValueDollar,
            totalAmmValueYuan,
            precisionA,
            precisionB,
          };
        });
        return !!formattedPoolRow.length ? formattedPoolRow[0] : [];
      }
      return [];
    },
    [_walletMap, ammMap, forex, tokenPrices, userRewardsMap, tokenMap]
  );

  // );
  React.useEffect(() => {
    if (ammActivityMap && Object.keys(ammActivityMap).length > 0) {
      // getAmmPoolUserRewards().then((ammUserRewardMap)=>{
      // setAmmUserRewardMap(ammUserRewardMap as AmmUserRewardMap);
      setAmmActivityViewMap(
        makeUIAmmActivityMap(
          {
            ammActivityMap,
            ammPoolActivityStatus: [
              AmmPoolActivityStatus.NotStarted,
              AmmPoolActivityStatus.InProgress,
            ],
          },
          userRewardsMapState.userRewardsMap
        )
      );
      setAmmActivityPastViewMap(
        makeUIAmmActivityMap(
          {
            ammActivityMap,
            ammPoolActivityStatus: [AmmPoolActivityStatus.EndOfGame],
          },
          userRewardsMapState.userRewardsMap
        )
      );
      //  })
    }
  }, [ammActivityMap, userRewardsMapState.userRewardsMap]);
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
            ammPoolActivityStatus: [
              AmmPoolActivityStatus.NotStarted,
              AmmPoolActivityStatus.InProgress,
            ],
          },
          userRewardsMapState.userRewardsMap
        )
      );
      setAmmActivityPastViewMap(
        makeUIAmmActivityMap(
          {
            ammActivityMap,
            ammPoolActivityStatus: [AmmPoolActivityStatus.EndOfGame],
          },
          userRewardsMapState.userRewardsMap
        )
      );
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
  }, [ammActivityMap, userRewardsMapState, userRewardsMapState.status]);

  return {
    ammActivityViewMap,
    ammRewardRecordList,
    ammActivityPastViewMap,
    getLiquidityMining,
    showRewardDetail,
    setShowRewardDetail,
    getMyAmmShare,
  };
};
