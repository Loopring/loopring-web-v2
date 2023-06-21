import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { StakingMapStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<StakingMapStates> = {
  marketArray: [],
  marketCoins: [],
  marketMap: {},
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
}
const stakingMapSlice: Slice = createSlice({
  name: 'stakingMap',
  initialState,
  reducers: {
    getStakingMap(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getStakingMapStatus(state, action: PayloadAction<StakingMapStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      const { __timer__, ...stakingMap } = action.payload
      if (stakingMap) {
        state.marketArray = stakingMap.marketArray
        state.marketCoins = stakingMap.marketCoins
        state.marketMap = stakingMap.marketMap
        // , marketCoins, marketMap
        // state.marketArray = { ...state, ...stakingMap };
      }
      if (__timer__) {
        state.__timer__ = __timer__
      }
      state.status = SagaStatus.DONE
    },
    updateStakingSyncMap(state, _action: PayloadAction<StakingMapStates>) {
      state.status = SagaStatus.PENDING
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
const { getStakingMap, updateStakingSyncMap, getStakingMapStatus, statusUnset } =
  stakingMapSlice.actions
export { stakingMapSlice, getStakingMap, getStakingMapStatus, statusUnset, updateStakingSyncMap }
