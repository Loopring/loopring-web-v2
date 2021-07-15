import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import {  UserRewardsStates } from './interface';
import { STATUS } from '../constant';

const initialState:UserRewardsStates = {
    userRewardsMap:undefined,
    status:'UNSET',
    errorMessage:null,
    __timer__:-1,
}
const userRewardsMapSlice:Slice<UserRewardsStates> = createSlice({
    name: 'userRewardsMap',
    initialState,
    reducers: {
        getUserRewards(state, action:PayloadAction<undefined>) {
            state.status = STATUS.PENDING
        },
        getUserRewardsStatus(state, action: PayloadAction<UserRewardsStates>) {
            // @ts-ignore
            if (action.error) {
                state.status =  STATUS.ERROR
                // @ts-ignore
                state.errorMessage = action.error
            }
            state.userRewardsMap = {...state.userRewardsMap,...action.payload.userRewardsMap};
            if(action.payload.__timer__){
                state.__timer__  =  action.payload.__timer__
            }
            state.status = STATUS.DONE
        },
        statusUnset: state => {
            state.status = STATUS.UNSET
        }

    },
});
export { userRewardsMapSlice };
export const { getUserRewards, getUserRewardsStatus, statusUnset } = userRewardsMapSlice.actions;