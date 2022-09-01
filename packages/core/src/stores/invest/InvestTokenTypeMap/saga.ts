import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getInvestTokenTypeMap, getInvestTokenTypeMapStatus } from "./reducer";
import { AmmDetailStore, InvestTokenTypeMap, store } from "../../index";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  InvestDuration,
  InvestItem,
  InvestMapType,
} from "@loopring-web/common-resources";

function calcApr(
  ammInfo: AmmDetailStore<any>,
  investItem: InvestItem
): [start: number, end: number] {
  let [start, end] = investItem.apr;
  const apr = ammInfo.APR;
  if ((!start && apr) || (apr && apr < start)) {
    start = apr;
  }
  if (apr && apr > end) {
    end = apr;
  }
  return [start, end];
}
function calcDefiApr(
  defiinfo: sdk.DefiMarketInfo,
  investItem: InvestItem
): [start: number, end: number] {
  let [start, end] = investItem.apr;
  const apr = Number(defiinfo.apy);
  if (start === 0 && apr !== 0) {
    start = apr;
  } else if (apr !== 0 && apr < start) {
    start = apr;
  }
  if (end === 0 && apr !== 0) {
    end = apr;
  } else if (apr !== 0 && apr > end) {
    end = apr;
  }
  return [start, end];
}

