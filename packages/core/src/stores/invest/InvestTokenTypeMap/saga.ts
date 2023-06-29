import { all, call, fork, put, takeLatest } from 'redux-saga/effects'
import { getInvestTokenTypeMap, getInvestTokenTypeMapStatus } from './reducer'
import { AmmDetailStore, InvestTokenTypeMap, store } from '../../index'
import { InvestDuration, InvestItem, InvestMapType } from '@loopring-web/common-resources'

function calcApr(
  ammInfo: AmmDetailStore<any>,
  investItem: InvestItem,
): [start: number, end: number] {
  let [start, end] = investItem.apr
  const apr = ammInfo.APR
  if ((!start && apr) || (apr && apr < start)) {
    start = apr
  }
  if (apr && apr > end) {
    end = apr
  }
  return [start, end]
}
function calcDefiApr(
  defiinfo: { apy: string } | any,
  investItem: InvestItem,
): [start: number, end: number] {
  let [start, end] = investItem.apr
  const apr = Number(defiinfo.apy)
  if (start === 0 && apr !== 0) {
    start = apr
  } else if (apr !== 0 && apr < start) {
    start = apr
  }
  if (end === 0 && apr !== 0) {
    end = apr
  } else if (apr !== 0 && apr > end) {
    end = apr
  }
  return [start, end]
}

function calcDualApr(apr: [number, number], investItem: InvestItem): [start: number, end: number] {
  let [start, end] = investItem.apr
  let [_start, _end] = apr
  // const apr = Number(defiinfo.apy);
  if (start === 0 && _start !== 0) {
    start = _start
  } else if (_start !== 0 && _start < start) {
    start = _start
  }
  if (end === 0 && _end !== 0) {
    end = _end
  } else if (_end !== 0 && _end > end) {
    end = _end
  }
  return [start, end]
}

