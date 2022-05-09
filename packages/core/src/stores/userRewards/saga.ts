import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  getUserRewards,
  getUserRewardsStatus,
  resetUserRewards,
} from "./reducer";

import { store, LoopringAPI } from "../../index";
import { myLog } from "@loopring-web/common-resources";

const getUserRewardsApi = async <R extends { [key: string]: any }>(
  _list: Array<keyof R>
) => {
  const { accountId } = store.getState().account;
  let { __timer__ } = store.getState().userRewardsMap;
  if (LoopringAPI.ammpoolAPI && accountId) {
    myLog("loop get getAmmPoolUserRewards");

    const { ammUserRewardMap } =
      await LoopringAPI.ammpoolAPI.getAmmPoolUserRewards({ owner: accountId });
    __timer__ = ((__timer__) => {
      if (__timer__ && __timer__ !== -1) {
        clearInterval(__timer__);
      }
      return setInterval(async () => {
        store.dispatch(getUserRewards(undefined));
      }, 300000 * 4);
    })(__timer__);

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