const getInvestMapApi = async () => {
  const { ammMap } = store.getState().amm.ammMap;
  const { marketMap } = store.getState().invest.defiMap;
  const { marketMap: dualMarketMap } = store.getState().invest.dualMap;
  const { tokenMap } = store.getState().tokenMap;
  let investTokenTypeMap: InvestTokenTypeMap = Object.keys(ammMap).reduce(
    (prev, key) => {
      // @ts-ignore
      const [, coinA, coinB] = key.match(/AMM-(\w+)-(\w+)/i);
      const ammInfo = ammMap[key];
      if (prev[coinA] && prev[coinA]) {
        let investItem = prev[coinA][InvestMapType.AMM];
        if (investItem) {
          investItem.apr = calcApr(ammInfo, investItem);
        } else {
          prev[coinA][InvestMapType.AMM] = {
            // token: tokenMap[coinA],
            type: InvestMapType.AMM,
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          };
        }
      } else {
        prev[coinA] = {
          detail: {
            token: tokenMap[coinA],
            apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
            durationType: InvestDuration.All,
            duration: "",
          },
          [InvestMapType.AMM]: {
            type: InvestMapType.AMM,
            // token: tokenMap[coinA],
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          },
        };
      }

      if (prev[coinB] && prev[coinB]) {
        let investItem = prev[coinB][InvestMapType.AMM];
        if (investItem) {
          investItem.apr = calcApr(ammInfo, investItem);
        } else {
          prev[coinB][InvestMapType.AMM] = {
            type: InvestMapType.AMM,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          };
        }
      } else {
        prev[coinB] = {
          detail: {
            token: tokenMap[coinB],
            apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
            durationType: InvestDuration.All,
            duration: "",
          },
          [InvestMapType.AMM]: {
            type: InvestMapType.AMM,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          },
        };
      }

      if (prev[coinA]?.detail && ammInfo.APR) {
        prev[coinA].detail.apr = [
          prev[coinA]?.detail?.apr[0] === 0
            ? ammInfo.APR
            : Math.min(ammInfo.APR, prev[coinA]?.detail?.apr[0]),
          Math.max(ammInfo.APR, prev[coinA]?.detail?.apr[1]),
        ];
      }

      if (prev[coinB]?.detail && ammInfo.APR) {
        prev[coinB].detail.apr = [
          prev[coinB]?.detail?.apr[0] === 0
            ? ammInfo.APR
            : Math.min(ammInfo.APR, prev[coinB]?.detail?.apr[0]),
          Math.max(ammInfo.APR, prev[coinB]?.detail?.apr[1]),
        ];
      }

      return prev;
    },
    {} as InvestTokenTypeMap
  );
  if (dualMarketMap) {
    investTokenTypeMap = Object.keys(dualMarketMap).reduce((prev, key) => {
      // const [, _, coinB] = key.match(/(\w+)-(\w+)/i);
      // @ts-ignore
      const [_markets, type, coinA, coinB] = key.match(/^(\w+-)?(\w+)-(\w+)$/i);

      const dualInfo = dualMarketMap[key];
      if (prev[coinA] && prev[coinA]) {
        let investItem = prev[coinA][InvestMapType.DUAL];
        prev[coinA].detail.durationType = InvestDuration.All;
        if (investItem) {
          investItem.apr = calcDefiApr(dualInfo, investItem);
        } else {
          prev[coinA][InvestMapType.DUAL] = {
            // token: tokenMap[coinA],
            type: InvestMapType.DUAL,
            i18nKey: `labelInvestType_${InvestMapType.DUAL}`,
            apr: [dualInfo.apy ?? 0, dualInfo.apy ?? 0],
            durationType: InvestDuration.Duration,
            duration: "0 - 5",
          };
        }
      } else {
        prev[coinA] = {
          detail: {
            token: tokenMap[coinA],
            apr: [dualInfo.apy ?? 0, dualInfo.apy ?? 0],
            durationType: InvestDuration.All,
            duration: "",
          },
          [InvestMapType.DUAL]: {
            type: InvestMapType.DUAL,
            // token: tokenMap[coinA],
            i18nKey: `labelInvestType_${InvestMapType.DUAL}`,
            apr: [dualInfo.apy ?? 0, dualInfo.apy ?? 0],
            durationType: InvestDuration.Duration,
            duration: "0 - 5",
          },
        };
      }

      if (prev[coinB] && prev[coinB]) {
        let investItem = prev[coinB][InvestMapType.DUAL];
        // prev[coinB].detail.durationType = InvestDuration.All;
        if (investItem) {
          investItem.apr = calcDefiApr(dualInfo, investItem);
        } else {
          prev[coinB][InvestMapType.DUAL] = {
            type: InvestMapType.DUAL,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.DUAL}`,
            apr: [dualInfo.apy ?? 0, dualInfo.apy ?? 0],
            durationType: InvestDuration.Duration,
            duration: "0 - 5",
          };
        }
      } else {
        prev[coinB] = {
          detail: {
            token: tokenMap[coinB],
            apr: [dualInfo.apy ?? 0, dualInfo.apy ?? 0],
            durationType: InvestDuration.All,
            duration: "",
          },
          [InvestMapType.DUAL]: {
            type: InvestMapType.DUAL,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.DUAL}`,
            apr: [dualInfo.apy ?? 0, dualInfo.apy ?? 0],
            durationType: InvestDuration.Duration,
            duration: "0 - 5",
          },
        };
      }

      if (prev[coinA]?.detail && dualInfo.apy) {
        prev[coinA].detail.apr = [
          prev[coinA]?.detail?.apr[0] === 0
            ? dualInfo.apy
            : Math.min(dualInfo.apy, prev[coinA]?.detail?.apr[0]),
          Math.max(dualInfo.apy, prev[coinA]?.detail?.apr[1]),
        ];
      }

      if (prev[coinB]?.detail && dualInfo.apy) {
        prev[coinB].detail.apr = [
          prev[coinB]?.detail?.apr[0] === 0
            ? dualInfo.apy
            : Math.min(dualInfo.apy, prev[coinB]?.detail?.apr[0]),
          Math.max(dualInfo.apy, prev[coinB]?.detail?.apr[1]),
        ];
      }

      return prev;
      return prev;
    }, investTokenTypeMap);
  }

  if (marketMap) {
    investTokenTypeMap = Object.keys(marketMap).reduce((prev, key) => {
      // @ts-ignore
      const [, _, coinB] = key.match(/(\w+)-(\w+)/i);
      const defiInfo = marketMap[key];
      if (prev[coinB] && prev[coinB]) {
        let investItem = prev[coinB][InvestMapType.STAKE];
        if (investItem) {
          investItem.apr = calcDefiApr(defiInfo, investItem);
        } else {
          prev[coinB][InvestMapType.STAKE] = {
            type: InvestMapType.STAKE,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.STAKE}`,
            apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          };
        }
      } else {
        prev[coinB] = {
          detail: {
            token: tokenMap[coinB],
            apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
            durationType: InvestDuration.All,
            duration: "",
          },
          [InvestMapType.STAKE]: {
            type: InvestMapType.STAKE,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.STAKE}`,
            apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          },
        };
      }
      if (prev[coinB]?.detail && defiInfo.apy) {
        prev[coinB].detail.apr = [
          prev[coinB]?.detail?.apr[0] === 0
            ? defiInfo.apy
            : Math.min(defiInfo.apy, prev[coinB]?.detail?.apr[0]),
          Math.max(defiInfo.apy, prev[coinB]?.detail?.apr[1]),
        ];
      }
      return prev;
    }, investTokenTypeMap);
  }

  // investTokenTypeMap = Object(investTokenTypeMap).map((item,index)=>{
  //   item.detail.apr =
  //
  //   return
  // });

  return {
    investTokenTypeMap,
  };
};

export function* getPostsSaga() {
  try {
    const { investTokenTypeMap } = yield call(getInvestMapApi);
    yield put(getInvestTokenTypeMapStatus({ investTokenTypeMap }));
  } catch (err) {
    yield put(getInvestTokenTypeMapStatus(err));
  }
}

export function* investTokenTypeSaga() {
  yield all([takeLatest(getInvestTokenTypeMap, getPostsSaga)]);
}

export const investTokenTypeForks = [fork(investTokenTypeSaga)];
