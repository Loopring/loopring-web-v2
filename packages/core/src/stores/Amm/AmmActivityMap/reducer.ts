import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { AmmActivityMapStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<AmmActivityMapStates> = {
  ammActivityMap: {},
  activityInProgressRules: {},
  activityDateMap: {},
  groupByRuleType: {},
  groupByActivityStatus: {},
  groupByRuleTypeAndStatus: {},
  status:SagaStatus.PENDING,
  errorMessage: null,
}
const ammActivityMapSlice: Slice = createSlice({
  name: 'ammActivityMap',
  initialState,
  reducers: {
    getAmmActivityMap(state, _action: PayloadAction<string | undefined>) {
      state.status = SagaStatus.PENDING
    },
    getAmmActivityMapStatus(state, action: PayloadAction<AmmActivityMapStates>) {
      // @ts-ignore
      if (action.payload?.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.payload.error
      }
      state.ammActivityMap = { ...action.payload.groupByRuleTypeAndStatus }
      state.activityInProgressRules = {
        ...action.payload.activityInProgressRules,
      }
      state.activityDateMap = { ...action.payload.activityDateMap }
      state.groupByRuleType = { ...action.payload.groupByRuleType }
      state.groupByActivityStatus = {
        ...action.payload.groupByActivityStatus,
      }
      state.groupByRuleTypeAndStatus = {
        ...action.payload.groupByRuleTypeAndStatus,
      }
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { ammActivityMapSlice }
export const { getAmmActivityMap, getAmmActivityMapStatus, statusUnset } =
  ammActivityMapSlice.actions
