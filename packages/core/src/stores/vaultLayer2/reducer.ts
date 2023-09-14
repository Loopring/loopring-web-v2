import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { VaultLayer2Map, VaultLayer2States } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'

const initialState: VaultLayer2States = {
  vaultLayer2: undefined,
  status: SagaStatus.DONE,
  errorMessage: null,
  vaultAccountInfo: undefined,
}
const vaultLayer2Slice: Slice<VaultLayer2States> = createSlice({
  name: 'vaultLayer2',
  initialState,
  reducers: {
    updateVaultLayer2(state) {
      state.status = SagaStatus.PENDING
    },
    reset(state) {
      state.vaultLayer2 = undefined
      state.status = SagaStatus.UNSET
    },
    socketUpdateBalance(state) {
      state.status = SagaStatus.PENDING
    },
    getVaultLayer2Status(
      state,
      action: PayloadAction<{
        vaultLayer2: VaultLayer2Map<object>
        vaultAccountInfo: sdk.VaultAccountInfo
      }>,
    ) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      state.vaultLayer2 = { ...action.payload.vaultLayer2 }
      state.vaultAccountInfo = { ...action.payload.vaultAccountInfo }
      state.status = SagaStatus.DONE
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { vaultLayer2Slice }
export const { updateVaultLayer2, socketUpdateBalance, getVaultLayer2Status, statusUnset, reset } =
  vaultLayer2Slice.actions
