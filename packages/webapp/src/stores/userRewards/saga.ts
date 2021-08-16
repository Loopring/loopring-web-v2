import { all, call, fork, put, takeLatest } from "redux-saga/effects"
import { getUserRewards, getUserRewardsStatus } from './reducer'

import store from '../index';
import { LoopringAPI } from 'api_wrapper';

const getUserRewardsApi = async <R extends {[key:string]:any}>(list:Array<keyof R>)=> {

    // const data:UserRewardsMap<R> = {}

    // const userRewardss = await exchangeAPI().getUserRewards({market: list.join(',')})
    const {accountId} = store.getState().account
    let {__timer__} = store.getState().userRewardsMap;
    
    if(LoopringAPI.ammpoolAPI && accountId ) {
        __timer__ = ((__timer__) => {
            if (__timer__ && __timer__ !== -1) {
                clearInterval(__timer__);
            }
            return setTimeout(async () => {
                store.dispatch(getUserRewards(undefined))
            }, 300000 * 4)   //

        })(__timer__);
        return  LoopringAPI.ammpoolAPI.getAmmPoolUserRewards({owner:accountId}).then(({ammUserRewardMap}) => {
            return {data:ammUserRewardMap,__timer__}
        })
    }else{
        if (__timer__ && __timer__ !== -1) {
            clearInterval(__timer__);
        }
        if(accountId) {
            return  Promise.reject({data:undefined,__timer__:-1})
        }else{
            return Promise.resolve({data:undefined,__timer__:-1})
        }

    }

}

export function* getPostsSaga({payload}:any) {
    try {
        // @ts-ignore
        // const { userRewardsKey,userRewardsKeys } = payload;
        // console.log('getPostsSaga userRewardsKey',userRewardsKey, userRewardsKeys)
        // if(userRewardsKey || (userRewardsKeys && userRewardsKeys.length)) {
        const {data,__timer__}  = yield call(getUserRewardsApi);
        yield put(getUserRewardsStatus({userRewardsMap:data,__timer__}));

        // }else{
        //     throw new CustomError(ErrorMap.NO_SDK);
        // }
    } catch (err) {
        yield put(getUserRewardsStatus(err));
    }
}

function* userRewardsSaga() {
    yield all([takeLatest(getUserRewards, getPostsSaga)]);
}

export const userRewardsForks = [
    fork(userRewardsSaga),
    // fork(userRewardssSaga),
]
 