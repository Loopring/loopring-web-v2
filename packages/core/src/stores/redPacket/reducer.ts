import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { RedPacketConfigStates } from './interface'
import { CoinKey, SagaStatus } from '@loopring-web/common-resources'

const initialState: Required<RedPacketConfigStates> = {
  redPacketConfigs: {},
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
}
const redPacketConfigsSlice: Slice = createSlice({
  name: 'redPacketConfigs',
  initialState,
  reducers: {
    getRedPacketConfigs(state, _action: PayloadAction<Array<CoinKey<any>>>) {
      state.status = SagaStatus.PENDING
    },
    getRedPacketConfigsStatus(state, action: PayloadAction<RedPacketConfigStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      const { redPacketConfigs, __timer__ } = action.payload
      if (redPacketConfigs) {
        state.redPacketConfigs = redPacketConfigs
      }
      if (__timer__) {
        state.__timer__ = __timer__
      }
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { redPacketConfigsSlice }
export const { getRedPacketConfigs, getRedPacketConfigsStatus, statusUnset } =
  redPacketConfigsSlice.actions
