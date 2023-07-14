import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { InvestTokenTypeMapStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<InvestTokenTypeMapStates> = {
  investTokenTypeMap: {},
  status: SagaStatus.PENDING,
  errorMessage: null,
}
const investTokenTypeMapSlice: Slice = createSlice({
  name: 'investTokenTypeMap',
  initialState,
  reducers: {
    getInvestTokenTypeMap(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getInvestTokenTypeMapStatus(state, action: PayloadAction<InvestTokenTypeMapStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      state.investTokenTypeMap = action.payload.investTokenTypeMap
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
const { getInvestTokenTypeMapStatus, getInvestTokenTypeMap, statusUnset } =
  investTokenTypeMapSlice.actions
export { statusUnset, investTokenTypeMapSlice, getInvestTokenTypeMapStatus, getInvestTokenTypeMap }
