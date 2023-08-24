import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { WalletL2NFTCollectionStates } from './interface'
import { CollectionMeta, SagaStatus } from '@loopring-web/common-resources'

const initialState: WalletL2NFTCollectionStates<CollectionMeta> = {
  walletL2NFTCollection: [],
  total: 0,
  status: SagaStatus.DONE,
  errorMessage: null,
  page: -1,
}
const walletL2NFTCollectionSlice: Slice<WalletL2NFTCollectionStates<CollectionMeta>> = createSlice({
  name: 'walletL2NFTCollection',
  initialState,
  reducers: {
    updateWalletL2NFTCollection(state, _action: PayloadAction<{ page?: number }>) {
      state.status = SagaStatus.PENDING
    },
    reset(state) {
      state = {
        ...initialState,
      }
      state.status = SagaStatus.UNSET
    },
    socketUpdateBalance(state) {
      state.status = SagaStatus.PENDING
    },
    getWalletL2NFTCollectionStatus(
      state,
      action: PayloadAction<WalletL2NFTCollectionStates<CollectionMeta>>,
    ) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      state.walletL2NFTCollection = [...(action.payload?.walletL2NFTCollection ?? [])]
      state.total = action.payload.total ?? 0
      state.status = SagaStatus.DONE
      state.page = action.payload.page ?? 1
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { walletL2NFTCollectionSlice }
export const {
  updateWalletL2NFTCollection,
  socketUpdateBalance,
  getWalletL2NFTCollectionStatus,
  statusUnset,
  reset,
} = walletL2NFTCollectionSlice.actions
