import { all, call, fork, put, takeLatest } from "redux-saga/effects"
import { getUserRewards, getUserRewardsStatus, resetUserRewards } from './reducer'

import store from '../index';
import { LoopringAPI } from 'api_wrapper';
import { AmmPoolStat } from '@loopring-web/loopring-sdk';
import { updateRealTimeAmmMap } from '../Amm/AmmMap';

const getUserRewardsApi = async <R extends { [ key: string ]: any }>(list: Array<keyof R>) => {

    // const data:UserRewardsMap<R> = {}

    // const userRewardss = await exchangeAPI().getUserRewards({market: list.join(',')})
    const {accountId} = store.getState().account
    let {__timer__} = store.getState().userRewardsMap;

    if (LoopringAPI.ammpoolAPI && accountId) {
        // __timer__ = ((__timer__) => {
        if (__timer__ && __timer__ !== -1) {
            clearInterval(__timer__);
        }
        // setInterval(async () => {
        //     store.dispatch(getUserRewards(undefined))
        // }, 300000 * 4)   //
        __timer__ = ((__timer__) => {
            if (__timer__ && __timer__ !== -1) {
                clearInterval(__timer__)
            }
            return setInterval(async () => {
                store.dispatch(getUserRewards(undefined))
            }, 300000 * 4)    //15*60*1000 //900000
        })(__timer__)

        // })(__timer__);
        return LoopringAPI.ammpoolAPI.getAmmPoolUserRewards({owner: accountId}).then(({ammUserRewardMap}) => {
            return {data: ammUserRewardMap, __timer__}
        })
    } else {
        if (__timer__ && __timer__ !== -1) {
            clearInterval(__timer__);
        }
        return Promise.resolve({data: undefined, __timer__: -1})
        // if(accountId) {
        //     return  Promise.reject({data:undefined,__timer__:-1})
        // }else{
        //
        // }

    }

}

export function* getPostsSaga({payload}: any) {
    try {
        // @ts-ignore
        // const { userRewardsKey,userRewardsKeys } = payload;
        // console.log('getPostsSaga userRewardsKey',userRewardsKey, userRewardsKeys)
        // if(userRewardsKey || (userRewardsKeys && userRewardsKeys.length)) {
        const {data, __timer__} = yield call(getUserRewardsApi);
        yield put(getUserRewardsStatus({userRewardsMap: data, __timer__}));

        // }else{
        //     throw new CustomError(ErrorMap.NO_SDK);
        // }
    } catch (err) {
        yield put(getUserRewardsStatus(err));
    }
}

export function* getResetsSaga({payload}: any) {
    try {
        // @ts-ignore
        let {__timer__} = store.getState().userRewardsMap;
        if (__timer__ && __timer__ !== -1) {
            clearInterval(__timer__);
        }
        yield put(getUserRewardsStatus({userRewardsMap: [], __timer__: -1}));
    } catch (err) {
        yield put(getUserRewardsStatus(err));
    }
}

function* userRewardsSaga() {
    yield all([takeLatest(getUserRewards, getPostsSaga)]);
}

function* resetUserRewardsSaga() {
    yield all([takeLatest(resetUserRewards, getResetsSaga)]);
}

export const userRewardsForks = [
    fork(userRewardsSaga),
    fork(resetUserRewardsSaga),
    // fork(userRewardssSaga),
]
 