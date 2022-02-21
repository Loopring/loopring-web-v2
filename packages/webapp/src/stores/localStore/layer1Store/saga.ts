import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import {
  circleUpdateLayer1ActionHistory,
  layer1ActionHistoryStatus,
} from "./reducer";
import { PayloadAction } from "@reduxjs/toolkit";
import store from "../../index";
import { ChainId } from "@loopring-web/loopring-sdk";

const updateLayer1ActionHistory = async <R extends { [key: string]: any }>({
  chainId,
}: {
  chainId: ChainId;
}) => {
  let { __timer__, layer1ActionHistory } = store.getState().layer1ActionHistory;
  const now = Date.now();
  let _layer1ActionHistory = {};
  if (layer1ActionHistory[chainId]) {
    _layer1ActionHistory = Reflect.ownKeys(layer1ActionHistory[chainId]).map(
      (item) => {
        if (layer1ActionHistory[chainId][item]) {
          _layer1ActionHistory[chainId] = {};
          // _layer1ActionHistory = _.cloneDeep(layer1ActionHistory[chainId][item]);
          _layer1ActionHistory[chainId][item] = Reflect.ownKeys(
            layer1ActionHistory[chainId][item]
          ).reduce((prev, unit) => {
            if (now - layer1ActionHistory[chainId][item][unit] >= 1800000) {
              prev[unit] = layer1ActionHistory[chainId][item][unit];
              return prev;
            }
            return prev;
          }, {});
        }
      }
    );
  }
  __timer__ = (() => {
    if (__timer__ && __timer__ !== -1) {
      clearInterval(__timer__);
    }
    return setInterval(() => {
      const chainId = store.getState().system.chainId;
      store.dispatch(circleUpdateLayer1ActionHistory({ chainId }));
    }, 1800000); //30*60*1000 //1800000
  })();
  return { layer1ActionHistory: _layer1ActionHistory, __timer__ };
};

export function* getPostsSaga({
  payload,
}: PayloadAction<{ chainId: ChainId }>) {
  try {
    const chainId = payload.chainId;
    const { layer1ActionHistory, __timer__ } = yield call(
      updateLayer1ActionHistory,
      { chainId }
    );
    yield put(layer1ActionHistoryStatus({ layer1ActionHistory, __timer__ }));
  } catch (err) {
    yield put(layer1ActionHistoryStatus(err));
  }
}

function* Layer1Saga() {
  yield all([takeLatest(circleUpdateLayer1ActionHistory, getPostsSaga)]);
}

export const layer1ActionHistoryForks = [fork(Layer1Saga)];
