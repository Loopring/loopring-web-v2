import { all, call, fork, put, takeLatest } from "redux-saga/effects";
import { getNotify, getNotifyStatus } from "./reducer";

import { Lang, Notify } from "@loopring-web/common-resources";
import { store } from "../index";
import {
  url_path,
  url_test_path,
} from "@loopring-web/webapp/src/pages/TradeRacePage/interface";

const getNotifyApi = async <_R extends { [key: string]: any }>(): Promise<{
  notifyMap: Notify;
}> => {
  const lng = store.getState().settings.language;
  const baseURL = store.getState().system.baseURL;
  let notifyMap = {
    activities: [],
    notifications: [],
    invest: [],
  };

  const path = `${/uat/gi.test(baseURL) ? url_test_path : url_path}`;
  const notify = await fetch(`${path}/notification.json`).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      return { prev: null };
    }
  });
  return {
    notifyMap: {
      ...notifyMap,
      ...notify["en"],
      ...notify[Lang[lng]],
      invest: notify.invest,
      campaignTagConfig: notify.campaignTagConfig,
      prev: { ...notify?.prev },
    },
  };
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
