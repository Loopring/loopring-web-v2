import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getAmmMap, getAmmMapStatus, updateRealTimeAmmMap } from "./reducer";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  AmmPoolInfoV3,
  AmmPoolStat,
  ChainId,
  toBig,
} from "@loopring-web/loopring-sdk";

import {
  AmmDetail,
  getValuePrecisionThousand,
  myLog,
} from "@loopring-web/common-resources";
import { store } from "../../index";
import { LoopringAPI } from "../../../api_wrapper";
import { PayloadAction } from "@reduxjs/toolkit";
import { AmmDetailStore, GetAmmMapParams } from "./interface";
import { volumeToCount, volumeToCountAsBigNumber } from "../../../hooks";
import _ from "lodash";

const ammMapStoreLocal = (ammpoolsRaw: any, chainId?: any) => {
  // const system = store.getState().system;
  myLog("system", chainId);
  const ammpoolsChain = JSON.parse(
    window.localStorage.getItem("ammpools") ?? "{}"
  );
  localStorage.setItem(
    "ammpools",
    JSON.stringify({
      ...ammpoolsChain,
      [chainId ?? 1]: ammpoolsRaw,
    })
  );
};

type AmmMap<R extends { [key: string]: any }> =
  | { [key: string]: AmmDetail<R> }
  | {}; //key is AMM-XXX-XXX
