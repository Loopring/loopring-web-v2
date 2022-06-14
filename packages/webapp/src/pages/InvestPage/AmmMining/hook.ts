import { AmmCardProps } from "@loopring-web/common-resources";
import {
  AmmPoolActivityRule,
  AmmPoolActivityStatus,
  LoopringMap,
} from "@loopring-web/loopring-sdk";
import React from "react";
import { makeUIAmmActivityMap, useUserRewards } from "@loopring-web/core";

export const useAmmMiningUI = <
  R extends { [key: string]: any },
  I extends { [key: string]: any }
>({
  ammActivityMap,
}: {
  ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined;
}): {
  ammActivityViewMap: Array<AmmCardProps<I>>;
  ammActivityPastViewMap: Array<AmmCardProps<I>>;
} => {
  const userRewardsMapState = useUserRewards(); // store.getState().userRewardsMap
  // const {coinMap} = useTokenMap();
  // const ammMapState = useAmmMap();
  // const walletLayer2State = useWalletLayer2();
  const [ammActivityViewMap, setAmmActivityViewMap] = React.useState<
    Array<AmmCardProps<I>>
  >([]);

  const [ammActivityPastViewMap, setAmmActivityPastViewMap] = React.useState<
    Array<AmmCardProps<I>>
  >([]);
  // const [ammUserRewardMap, setAmmUserRewardMap] = React.useState<AmmUserRewardMap>(
  //     {});

  // );
  React.useEffect(() => {
    if (ammActivityMap && Object.keys(ammActivityMap).length > 0) {
      // getAmmPoolUserRewards().then((ammUserRewardMap)=>{
      // setAmmUserRewardMap(ammUserRewardMap as AmmUserRewardMap);
      setAmmActivityViewMap(
        makeUIAmmActivityMap(
          {
            ammActivityMap,
            type: "AMM_MINING",
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
            type: "AMM_MINING",
            ammPoolActivityStatus: [AmmPoolActivityStatus.EndOfGame],
          },
          userRewardsMapState.userRewardsMap
        )
      );
      //  })
    }
  }, [ammActivityMap]);
  React.useEffect(() => {
    if (userRewardsMapState.status === "ERROR") {
      userRewardsMapState.statusUnset();
    } else if (userRewardsMapState.status === "DONE") {
      userRewardsMapState.statusUnset();
      setAmmActivityViewMap(
        makeUIAmmActivityMap(
          {
            ammActivityMap,
            type: "AMM_MINING",
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
            type: "AMM_MINING",
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
  }, [userRewardsMapState.status]);

  return {
    ammActivityViewMap,
    ammActivityPastViewMap,
  };
};
