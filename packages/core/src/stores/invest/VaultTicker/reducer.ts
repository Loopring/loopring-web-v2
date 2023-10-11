import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { VaultTickerStates } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const initialState: Required<VaultTickerStates> = {
  vaultTickerMap: {},
  __timer__: -1,
  status: SagaStatus.PENDING,
  errorMessage: null,
}
const vaultTickerMapSlice: Slice = createSlice({
  name: 'vaultTickerMap',
  initialState,
  reducers: {
    resetVaultTicker(state) {
      if (state.__timer__ !== -1) {
        clearTimeout(state.__timer__)
        state.__timer__ = -1
      }
      state.vaultTickerMap = {}
      state.status = SagaStatus.UNSET
    },
    updateVaultTicker(
      state,
      _action: PayloadAction<sdk.LoopringMap<sdk.DatacenterTokenInfoSimple>>,
    ) {
      state.status = SagaStatus.PENDING
    },
    getVaultTickers(state) {
      state.status = SagaStatus.PENDING
    },
    getVaultTickerStatus(state, action: PayloadAction<VaultTickerStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      const { vaultTickerMap, __timer__ } = action.payload
      if (vaultTickerMap) {
        state.vaultTickerMap = vaultTickerMap
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
export { vaultTickerMapSlice }
export const { updateVaultTicker, getVaultTickers, getVaultTickerStatus, statusUnset } =
  vaultTickerMapSlice.actions
