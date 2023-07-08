import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getUserRewards, getUserRewardsStatus, resetUserRewards } from './reducer'

import { store, LoopringAPI, makeSummaryMyAmm } from '../../index'
import { AccountStatus } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const getUserRewardsApi = async () => {
  const { accountId, apiKey, readyState } = store.getState().account
  let { __timer__ } = store.getState().userRewardsMap
  if (LoopringAPI.ammpoolAPI && LoopringAPI.userAPI && accountId) {
    let ammUserRewardMap = {},
      totalClaims = [],
      result: any = {}
    try {
      ;[ammUserRewardMap, totalClaims] = await Promise.all([
        LoopringAPI.ammpoolAPI
          .getAmmPoolUserRewards({
            owner: accountId,
          })
          .then((response) => {
            if (
              response &&
              ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
            ) {
              // throw new CustomError(ErrorMap.ERROR_UNKNOWN)
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
              // throw response as sdk.RESULT_INFO
              return []
            }
            return response.items
          }),
      ])
      if (readyState === AccountStatus.ACTIVATED) {
        result = makeSummaryMyAmm({
          userRewardsMap: ammUserRewardMap,
        })
      }
      __timer__ = ((__timer__) => {
        if (__timer__ && __timer__ !== -1) {
          clearInterval(__timer__)
        }
        return setInterval(async () => {
          store.dispatch(getUserRewards(undefined))
        }, 300000 * 4)
      })(__timer__)
    } catch (error) {
      throw error
      // let errorItem
      // if (typeof (error as sdk.RESULT_INFO)?.code === 'number') {
      //   errorItem = SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001]
      // } else {
      //   errorItem = SDK_ERROR_MAP_TO_UI[700012]
      // }
      // setToastOpen({
      //   open: true,
      //   type: ToastType.error,
      //   content: 'error : ' + errorItem ? t(errorItem.messageKey) : (error as any)?.message,
      // })
    }
    // catch (e) {
    //   ammUserRewardMap = {}
    // }

    return {
      data: { userRewardsMap: ammUserRewardMap, totalClaims, ...result },
      __timer__,
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