export const setAmmState = ({
  ammPoolState,
  market,
}: {
  ammPoolState: AmmPoolStat & { apysBips?: string[] };
  market: string;
}) => {
  const { idIndex, tokenMap } = store.getState().tokenMap;
  const { chainId } = store.getState().system;
  const { tokenPrices } = store.getState().tokenPrices;
  const { tickerMap } = store.getState().tickerMap;
  // @ts-ignore
  const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
  if (idIndex && coinA && coinB && tokenPrices) {
    if (chainId === 5 && market == "CLRC-USDT") {
      ammPoolState.liquidity = ["0", "0"];
      ammPoolState.lpLiquidity = "0";
    }
    const totalA = volumeToCountAsBigNumber(coinA, ammPoolState.liquidity[0]); //parseInt(ammPoolState.liquidity[ 0 ]),
    const totalB = volumeToCountAsBigNumber(coinB, ammPoolState.liquidity[1]); //parseInt(ammPoolState.liquidity[ 1 ]),
    const totalAU = totalA?.times(tokenPrices[coinA]) ?? sdk.toBig(0);
    const totalBU = totalB?.times(tokenPrices[coinB]) ?? sdk.toBig(0);
    const rewardA = ammPoolState.rewards[0]
      ? volumeToCountAsBigNumber(
          idIndex[ammPoolState.rewards[0].tokenId as number],
          ammPoolState.rewards[0].volume
        )
      : undefined;
    const rewardB = ammPoolState.rewards[1]
      ? volumeToCountAsBigNumber(
          idIndex[ammPoolState.rewards[1].tokenId as number],
          ammPoolState.rewards[1].volume
        )
      : undefined;
    let result = {
      totalA: totalA?.toString() ?? 0,
      totalB: totalB?.toString() ?? 0,
      totalAU: totalAU.toString(),
      totalBU: totalBU.toString(),
      amountU: totalAU.plus(totalBU).toString(),
      totalLPToken: volumeToCount("LP-" + market, ammPoolState.lpLiquidity),
      rewardA: rewardA?.toString(),
      rewardToken: ammPoolState.rewards[0]
        ? idIndex[ammPoolState.rewards[0].tokenId as number]
        : undefined,
      rewardAU: rewardA?.times(tokenPrices[coinA]).toString(),
      rewardBU: rewardB?.times(tokenPrices[coinB]).toString(),
      rewardB: rewardB?.toString(),
      rewardToken2: ammPoolState.rewards[1]
        ? idIndex[ammPoolState.rewards[1].tokenId as number]
        : undefined,
      tokens: {
        pooled: ammPoolState.liquidity,
        lp: ammPoolState.lpLiquidity,
      },
    };
    const feeA = volumeToCountAsBigNumber(coinA, ammPoolState.fees[0]);
    const feeB = volumeToCountAsBigNumber(coinB, ammPoolState.fees[1]);
    const feeU =
      tokenPrices[coinA] && tokenPrices[coinB]
        ? toBig(feeA ?? 0)
            .times(tokenPrices[coinA])
            .plus(toBig(feeB ?? 0).times(tokenPrices[coinB]))
        : undefined;
    const APRs = {
      self:
        (parseInt(ammPoolState?.apysBips ? ammPoolState.apysBips[0] : "0") *
          1.0) /
        100,
      event:
        (parseInt(ammPoolState?.apysBips ? ammPoolState?.apysBips[1] : "0") *
          1.0) /
        100,
      fee:
        (parseInt(ammPoolState?.apysBips ? ammPoolState?.apysBips[2] : "0") *
          1.0) /
        100,
    };

    return {
      ...result,
      feeA: feeA?.toNumber(),
      feeB: feeB?.toNumber(),
      feeU: feeU ? feeU.toNumber() : undefined,
      totalAStr: getValuePrecisionThousand(
        result.totalA,
        tokenMap[coinA].precision,
        tokenMap[coinA].precision,
        tokenMap[coinA].precision,
        false,
        { isFait: true }
      ),
      totalBStr: getValuePrecisionThousand(
        result.totalB,
        tokenMap[coinA].precision,
        tokenMap[coinA].precision,
        tokenMap[coinA].precision,
        false,
        { isFait: true }
      ),
      tradeFloat: {
        change: undefined,
        timeUnit: "24h",
        ...(tickerMap[market] ? tickerMap[market] : {}),
      },
      // @ts-ignore
      APR: ammPoolState?.apysBips
        ? APRs.self + APRs.event + APRs.fee
        : (parseInt(ammPoolState.apyBips) * 1.0) / 100,
      APRs,
      __ammPoolState__: ammPoolState,
    };
  }
};
const getAmmMapApi = async <R extends { [key: string]: any }>({
  ammpools,
}: GetAmmMapParams) => {
  if (!LoopringAPI.ammpoolAPI) {
    return undefined;
  }
  let ammMap: AmmMap<R> = {}; //
  let ammArrayEnable: AmmDetailStore<R>[] = [];
  const { chainId } = store.getState().system;
  const { ammMap: _ammMap } = store.getState().amm.ammMap;
  myLog("loop get ammPoolStats");

  const { idIndex, coinMap } = store.getState().tokenMap;
  let ammPoolStats: any = {};
  try {
    ammPoolStats = (await LoopringAPI.ammpoolAPI?.getAmmPoolStats())
      .ammPoolStats;
  } catch (e) {
    // throw e;
  }
  Reflect.ownKeys(ammpools).forEach(async (key) => {
    let item: AmmPoolInfoV3 = ammpools[key as string];
    if (chainId === 5 && key == "AMM-CLRC-USDT") {
      item = {
        ...ammpools[key as string],
        tokens: {
          pooled: ["0", "0"],
          lp: "0" as any,
        },
      };
    }
    if (item.market === key && item.tokens.pooled && idIndex) {
      const coinA = idIndex[item.tokens.pooled[0] as any];
      const coinB = idIndex[item.tokens.pooled[1] as any];
      let status: any = ammpools[key.toString()].status ?? 0;
      status = ("00000" + status.toString(2)).split("");
      let exitDisable = status[status.length - 1] === "0";
      let joinDisable = status[status.length - 2] === "0";
      let swapDisable = status[status.length - 3] === "0";
      let showDisable = status[status.length - 4] === "0";
      let isRiskyMarket = status[status.length - 5] === "1";
      const dataItem: AmmDetailStore<R> = {
        ...item,
        coinA: coinA,
        coinB: coinB,
        coinAInfo: coinMap[coinA],
        coinBInfo: coinMap[coinB],
        isNew:
          Date.now() - Number(item.createdAt) > 3 * 86400 * 1000 ? false : true, //3*24*60*60*1000,
        isActivity: item.status === 7 ? true : false,
        ...(ammPoolStats[key]
          ? setAmmState({
              ammPoolState: ammPoolStats[key],
              market: item.market.replace("AMM-", ""),
            })
          : { ..._ammMap[key] }),
        exitDisable,
        joinDisable,
        swapDisable,
        showDisable,
        isRiskyMarket,
        __rawConfig__: item,
        market: key.replace("AMM-", ""),
      } as AmmDetailStore<R>;
      // @ts-ignore
      ammMap[key] = dataItem;
      if (!dataItem.showDisable) {
        // @ts-ignore
        ammArrayEnable.push(dataItem);
      }
    }
  });

  let { __timer__ } = store.getState().amm.ammMap;
  // @ts-ignore
  __timer__ = ((ammpools) => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    return setInterval(() => {
      store.dispatch(getAmmMap({ ammpools }));
    }, 900000); //15*60*1000 //900000
  })(ammpools);

  return { ammMap, ammArrayEnable, __timer__ };
};

