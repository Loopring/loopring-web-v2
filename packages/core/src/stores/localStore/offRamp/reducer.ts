import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import {
  ChainHashInfos,
  OffRampHashInfo,
  OffRampHashInfos,
  OffRampStatus,
  VendorProviders,
} from "@loopring-web/common-resources";
import { ChainId } from "@loopring-web/loopring-sdk";
import * as sdk from "@loopring-web/loopring-sdk";

export type updateOffRampHashProps = {
  orderId: string;
  chainId: sdk.ChainId;
  address: string;
  product: VendorProviders;
  status: OffRampStatus;
};
const initialState: OffRampHashInfos = {
  [ChainId.GOERLI]: {},
  [ChainId.MAINNET]: {},
  // withdrawHashes:{},
};
const offRampHistorySlice: Slice<OffRampHashInfos> = createSlice<
  OffRampHashInfos,
  SliceCaseReducers<any>,
  "offRampHistory"
>({
  name: "offRampHistory",
  initialState,
  reducers: {
    // @ts-ignore
    clearAll(state: OffRampHashInfos, _action: PayloadAction<undefined>) {
      state = { ...initialState };
    },
    clearOffRampHash(
      state: OffRampHashInfos,
      _action: PayloadAction<undefined>
    ) {
      function make(state: OffRampHashInfos, chainId: string) {
        return Reflect.ownKeys(state[chainId]).reduce(
          (prev, address) => {
            if (state[chainId][address.toString()]) {
            }
            //TODO
            return prev;
          },

          {} as OffRampHashInfo
        );
      }

      state = {
        [ChainId.GOERLI]: make(state, ChainId.GOERLI.toString()),
        [ChainId.MAINNET]: make(state, ChainId.MAINNET.toString()),
      };
    },
    updateOffRampHash(
      state: ChainHashInfos,
      action: PayloadAction<updateOffRampHashProps>
    ) {
      const { orderId, product, status, address, chainId } = action.payload;
      if (!state[chainId] || !state[chainId][address]) {
        state[chainId] = { ...state[chainId], [address]: {} };
      }
      if (orderId && product && status) {
        state[chainId] = {
          ...state[chainId],
          [address]: {
            ...state[chainId][address],
            [product]: { orderId, status },
          },
        };
      }
    },
  },
});
export { offRampHistorySlice };
export const { clearAll, clearOffRampHash, updateOffRampHash } =
  offRampHistorySlice.actions;
