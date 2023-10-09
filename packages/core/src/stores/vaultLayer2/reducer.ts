import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { VaultLayer2States } from './interface'
import { SagaStatus } from '@loopring-web/common-resources'

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
    updateVaultLayer2(
      state,
      _action: PayloadAction<{ activeInfo?: { hash: string; isInActive: boolean } | undefined }>,
    ) {
      state.status = SagaStatus.PENDING
    },
    reset(state) {
      state.vaultLayer2 = undefined
      if (state?.__timer__ && state.__timer__ !== -1) {
        clearTimeout(state.__timer__ as any)
        state.__timer__ = -1
      }
      state.status = SagaStatus.UNSET
    },
    socketUpdateBalance(state) {
      state.status = SagaStatus.PENDING
    },
    getVaultLayer2Status(state, action: PayloadAction<VaultLayer2States>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }

      state.__timer__ = action.payload?.__timer__ ?? -1
      state.activeInfo = action.payload.activeInfo
      state.vaultLayer2 = { ...action.payload.vaultLayer2 }
      state.vaultAccountInfo = { ...action.payload.vaultAccountInfo } as any
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
