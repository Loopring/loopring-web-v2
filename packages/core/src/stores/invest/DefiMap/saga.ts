import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getDefiMap, getDefiMapStatus } from "./reducer";
import { store } from "../../index";
import { LoopringAPI } from "../../../api_wrapper";

// type DefiMap<R extends { [key: string]: any }> =
//   | { [key: string]: AmmDetail<R> }
//   | {}; //key is AMM-XXX-XXX
// export const setAmmState = ({
//   investPoolState,
//   keyPair,
// }: {
//   investPoolState: AmmPoolStat;
//   keyPair: string;
// }) => {
//   const { idIndex } = store.getState().tokenMap;
//   // @ts-ignore
//   const [, coinA, coinB] = keyPair.match(/(\w+)-(\w+)/i);
//   const { tokenPrices } = store.getState().tokenPrices;
//   if (idIndex && coinA && coinB && tokenPrices) {
//     let result = {
//       amountDollar: parseFloat(investPoolState?.liquidityUSD || ""),
//       totalLPToken: volumeToCount("LP-" + keyPair, investPoolState.lpLiquidity),
//       totalA: volumeToCount(coinA, investPoolState.liquidity[0]), //parseInt(investPoolState.liquidity[ 0 ]),
//       totalB: volumeToCount(coinB, investPoolState.liquidity[1]), //parseInt(investPoolState.liquidity[ 1 ]),
//       rewardValue: investPoolState.rewards[0]
//         ? volumeToCount(
//             idIndex[investPoolState.rewards[0].tokenId as number],
//             investPoolState.rewards[0].volume
//           )
//         : undefined,
//       rewardToken: investPoolState.rewards[0]
//         ? idIndex[investPoolState.rewards[0].tokenId as number]
//         : undefined,
//       rewardValue2: investPoolState.rewards[1]
//         ? volumeToCount(
//             idIndex[investPoolState.rewards[1].tokenId as number],
//             investPoolState.rewards[1].volume
//           )
//         : undefined,
//       rewardToken2: investPoolState.rewards[1]
//         ? idIndex[investPoolState.rewards[1].tokenId as number]
//         : undefined,
//     };
//
//     const feeA = volumeToCountAsBigNumber(coinA, investPoolState.fees[0]);
//     const feeB = volumeToCountAsBigNumber(coinB, investPoolState.fees[1]);
//     const feeDollar =
//       tokenPrices[coinA] && tokenPrices[coinB]
//         ? toBig(feeA || 0)
//             .times(tokenPrices[coinA])
//             .plus(toBig(feeB || 0).times(tokenPrices[coinB]))
//         : undefined;
//
//     return {
//       ...result,
//       feeA: feeA?.toNumber(),
//       feeB: feeB?.toNumber(),
//       feeDollar: feeDollar ? feeDollar.toNumber() : undefined,
//       tradeFloat: {
//         change: undefined,
//         timeUnit: "24h",
//       },
//       APR: (parseInt(investPoolState.apyBips) * 1.0) / 100,
//     };
//   }
// };
const getDefiMapApi = async () => {
  if (!LoopringAPI.defiAPI) {
    return undefined;
  }

  const {
    markets: marketMap,
    tokenArr: marketCoins,
    marketArr: marketArray,
  } = await LoopringAPI.defiAPI?.getDefiMarkets();

  let { __timer__ } = store.getState().invest.defiMap;
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    return setInterval(async () => {
      if (!LoopringAPI.defiAPI) {
        return undefined;
      }

      // let { markets, pairs, tokenArr, tokenArrStr, marketArr, marketArrStr } =
      //   await LoopringAPI.defiAPI.getDefiMarkets();
      store.dispatch(getDefiMap(undefined));
    }, 900000); //15*60*1000 //900000
  })();

  return {
    defiMap: {
      marketArray,
      marketCoins,
      marketMap,
    },
    __timer__,
  };
};

export function* getPostsSaga() {
  try {
    const { defiMap, __timer__ } = yield call(getDefiMapApi);
    yield put(getDefiMapStatus({ ...defiMap, __timer__ }));
  } catch (err) {
    yield put(getDefiMapStatus(err));
  }
}

export function* defiMapInitSaga() {
  yield all([takeLatest(getDefiMap, getPostsSaga)]);
}

export const defiMapSaga = [fork(defiMapInitSaga)];