export function* getPostsSaga({
  payload,
}: PayloadAction<GetAmmMapParams & { ammpoolsRaw?: any; chainId?: ChainId }>) {
  try {
    const { ammpools } = payload;
    if (payload?.ammpoolsRaw && payload.chainId) {
      ammMapStoreLocal(payload?.ammpoolsRaw, payload.chainId);
    }
    const { ammMap, ammArrayEnable, __timer__ } = yield call(getAmmMapApi, {
      ammpools,
    });
    // const { readyState } = store.getState().account;
    // if (readyState === AccountStatus.ACTIVATED) {
    //   store.dispatch(getUserAMM(undefined));
    // }
    yield put(getAmmMapStatus({ ammMap, ammArrayEnable, __timer__ }));
  } catch (err) {
    yield put(getAmmMapStatus({ error: err }));
  }
}

export function* updateRealTimeSaga({ payload }: any) {
  try {
    const { ammPoolStats } = payload;
    let { ammMap: _ammMap, ammArrayEnable: _ammArrayEnable } =
      store.getState().amm.ammMap;
    let ammMap;
    let ammArrayEnable = _.cloneDeep(_ammArrayEnable);
    if (ammPoolStats) {
      ammMap = Reflect.ownKeys(ammPoolStats).reduce((_ammMap, key) => {
        const market = (key as string).replace("AMM-", "");
        const ammMarket = "AMM-" + market;
        // myLog("ammPoolStats[ammMarket]", ammPoolStats[ammMarket]);
        const result = setAmmState({
          ammPoolState: {
            ..._ammMap[ammMarket]?.__ammPoolState__,
            ...ammPoolStats[ammMarket],
          },
          market,
        });
        // @ts-ignore
        _ammMap[ammMarket] = {
          ..._ammMap[ammMarket],
          ...result,
          market,
        };
        if (!_ammMap[ammMarket].showDisable) {
          const index = ammArrayEnable.findIndex(
            (item) => _ammMap[ammMarket].market === item.market
          );
          if (index != -1) {
            ammArrayEnable[index] = _ammMap[ammMarket];
          }
        }
        return _ammMap;
      }, _.cloneDeep(_ammMap));
    }
    yield put(getAmmMapStatus({ ammMap, ammArrayEnable }));
  } catch (err) {
    yield put(getAmmMapStatus({ error: err }));
  }
}

export function* ammMapInitSaga() {
  yield all([takeLatest(getAmmMap, getPostsSaga)]);
}

export function* ammMapRealTimeSaga() {
  yield all([takeLatest(updateRealTimeAmmMap, updateRealTimeSaga)]);
}

export const ammMapSaga = [fork(ammMapInitSaga), fork(ammMapRealTimeSaga)];
