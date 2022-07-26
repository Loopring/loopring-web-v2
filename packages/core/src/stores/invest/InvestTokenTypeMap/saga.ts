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
  if(start === 0 && apr!==0){
    start = apr;
  }else if(apr!==0 && apr < start){
    start = apr;
  }
  if(end === 0 && apr!==0){
    end = apr;
  }else if(apr!==0 && apr > end){
    end = apr;
  }
  return [start, end];
}

const getInvestMapApi = async () => {
  const { ammMap } = store.getState().amm.ammMap;
  const { marketMap } = store.getState().invest.defiMap;
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
            durationType: InvestDuration.Flexible,
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
            apr: [ammInfo.apr ?? 0, ammInfo.apr ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          };
        }
      } else {
        prev[coinB] = {
          detail: {
            token: tokenMap[coinB],
            apr: [ammInfo.apr ?? 0, ammInfo.apr ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          },
          [InvestMapType.AMM]: {
            type: InvestMapType.AMM,
            // token: tokenMap[coinB],
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.apr ?? 0, ammInfo.apr ?? 0],
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

  investTokenTypeMap = Object.keys(marketMap).reduce((prev, key) => {
    // @ts-ignore
    const [, _, coinB] = key.match(/(\w+)-(\w+)/i);
    const defiInfo = marketMap[key];
    if (prev[coinB] && prev[coinB]) {
      let investItem = prev[coinB][InvestMapType.DEFI];
      if (investItem) {
        investItem.apr = calcDefiApr(defiInfo, investItem);
      } else {
        prev[coinB][InvestMapType.DEFI] = {
          type: InvestMapType.DEFI,
          // token: tokenMap[coinB],
          i18nKey: `labelInvestType_${InvestMapType.DEFI}`,
          apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
          durationType: InvestDuration.Flexible,
          duration: "",
        };
      }
    } else {
      prev[coinB] = {
        detail: {
          token: tokenMap[coinB],
          apr: [defiInfo.apr ?? 0, defiInfo.apr ?? 0],
          durationType: InvestDuration.Flexible,
          duration: "",
        },
        [InvestMapType.DEFI]: {
          type: InvestMapType.DEFI,
          // token: tokenMap[coinB],
          i18nKey: `labelInvestType_${InvestMapType.DEFI}`,
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
