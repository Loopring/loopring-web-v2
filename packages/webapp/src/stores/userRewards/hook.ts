import { useDispatch, useSelector } from 'react-redux'
import { userRewardsMapSlice } from './reducer';
import { UserRewardsStates } from './interface';

export function useUserRewards(): UserRewardsStates & {
    updateUserRewards:()=>void,
    statusUnset:()=>void,
} {
    const userRewardsMap:UserRewardsStates = useSelector((state: any) => state.userRewardsMap)
    const dispatch = useDispatch();

    const updateUserRewards = () => {
        dispatch(userRewardsMapSlice.actions.getUserRewards(undefined))
    }
    const statusUnset = ()=>{
        dispatch(userRewardsMapSlice.actions.statusUnset(undefined))
    }
    return {
        ...userRewardsMap,
        statusUnset,
        updateUserRewards,
    }

}
