import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getUserRewards, getUserRewardsStatus, resetUserRewards } from './reducer'

import { LoopringAPI, makeClaimRewards, makeSummaryMyAmm, store } from '../../index'
import { AccountStatus } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const getUserRewardsApi = async () => {
  const { accountId, apiKey, readyState } = store.getState().account
  let { __timer__ } = store.getState().userRewardsMap
  if (LoopringAPI.ammpoolAPI && LoopringAPI.userAPI && accountId) {
    let ammUserRewardMap = {},
      _totalClaims = [],
      result: any = {}
    try {
      ;;[ammUserRewardMap, _totalClaims] = await Promise.all([
        LoopringAPI.ammpoolAPI
          .getAmmPoolUserRewards({
            owner: accountId,
          })
          .then((response) => {
            if (
              response &&
              ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
            ) {
              return {}
            }
            return response.ammUserRewardMap
          }),
        LoopringAPI.userAPI
          .getUserTotalClaim(
            {
              accountId: accountId,
            },
            apiKey,
          )
          .then((response) => {
            if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
              return []
            }
            // @ts-ignore
            return response?.raw_data?.data[0]?.items
          })
          .catch((error) => {
            throw error
          }),
      ])
      if (readyState === AccountStatus.ACTIVATED) {
        result = makeSummaryMyAmm({
          userRewardsMap: ammUserRewardMap,
        })
      }
      const totalClaims = makeClaimRewards(_totalClaims ?? [])
      __timer__ = ((__timer__) => {
        if (__timer__ && __timer__ !== -1) {
          clearInterval(__timer__)
        }
        return setInterval(async () => {
          store.dispatch(getUserRewards(undefined))
        }, 60000 * 4)
      })(__timer__)
      return {
        data: { userRewardsMap: ammUserRewardMap, totalClaims, ...result },
        __timer__,
      }
    } catch (error) {
      throw error
    }
  } else {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__)
    }
    return Promise.resolve({ data: {}, __timer__: -1 })
  }
}

export function* getPostsSaga() {
  try {
    const { data, __timer__ } = yield call(getUserRewardsApi)
    yield put(getUserRewardsStatus({ ...data, __timer__ }))
  } catch (err) {
    yield put(getUserRewardsStatus({ error: err }))
  }
}

export function* getResetsSaga() {
  try {
    // @ts-ignore
    let { __timer__ } = store.getState().userRewardsMap
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__)
    }
    yield put(getUserRewardsStatus({ userRewardsMap: [], __timer__: -1 }))
  } catch (err) {
    yield put(getUserRewardsStatus({ error: err }))
  }
}

function* userRewardsSaga() {
  yield all([takeLatest(getUserRewards, getPostsSaga)])
}

function* resetUserRewardsSaga() {
  yield all([takeLatest(resetUserRewards, getResetsSaga)])
}

export const userRewardsForks = [
  fork(userRewardsSaga),
  fork(resetUserRewardsSaga),
  // fork(uerRewardssSaga),
]
