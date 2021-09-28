import { all, call, put, takeLatest } from "redux-saga/effects"
import { getAmmActivityMap, getAmmActivityMapStatus } from './reducer'
import { LoopringAPI } from 'api_wrapper';

const getAmmActivityMapApi = async () => {

    if (LoopringAPI.ammpoolAPI) {
        const {groupByRuleTypeAndStatus, activityRules, } = await LoopringAPI.ammpoolAPI.getAmmPoolActivityRules();
        return {data: { groupByRuleTypeAndStatus, activityRules, }}
    } else {
        return {data: undefined}
    }

}

export function* getPostsSaga() {
    try {
        //
        const {data} = yield call(getAmmActivityMapApi);
        yield put(getAmmActivityMapStatus({ammActivityMap: data.groupByRuleTypeAndStatus, activityRules: data.activityRules, }));
    } catch (err) {
        yield put(getAmmActivityMapStatus(err));
    }
}

export default function* ammActivityMapSaga() {
    yield all([takeLatest(getAmmActivityMap, getPostsSaga)]);
}