const getInvestMapApi = async () => {
  const { ammMap } = store.getState().amm.ammMap
  const { marketMap: defiMarketMap } = store.getState().invest.defiMap
  const { marketMap: dualMarketMap } = store.getState().invest.dualMap
  const { marketMap: stakingMarketMap } = store.getState().invest.stakingMap

  const { tokenMap } = store.getState().tokenMap
  let investTokenTypeMap: InvestTokenTypeMap = Object.keys(ammMap).reduce((prev, key) => {
    // @ts-ignore
    const [, coinA, coinB] = key.match(/AMM-(\w+)-(\w+)/i)
    const ammInfo = ammMap[key]
    if (prev[coinA] && prev[coinA]) {
      let investItem = prev[coinA][InvestMapType.AMM]
      if (investItem) {
        investItem.apr = calcApr(ammInfo, investItem)
      } else {
        prev[coinA][InvestMapType.AMM] = {
          // token: tokenMap[coinA],
          type: InvestMapType.AMM,
          i18nKey: `labelInvestType_${InvestMapType.AMM}`,
          apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
          durationType: InvestDuration.Flexible,
          duration: '',
        }
      }
    } else {
      prev[coinA] = {
        detail: {
          token: tokenMap[coinA],
          apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
          durationType: InvestDuration.All,
          duration: '',
        },
        [InvestMapType.AMM]: {
          type: InvestMapType.AMM,
          // token: tokenMap[coinA],
          i18nKey: `labelInvestType_${InvestMapType.AMM}`,
          apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
          durationType: InvestDuration.Flexible,
          duration: '',
        },
      }
    }

    if (prev[coinB] && prev[coinB]) {
      let investItem = prev[coinB][InvestMapType.AMM]
      if (investItem) {
        investItem.apr = calcApr(ammInfo, investItem)
      } else {
        prev[coinB][InvestMapType.AMM] = {
          type: InvestMapType.AMM,
          // token: tokenMap[coinB],
          i18nKey: `labelInvestType_${InvestMapType.AMM}`,
          apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
          durationType: InvestDuration.Flexible,
          duration: '',
        }
      }
    } else {
      prev[coinB] = {
        detail: {
          token: tokenMap[coinB],
          apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
          durationType: InvestDuration.All,
          duration: '',
        },
        [InvestMapType.AMM]: {
          type: InvestMapType.AMM,
          // token: tokenMap[coinB],
          i18nKey: `labelInvestType_${InvestMapType.AMM}`,
          apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
          durationType: InvestDuration.Flexible,
          duration: '',
        },
      }
    }

    if (prev[coinA]?.detail && ammInfo.APR) {
      prev[coinA].detail.apr = [
        prev[coinA]?.detail?.apr[0] === 0
          ? ammInfo.APR
          : Math.min(ammInfo.APR, prev[coinA]?.detail?.apr[0]),
        Math.max(ammInfo.APR, prev[coinA]?.detail?.apr[1]),
      ]
    }

    if (prev[coinB]?.detail && ammInfo.APR) {
      prev[coinB].detail.apr = [
        prev[coinB]?.detail?.apr[0] === 0
          ? ammInfo.APR
          : Math.min(ammInfo.APR, prev[coinB]?.detail?.apr[0]),
        Math.max(ammInfo.APR, prev[coinB]?.detail?.apr[1]),
      ]
    }

    return prev
  }, {} as InvestTokenTypeMap)
  if (defiMarketMap) {
    investTokenTypeMap = Object.keys(defiMarketMap).reduce((prev, key) => {
      const [, _coinA, coinB] = key.match(/(\w+)-(\w+)/i)
      const defiInfo = defiMarketMap[key]

      if (prev[coinB] && prev[coinB]) {
        let investItem = prev[coinB][InvestMapType.STAKE]
        if (investItem) {
          investItem.apr = calcDefiApr(defiInfo, investItem)
        } else {
          prev[coinB][InvestMapType.STAKE] = {
            type: InvestMapType.STAKE,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.STAKE}`,
            apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
            durationType: InvestDuration.Flexible,
            duration: '',
          }
        }
      } else {
        prev[coinB] = {
          detail: {
            token: tokenMap[coinB],
            apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
            durationType: InvestDuration.All,
            duration: '',
          },
          [InvestMapType.STAKE]: {
            type: InvestMapType.STAKE,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.STAKE}`,
            apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
            durationType: InvestDuration.Flexible,
            duration: '',
          },
        }
      }
      if (prev[coinB]?.detail && defiInfo.apy) {
        prev[coinB].detail.apr = [
          prev[coinB]?.detail?.apr[0] === 0
            ? defiInfo.apy
            : Math.min(defiInfo.apy, prev[coinB]?.detail?.apr[0]),
          Math.max(defiInfo.apy, prev[coinB]?.detail?.apr[1]),
        ]
      }
      return prev
    }, investTokenTypeMap)
  }

  if (dualMarketMap) {
    investTokenTypeMap = Object.keys(dualMarketMap).reduce((prev, key) => {
      // const [, _, coinB] = key.match(/(\w+)-(\w+)/i);
      // @ts-ignore
      const [_markets, type, coinA, coinB] = key.match(/^(\w+-)?(\w+)-(\w+)$/i)

      const dualInfo = dualMarketMap[key]
      if (prev[coinA] && prev[coinA]) {
        let investItem = prev[coinA][InvestMapType.DUAL]
        prev[coinA].detail.durationType = InvestDuration.All
        if (investItem) {
          investItem.apr = calcDualApr(
            [(dualInfo?.baseTokenApy?.min ?? 0) * 100, (dualInfo?.baseTokenApy?.max ?? 0) * 100],
            investItem,
          )
        } else {
          prev[coinA][InvestMapType.DUAL] = {
            // token: tokenMap[coinA],
            type: InvestMapType.DUAL,
            i18nKey: `labelInvestType_${InvestMapType.DUAL}`,
            //@ts-ignore
            apr: [
              (dualInfo?.baseTokenApy?.min ?? 0) * 100,
              (dualInfo?.baseTokenApy?.max ?? 0) * 100,
            ], // [dualInfo.apy ?? 0, dualInfo.apy ?? 0],
            durationType: InvestDuration.Duration,
            duration: `labelInvestRangeDay|1 - 10`,
          }
        }
      } else {
        prev[coinA] = {
          detail: {
            token: tokenMap[coinA],
            // apr: [dualInfo.apy ?? 0, dualInfo.apy ?? 0],
            //@ts-ignore
            apr: [
              (dualInfo?.baseTokenApy?.min ?? 0) * 100,
              (dualInfo?.baseTokenApy?.max ?? 0) * 100,
            ],
            durationType: InvestDuration.All,
            duration: '',
          },
          [InvestMapType.DUAL]: {
            type: InvestMapType.DUAL,
            // token: tokenMap[coinA],
            i18nKey: `labelInvestType_${InvestMapType.DUAL}`,
            apr: [
              (dualInfo?.baseTokenApy?.min ?? 0) * 100,
              (dualInfo?.baseTokenApy?.max ?? 0) * 100,
            ],
            durationType: InvestDuration.Duration,
            duration: `labelInvestRangeDay|1 - 10`,
          },
        }
      }
      if (prev[coinB] && prev[coinB]) {
        let investItem = prev[coinB][InvestMapType.DUAL]
        // prev[coinB].detail.durationType = InvestDuration.All;
        if (investItem) {
          investItem.apr = calcDualApr(
            [(dualInfo?.quoteTokenApy?.min ?? 0) * 100, (dualInfo?.quoteTokenApy?.max ?? 0) * 100],
            investItem,
          )
        } else {
          prev[coinB][InvestMapType.DUAL] = {
            type: InvestMapType.DUAL,
            i18nKey: `labelInvestType_${InvestMapType.DUAL}`,
            //@ts-ignore
            apr: [
              (dualInfo?.quoteTokenApy?.min ?? 0) * 100,
              (dualInfo?.quoteTokenApy?.max ?? 0) * 100,
            ],
            durationType: InvestDuration.Duration,
            duration: `labelInvestRangeDay|1 - 10`,
          }
        }
      } else {
        prev[coinB] = {
          detail: {
            token: tokenMap[coinB],
            apr: [
              (dualInfo?.quoteTokenApy?.min ?? 0) * 100,
              (dualInfo?.quoteTokenApy?.max ?? 0) * 100,
            ],
            durationType: InvestDuration.All,
            duration: '',
          },
          [InvestMapType.DUAL]: {
            type: InvestMapType.DUAL,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.DUAL}`,
            apr: [
              (dualInfo?.quoteTokenApy?.min ?? 0) * 100,
              (dualInfo?.quoteTokenApy?.max ?? 0) * 100,
            ],
            durationType: InvestDuration.Duration,
            duration: `labelInvestRangeDay|1 - 10`,
          },
        }
      }

      if (prev[coinA]?.detail && dualInfo.baseTokenApy) {
        prev[coinA].detail.apr = [
          prev[coinA]?.detail?.apr[0] === 0
            ? (dualInfo?.baseTokenApy?.min ?? 0) * 100
            : Math.min((dualInfo?.baseTokenApy?.min ?? 0) * 100, prev[coinA]?.detail?.apr[0]),
          Math.max((dualInfo?.baseTokenApy?.max ?? 0) * 100, prev[coinA]?.detail?.apr[1]),
        ]
      }

      if (prev[coinB]?.detail && dualInfo.quoteTokenApy) {
        prev[coinB].detail.apr = [
          prev[coinB]?.detail?.apr[0] === 0
            ? (dualInfo?.quoteTokenApy?.min ?? 0) * 100
            : Math.min((dualInfo?.quoteTokenApy?.min ?? 0) * 100, prev[coinB]?.detail?.apr[0]),
          Math.max((dualInfo?.quoteTokenApy?.max ?? 0) * 100, prev[coinB]?.detail?.apr[1]),
        ]
      }

      return prev
    }, investTokenTypeMap)
  }

  if (stakingMarketMap) {
    investTokenTypeMap = Object.keys(stakingMarketMap).reduce((prev, key) => {
      const coin = key
      if (prev[coin] && prev[coin]) {
        let investItem = prev[coin][InvestMapType.STAKELRC]
        if (investItem) {
          investItem.apr = calcDefiApr({ apy: stakingMarketMap[key].apr }, investItem)
        } else {
          prev[coin][InvestMapType.STAKELRC] = {
            type: InvestMapType.STAKELRC,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.STAKELRC}`,
            apr: [stakingMarketMap[key]?.apr ?? 0, stakingMarketMap[key]?.apr ?? 0],
            durationType: InvestDuration.Flexible,
            duration: '',
          }
        }
      } else {
        prev[coin] = {
          detail: {
            token: tokenMap[coin],
            apr: [stakingMarketMap[key]?.apr ?? 0, stakingMarketMap[key]?.apr ?? 0],
            durationType: InvestDuration.All,
            duration: '',
          },
          [InvestMapType.STAKE]: {
            type: InvestMapType.STAKE,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.STAKE}`,
            apr: [stakingMarketMap[key]?.apr ?? 0, stakingMarketMap[key]?.apr ?? 0],
            durationType: InvestDuration.Flexible,
            duration: '',
          },
        }
      }
      if (prev[coin]?.detail && stakingMarketMap[key].apr) {
        prev[coin].detail.apr = [
          prev[coin]?.detail?.apr[0] === 0
            ? stakingMarketMap[key].apy
            : Math.min(stakingMarketMap[key].apr, prev[coin]?.detail?.apr[0]),
          Math.max(stakingMarketMap[key].apr, prev[coin]?.detail?.apr[1]),
        ]
      }
      return prev
    }, investTokenTypeMap)
  }

  return {
    investTokenTypeMap,
  }
}

export function* getPostsSaga() {
  try {
    const { investTokenTypeMap } = yield call(getInvestMapApi)
    yield put(getInvestTokenTypeMapStatus({ investTokenTypeMap }))
  } catch (err) {
    yield put(getInvestTokenTypeMapStatus({ error: err }))
  }
}

export function* investTokenTypeSaga() {
  yield all([takeLatest(getInvestTokenTypeMap, getPostsSaga)])
}

export const investTokenTypeForks = [fork(investTokenTypeSaga)]
