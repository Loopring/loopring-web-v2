import { useDispatch, useSelector } from 'react-redux'
import { getUserRewards, statusUnset } from './reducer';
import { UserRewardsStates } from './interface';
import React from 'react';

export function useUserRewards(): UserRewardsStates & {
    getUserRewards:()=>void,
    statusUnset:()=>void,
} {
    const userRewardsMap:UserRewardsStates = useSelector((state: any) => state.userRewardsMap)
    const dispatch = useDispatch();
    return {
        ...userRewardsMap,
        statusUnset:React.useCallback(()=>dispatch(statusUnset(undefined)),[dispatch]),
        getUserRewards: React.useCallback(()=>dispatch(getUserRewards(undefined)),[dispatch]),
    }

}
