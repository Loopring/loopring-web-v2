import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { WalletLayer2NFTStates } from './interface'
import { CollectionMeta, MyNFTFilter, SagaStatus } from '@loopring-web/common-resources'

const initialState: WalletLayer2NFTStates = {
  walletLayer2NFT: [],
  collection: undefined,
  total: 0,
  status: SagaStatus.DONE,
  errorMessage: null,
  page: -1,
}
const walletLayer2NFTSlice: Slice<WalletLayer2NFTStates> = createSlice({
  name: 'walletLayer2NFT',
  initialState,
  reducers: {
    updateWalletLayer2NFT(
      state,
      _action: PayloadAction<{
        page?: number
        nftDatas?: string
        collection: CollectionMeta | undefined
        filter?: MyNFTFilter | undefined
      }>,
    ) {
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
    getWalletLayer2NFTStatus(state, action: PayloadAction<WalletLayer2NFTStates>) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR
        // @ts-ignore
        state.errorMessage = action.error
      }
      state.walletLayer2NFT = [...(action.payload?.walletLayer2NFT ?? [])]
      state.collection = action.payload.collection
      state.total = action.payload.total ?? 0
      state.filter = action.payload.filter
      state.status = SagaStatus.DONE
      state.page = action.payload.page ?? 1
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET
    },
  },
})
export { walletLayer2NFTSlice }
export const {
  updateWalletLayer2NFT,
  socketUpdateBalance,
  getWalletLayer2NFTStatus,
  statusUnset,
  reset,
} = walletLayer2NFTSlice.actions
