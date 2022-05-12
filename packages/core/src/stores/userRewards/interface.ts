import { StateBase } from "@loopring-web/common-resources";
import { AmmUserRewardMap } from "@loopring-web/loopring-sdk";

export type UserRewards = AmmUserRewardMap;
export type UserRewardsStates = {
  userRewardsMap?: UserRewards | undefined;
  __timer__: NodeJS.Timeout | -1;
} & StateBase;
