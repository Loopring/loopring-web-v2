import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getAmmMap, getAmmMapStatus, updateRealTimeAmmMap } from "./reducer";
import { AmmDetail, myLog } from "@loopring-web/common-resources";
import { store } from "../../index";
import { AmmPoolInfoV3, AmmPoolStat, toBig } from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../../api_wrapper";
import { PayloadAction } from "@reduxjs/toolkit";
import { AmmDetailStore, GetAmmMapParams } from "./interface";
import { volumeToCount, volumeToCountAsBigNumber } from "../../../hooks/help";

type AmmMap<R extends { [key: string]: any }> =
  | { [key: string]: AmmDetail<R> }
  | {}; //key is AMM-XXX-XXX
export const setAmmState = ({
  ammPoolState,
  keyPair,
}: {
  ammPoolState: AmmPoolStat;
  keyPair: string;
}) => {
  const { idIndex } = store.getState().tokenMap;
  // @ts-ignore
  const [, coinA, coinB] = keyPair.match(/(\w+)-(\w+)/i);
  const { forex, fiatPrices } = store.getState().system;
  if (idIndex && coinA && coinB && fiatPrices && forex) {
    let result = {
      amountDollar: parseFloat(ammPoolState?.liquidityUSD || ""),
      amountYuan:
        parseFloat(ammPoolState?.liquidityUSD || "") * (forex ? forex : 6.5),
      totalLPToken: volumeToCount("LP-" + keyPair, ammPoolState.lpLiquidity),
      totalA: volumeToCount(coinA, ammPoolState.liquidity[0]), //parseInt(ammPoolState.liquidity[ 0 ]),
      totalB: volumeToCount(coinB, ammPoolState.liquidity[1]), //parseInt(ammPoolState.liquidity[ 1 ]),
      rewardValue: ammPoolState.rewards[0]
        ? volumeToCount(
            idIndex[ammPoolState.rewards[0].tokenId as number],
            ammPoolState.rewards[0].volume
          )
        : undefined,
      rewardToken: ammPoolState.rewards[0]
        ? idIndex[ammPoolState.rewards[0].tokenId as number]
        : undefined,
      rewardValue2: ammPoolState.rewards[1]
        ? volumeToCount(
            idIndex[ammPoolState.rewards[1].tokenId as number],
            ammPoolState.rewards[1].volume
          )
        : undefined,
      rewardToken2: ammPoolState.rewards[1]
        ? idIndex[ammPoolState.rewards[1].tokenId as number]
        : undefined,
    };

    const feeA = volumeToCountAsBigNumber(coinA, ammPoolState.fees[0]);
    const feeB = volumeToCountAsBigNumber(coinB, ammPoolState.fees[1]);
    const feeDollar =
      fiatPrices[coinA] && fiatPrices[coinB]
        ? toBig(feeA || 0)
            .times(fiatPrices[coinA].price)
            .plus(toBig(feeB || 0).times(fiatPrices[coinB].price))
        : undefined;
    const feeYuan = feeDollar ? feeDollar.times(forex) : undefined;

    return {
      ...result,
      feeA: feeA?.toNumber(),
      feeB: feeB?.toNumber(),
      feeDollar: feeDollar ? feeDollar.toNumber() : undefined,
      feeYuan: feeYuan ? feeYuan.toNumber() : undefined,
      tradeFloat: {
        change: undefined,
        timeUnit: "24h",
      },
      APR: (parseInt(ammPoolState.apyBips) * 1.0) / 100,
    };
  }
};
const getAmmMapApi = async <R extends { [key: string]: any }>({
  ammpools,
}: GetAmmMapParams) => {
  if (!LoopringAPI.ammpoolAPI) {
    return undefined;
  }

  let ammMap: AmmMap<R> = {};
  myLog("loop get ammPoolStats");

  const { ammPoolStats } = await LoopringAPI.ammpoolAPI?.getAmmPoolStats();

  let { __timer__ } = store.getState().amm.ammMap;
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    return setInterval(async () => {
      if (!LoopringAPI.ammpoolAPI) {
        return undefined;
      }

      let ammPoolStats: { [key in keyof R]: AmmPoolStat } = (
        await LoopringAPI.ammpoolAPI.getAmmPoolStats()
      ).ammPoolStats as { [key in keyof R]: AmmPoolStat };
      store.dispatch(updateRealTimeAmmMap({ ammPoolStats }));
    }, 900000); //15*60*1000 //900000
  })();
  const {
    tokenMap: { idIndex },
  } = store.getState();

  Reflect.ownKeys(ammpools).forEach(async (key) => {
    const item: AmmPoolInfoV3 = ammpools[key as string];
    if (item.market === key && item.tokens.pooled && idIndex) {
      const coinA = idIndex[item.tokens.pooled[0] as any];
      const coinB = idIndex[item.tokens.pooled[1] as any];
      const dataItem: AmmDetailStore<R> = {
        ...item,
        coinA: coinA,
        coinB: coinB,
        isNew:
          Date.now() - Number(item.createdAt) > 3 * 86400 * 1000 ? false : true, //3*24*60*60*1000,
        isActivity: item.status === 7 ? true : false,
        ...setAmmState({
          ammPoolState: ammPoolStats[key],
          keyPair: `${coinA}-${coinB}`,
        }),
        __rawConfig__: item,
      } as AmmDetailStore<R>;
      // @ts-ignore
      ammMap[item.market] = dataItem;
    }
  });
  return { ammMap, __timer__ };
};

export function* getPostsSaga({ payload }: PayloadAction<GetAmmMapParams>) {
  try {
    const { ammpools } = payload;
    const { ammMap, __timer__ } = yield call(getAmmMapApi, { ammpools });
    yield put(getAmmMapStatus({ ammMap, __timer__ }));
  } catch (err) {
    yield put(getAmmMapStatus(err));
  }
}

export function* updateRealTimeSaga({ payload }: any) {
  try {
    const { ammPoolStats } = payload;
    let { ammMap }: { ammMap: AmmMap<object> } = store.getState().amm.ammMap;
    if (ammPoolStats) {
      Reflect.ownKeys(ammPoolStats).map((key) => {
        const keyPair = (key as string).replace("AMM-", "");
        // @ts-ignore
        ammMap[key] = {
          // @ts-ignore
          ...ammMap[key],
          ...setAmmState({
            ammPoolState: ammPoolStats[key as string],
            keyPair,
          }),
        };
        return ammMap;
      });
    }
    yield put(getAmmMapStatus({ ammMap }));
  } catch (err) {
    yield put(getAmmMapStatus(err));
  }
}

export function* ammMapInitSaga() {
  yield all([takeLatest(getAmmMap, getPostsSaga)]);
}

export function* ammMapRealTimeSaga() {
  yield all([takeLatest(updateRealTimeAmmMap, updateRealTimeSaga)]);
}

export const ammMapSaga = [fork(ammMapInitSaga), fork(ammMapRealTimeSaga)];
