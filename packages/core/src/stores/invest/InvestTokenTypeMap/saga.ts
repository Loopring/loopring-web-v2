import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getInvestTokenTypeMap, getInvestTokenTypeMapStatus } from "./reducer";
import { AmmDetailStore, store } from "../../index";
import {
  InvestItem,
  InvestTokenTypeMap,
  InvestMapType,
  InvestDuration,
} from "./interface";
import * as sdk from "@loopring-web/loopring-sdk";

function calcApr(
  ammInfo: AmmDetailStore<any>,
  investItem: InvestItem
): [start: number, end: number] {
  let [start, end] = investItem.apr;
  const apr = ammInfo.APR;
  if (apr !== undefined && apr > 0 && apr < start) {
    start = apr;
  } else if (apr && apr > end) {
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
  if (apr && apr < start) {
    start = apr;
  } else if (apr && apr > end) {
    end = apr;
  }
  return [start, end];
}

const getInvestMapApi = async () => {
  const { ammMap } = store.getState().amm.ammMap;
  const { marketMap } = store.getState().invest.defiMap;
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
            type: InvestMapType.AMM,
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.APR ?? 0, ammInfo.APR ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          };
        }
      } else {
        prev[coinA] = {
          [InvestMapType.AMM]: {
            type: InvestMapType.AMM,
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.apr ?? 0, ammInfo.apr ?? 0],
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
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.apr ?? 0, ammInfo.apr ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          };
        }
      } else {
        prev[coinB] = {
          [InvestMapType.AMM]: {
            type: InvestMapType.AMM,
            i18nKey: `labelInvestType_${InvestMapType.AMM}`,
            apr: [ammInfo.apr ?? 0, ammInfo.apr ?? 0],
            durationType: InvestDuration.Flexible,
            duration: "",
          },
        };
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
          i18nKey: `labelInvestType_${InvestMapType.DEFI}`,
          apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
          durationType: InvestDuration.Flexible,
          duration: "",
        };
      }
    } else {
      prev[coinB] = {
        [InvestMapType.DEFI]: {
          type: InvestMapType.DEFI,
          i18nKey: `labelInvestType_${InvestMapType.DEFI}`,
          apr: [defiInfo.apy ?? 0, defiInfo.apy ?? 0],
          durationType: InvestDuration.Flexible,
          duration: "",
        },
      };
    }
    return prev;
  }, investTokenTypeMap);
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
