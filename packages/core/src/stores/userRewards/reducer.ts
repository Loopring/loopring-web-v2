import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { UserRewardsStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'
import { makeSummaryMyAmm } from '../../hooks'

const initialState: UserRewardsStates<{ [key: string]: any }> = {
  userRewardsMap: undefined,
  myAmmLPMap: undefined,
  totalClaims: {},
  rewardU: '',
  feeU: '',
  status: SagaStatus.PENDING,
  errorMessage: null,
  __timer__: -1,
}
const userRewardsMapSlice: Slice<UserRewardsStates<any>> = createSlice({
  name: 'userRewardsMap',
  initialState,
  reducers: {
    getUserRewards(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    resetUserRewards(state, _action: PayloadAction<undefined>) {
        state = {
            ...initialState,
        }
        state.status = SagaStatus.UNSET
    },
    getUserAMM(state, _action: PayloadAction<undefined>) {
      const { myAmmLPMap, rewardU, feeU } = makeSummaryMyAmm({
        userRewardsMap: state.userRewardsMap,
      })
      state.rewardU = rewardU
      state.feeU = feeU
      state.myAmmLPMap = myAmmLPMap
    },
    getUserRewardsStatus(state, action: PayloadAction<UserRewardsStates<any>>) {
      if ((action.payload as any).error) {
        state.status = SagaStatus.ERROR
        state.errorMessage = (action.payload as any).error
        return
      }
      state.errorMessage = null
      state.userRewardsMap = action.payload.userRewardsMap
      state.rewardU = action.payload.rewardU
      state.feeU = action.payload.feeU
      state.myAmmLPMap = action.payload.myAmmLPMap
      state.totalClaims = action.payload.totalClaims
      if (action.payload.__timer__) {
        state.__timer__ = action.payload.__timer__
      }
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { userRewardsMapSlice }
export const { getUserRewards, resetUserRewards, getUserRewardsStatus, statusUnset } =
  userRewardsMapSlice.actions
