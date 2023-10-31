import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { TargetRedPacketStates } from './interface'
import { CoinKey, SagaStatus } from '@loopring-web/common-resources'
import { LuckyTokenItemForReceive } from '@loopring-web/loopring-sdk'

const initialState: Required<TargetRedPacketStates> = {
  redPackets: undefined,
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
  openedRedPackets: false,
  showPopup: false,
}
const targetRedpacketSlice: Slice = createSlice({
  name: 'targetRedpacket',
  initialState,
  reducers: {
    getExclusiveRedpacket(state, _action: PayloadAction<undefined>) {
      state.status = SagaStatus.PENDING
    },
    getExclusiveRedpacketStatus(state, action: PayloadAction<TargetRedPacketStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      const { redPackets, __timer__ } = action.payload
      if (redPackets) {
        state.redPackets = redPackets
      }
      if (__timer__) {
        state.__timer__ = __timer__
      }
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
    setShowRedPacketsPopup: (state: TargetRedPacketStates, action: PayloadAction<boolean>) => {
      state.showPopup = action.payload
    },
  },
})
export { targetRedpacketSlice }
export const {
  getExclusiveRedpacket,
  getExclusiveRedpacketStatus,
  statusUnset,
  setShowRedPacketsPopup,
} = targetRedpacketSlice.actions
