import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getNotify, getNotifyStatus } from "./reducer";

import { getNotification, myLog, Notify } from "@loopring-web/common-resources";
import { store } from "../index";

const Lang = {
  en_US: "en",
  zh_CN: "zh",
};
const getNotifyApi = async <_R extends { [key: string]: any }>(): Promise<{
  notifyMap: Notify;
}> => {
  const lng = store.getState().settings.language;
  const notifyMap = await getNotification(Lang[lng] as any);
  myLog("getNotification notifyMap", notifyMap);
  return { notifyMap: notifyMap };
};

export function* getPostsSaga() {
  try {
    const { notifyMap } = yield call(getNotifyApi);
    yield put(getNotifyStatus({ notifyMap }));
  } catch (err) {
    yield put(getNotifyStatus(err));
  }
}

function* notifySaga() {
  yield all([takeLatest(getNotify, getPostsSaga)]);
}

export const notifyForks = [fork(notifySaga)];
