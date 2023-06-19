import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getRedPacketConfigs, getRedPacketConfigsStatus } from "./reducer";
import { myLog } from "@loopring-web/common-resources";

import { store, LoopringAPI } from "../../index";

const getRedPacketConfigsApi = async (): Promise<{
  data: object | undefined;
  __timer__: NodeJS.Timer | -1;
}> => {
  let { __timer__ } = store.getState().redPacketConfigs.__timer__;
  // let { redPacketConfigs } = store.getState().redpacketConfigs;

  if (LoopringAPI.luckTokenAPI) {
    __timer__ = ((__timer__) => {
      if (__timer__ && __timer__ !== -1) {
        clearTimeout(__timer__);
      }
      return setTimeout(() => {
        store.dispatch(getRedPacketConfigs({}));
      }, 1000 * 60 * 30);
    })(__timer__);
    const [resLuckTokenAgents, resLuckTokenAgentsAuth] = await Promise.all([
      LoopringAPI.luckTokenAPI.getLuckTokenAgents(),
      LoopringAPI.luckTokenAPI.getLuckTokenAuthorizedSigners(),
    ]);
    const luckTokenAgents = resLuckTokenAgents?.luckTokenAgents;
    const luckTokenAgentsAuth = resLuckTokenAgentsAuth?.luckTokenAgents;

    return {
      data: {
        luckTokenAgents,
        luckTokenAgentsAuth,
      },
      __timer__,
    };
  } else {
    if (__timer__ && __timer__ !== -1) {
      clearTimeout(__timer__);
    }
    return { data: {}, __timer__: -1 };
  }
};

function* getPostsSaga() {
  try {
    const { data, __timer__ } = yield call(getRedPacketConfigsApi);
    yield put(getRedPacketConfigsStatus({ redPacketConfigs: data, __timer__ }));
  } catch (err) {
    yield put(getRedPacketConfigsStatus(err));
  }
}

function* redPacketConfigsInitSaga() {
  yield all([takeLatest(getRedPacketConfigs, getPostsSaga)]);
}

export const redPacketConfigsSaga = [
  fork(redPacketConfigsInitSaga),
  // fork(tokenPairsSaga),
];
