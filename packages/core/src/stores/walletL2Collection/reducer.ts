import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { WalletL2CollectionStates } from "./interface";
import { SagaStatus } from "@loopring-web/common-resources";

const initialState: WalletL2CollectionStates = {
  walletL2Collection: [],
  total: 0,
  status: "DONE",
  errorMessage: null,
  page: -1,
};
const walletL2CollectionSlice: Slice<WalletL2CollectionStates> = createSlice({
  name: "walletL2Collection",
  initialState,
  reducers: {
    updateWalletL2Collection(state, _action: PayloadAction<{ page?: number }>) {
      state.status = SagaStatus.PENDING;
    },
    reset(state) {
      state = {
        ...initialState,
      };
      state.status = SagaStatus.UNSET;
    },
    socketUpdateBalance(state) {
      state.status = SagaStatus.PENDING;
    },
    getWalletL2CollectionStatus(
      state,
      action: PayloadAction<WalletL2CollectionStates>
    ) {
      // @ts-ignore
      if (action.error) {
        state.status = SagaStatus.ERROR;
        // @ts-ignore
        state.errorMessage = action.error;
      }
      state.walletL2Collection = [...(action.payload?.walletL2Collection ?? [])];
      state.total = action.payload.total ?? 0;
      state.status = SagaStatus.DONE;
      state.page = action.payload.page ?? 1;
    },
    statusUnset: (state) => {
      state.status = SagaStatus.UNSET;
    },
  },
});
export { walletL2CollectionSlice };
export const {
  updateWalletL2Collection,
  socketUpdateBalance,
  getWalletL2CollectionStatus,
  statusUnset,
  reset,
} = walletL2CollectionSlice.actions;
