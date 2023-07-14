import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { WalletL2CollectionStates } from './interface'
import { CollectionMeta, SagaStatus, L2CollectionFilter } from '@loopring-web/common-resources'

const initialState: WalletL2CollectionStates<CollectionMeta> = {
  walletL2Collection: [],
  total: 0,
  legacyContract: [],
  status: 'DONE',
  errorMessage: null,
  page: -1,
}
const walletL2CollectionSlice: Slice<WalletL2CollectionStates<CollectionMeta>> = createSlice({
  name: 'walletL2Collection',
  initialState,
  reducers: {
    reset(state) {
      state = {
        ...initialState,
      }
      state.status = SagaStatus.UNSET
    },
    updateLegacyContracts(state, action: PayloadAction<{ legacyContract: string[] }>) {
      state.legacyContract = action.payload?.legacyContract ?? []
    },
    updateWalletL2LegacyContract(state, action: PayloadAction<{ legacyContract: string[] }>) {
      state.legacyContract = action.payload?.legacyContract ?? []
    },
    updateWalletL2Collection(
      state,
      _action: PayloadAction<{ page?: number; filter?: L2CollectionFilter }>,
    ) {
      state.status = SagaStatus.PENDING
    },
    socketUpdateBalance(state) {
      state.status = SagaStatus.PENDING
    },
    getWalletL2CollectionStatus(
      state,
      action: PayloadAction<WalletL2CollectionStates<CollectionMeta>>,
    ) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      state.walletL2Collection = [...(action.payload?.walletL2Collection ?? [])]
      state.total = action.payload.total ?? 0
      state.status = SagaStatus.DONE
      state.page = action.payload.page ?? 1
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { walletL2CollectionSlice }
export const {
  updateLegacyContracts,
  updateWalletL2Collection,
  socketUpdateBalance,
  getWalletL2CollectionStatus,
  statusUnset,
  reset,
} = walletL2CollectionSlice.actions
