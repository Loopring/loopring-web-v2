import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  getUserRewards,
  getUserRewardsStatus,
  resetUserRewards,
} from "./reducer";

import { store, LoopringAPI } from "../../index";
import { CustomError, ErrorMap } from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

const getUserRewardsApi = async <R extends { [key: string]: any }>(
  _list: Array<keyof R>
) => {
  const { accountId } = store.getState().account;
  let { __timer__ } = store.getState().userRewardsMap;
  if (LoopringAPI.ammpoolAPI && accountId) {
    let ammUserRewardMap = {};
    try {
      const response = await LoopringAPI.ammpoolAPI.getAmmPoolUserRewards({
        owner: accountId,
      });
      if (
        response &&
        ((response as sdk.RESULT_INFO).code ||
          (response as sdk.RESULT_INFO).message)
      ) {
        throw new CustomError(ErrorMap.ERROR_UNKNOWN);
      }
      ammUserRewardMap = response.ammUserRewardMap;
      __timer__ = ((__timer__) => {
        if (__timer__ && __timer__ !== -1) {
          clearInterval(__timer__);
        }
        return setInterval(async () => {
          store.dispatch(getUserRewards(undefined));
        }, 300000 * 4);
      })(__timer__);
    } catch (e) {
      ammUserRewardMap = {};
    }

    return { data: ammUserRewardMap, __timer__ };
  } else {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    return Promise.resolve({ data: undefined, __timer__: -1 });
  }
};

export function* getPostsSaga() {
  try {
    // @ts-ignore
    const { data, __timer__ } = yield call(getUserRewardsApi);
    yield put(getUserRewardsStatus({ userRewardsMap: data, __timer__ }));
  } catch (err) {
    yield put(getUserRewardsStatus(err));
  }
}

export function* getResetsSaga() {
  try {
    // @ts-ignore
    let { __timer__ } = store.getState().userRewardsMap;
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    yield put(getUserRewardsStatus({ userRewardsMap: [], __timer__: -1 }));
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
  // fork(uerRewardssSaga),
];
