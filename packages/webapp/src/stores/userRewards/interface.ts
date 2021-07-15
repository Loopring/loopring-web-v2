import { StateBase } from '../interface';
import { AmmUserRewardMap } from 'loopring-sdk';

export type UserRewards = AmmUserRewardMap;
export type UserRewardsStates = {
    userRewardsMap?: UserRewards|undefined
    __timer__: NodeJS.Timeout | -1
}  & StateBase


