import { all, call, put, takeLatest } from 'redux-saga/effects'
import { getAmmActivityMap, getAmmActivityMapStatus } from './reducer'
import { LoopringAPI } from '../../../api_wrapper'

const getAmmActivityMapApi = async () => {
  if (LoopringAPI.ammpoolAPI) {
    const {
      activityInProgressRules,
      activityDateMap,
      groupByRuleType,
      groupByActivityStatus,
      groupByRuleTypeAndStatus,
    } = await LoopringAPI.ammpoolAPI.getAmmPoolActivityRules()
    return {
      data: {
        activityInProgressRules,
        activityDateMap,
        groupByRuleType,
        groupByActivityStatus,
        groupByRuleTypeAndStatus,
      },
    }
  } else {
    return { data: undefined }
  }
}

export function* getPostsSaga() {
  try {
    const { data } = yield call(getAmmActivityMapApi)
    yield put(getAmmActivityMapStatus({ ...data }))
  } catch (err) {
    yield put(getAmmActivityMapStatus({ error: err }))
  }
}

export default function* ammActivityMapSaga() {
  yield all([takeLatest(getAmmActivityMap, getPostsSaga)])
}
