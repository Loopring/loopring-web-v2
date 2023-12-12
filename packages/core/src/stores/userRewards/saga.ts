import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import {
  getUserRewards,
  getUserRewardsStatus,
  resetUserRewards,
  setDefiAverageMap,
} from './reducer'

import { LoopringAPI, makeClaimRewards, makeSummaryMyAmm, store } from '../../index'
import {
  AccountStatus,
  DEFI_CONFIG,
  LEVERAGE_ETH_CONFIG,
  MapChainId,
} from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const defiNum = 10
const getUserRewardsApi = async () => {
  const { accountId, apiKey, readyState } = store.getState().account

  if (LoopringAPI.ammpoolAPI && LoopringAPI.userAPI && accountId) {
    let ammUserRewardMap = {},
      _totalClaims = [],
      result: any = {}
    try {
      ;[ammUserRewardMap, _totalClaims] = await Promise.all([
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
            return response?.raw_data?.items ?? []
          })
          .catch((error) => {
            throw error
          }),
      ])
      if (readyState === AccountStatus.ACTIVATED) {
        result = makeSummaryMyAmm({
          userRewardsMap: ammUserRewardMap,
        })
        const { marketArray, marketLeverageArray } = store.getState().invest.defiMap
        const { defaultNetwork } = store.getState().settings
        const network = MapChainId[defaultNetwork] ?? MapChainId[1]

        LoopringAPI.defiAPI
          .getDefiDepositList(
            // .getDefiTransaction(
            {
              accountId,
              number: defiNum,
              markets: [...marketArray, ...marketLeverageArray],
              types: [...DEFI_CONFIG.products[network], ...LEVERAGE_ETH_CONFIG.products[network]],
            } as any,
            apiKey,
          )
          .then((response) => {
            if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
              return {}
            }
            const defiAverageMap = [...marketArray, ...marketLeverageArray].reduce((prev, item) => {
              let priceTotal = sdk.toBig(0)
              const _value = (response as any).transactions
                ?.filter(
                  (_history) =>
                    item === _history.market &&
                    _history.action == sdk?.DefiAction?.Deposit.toUpperCase(),
                )
                .slice(0, defiNum)
                .map((_history) => {
                  const price = sdk.toBig(_history.buyToken.volume).div(_history.sellToken.volume)
                  priceTotal = priceTotal.plus(price)
                  return {
                    sellToken: _history.sellToken,
                    buyToken: _history.buyToken,
                    price: price.toString(),
                  }
                })
              prev[item] = {
                list: _value,
                average: priceTotal.div(_value?.length ? _value?.length : 1).toString(),
                priceTotal: priceTotal.toString(),
              }
              return prev
            }, {})
            store.dispatch(setDefiAverageMap({ defiAverageMap }))
          })
          .catch((error) => {
            throw error
          })
      }
      const totalClaims = makeClaimRewards(_totalClaims ?? [])
      let __timer__ = (() => {
        return setTimeout(() => {
          let { __timer__ } = store.getState().userRewardsMap
          if (__timer__ && __timer__ !== -1) {
            clearTimeout(__timer__)
          }
          store.dispatch(getUserRewards(undefined))
        }, 60000 * 4)
      })()
      return {
        data: { userRewardsMap: ammUserRewardMap, totalClaims, ...result },
        __timer__,
      }
    } catch (error) {
      throw error
    }
  } else {
    let { __timer__ } = store.getState().userRewardsMap
    if (__timer__ && __timer__ !== -1) {
      clearTimeout(__timer__)
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
      clearTimeout(__timer__)
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
