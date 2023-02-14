import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import {
  ChainHashInfos,
  OffRampHashInfos,
  OffRampStatus,
  VendorProviders,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { ChainId } from "@loopring-web/loopring-sdk";

export type OffRampHashItem = {
  orderId: string;
  chainId: sdk.ChainId;
  address: string;
  product: VendorProviders;
  status: OffRampStatus;
};
export type updateOffRampHashProps = {
  pending: OffRampHashItem;
  payments: OffRampHashItem[];
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
    // clearOffRampHash(
    //   state: OffRampHashInfos,
    //   _action: PayloadAction<undefined>
    // ) {
    //   function make(state: OffRampHashInfos, chainId: string) {
    //     return Reflect.ownKeys(state[chainId]).reduce(
    //       (prev, address) => {
    //         if (state[chainId][address.toString()]) {
    //         }
    //         //TODO
    //         return prev;
    //       },
    //
    //       {} as OffRampHashInfo
    //     );
    //   }
    //
    //   state = {
    //     [ChainId.GOERLI]: make(state, ChainId.GOERLI.toString()),
    //     [ChainId.MAINNET]: make(state, ChainId.MAINNET.toString()),
    //   };
    // },
    updateOffRampHash(
      state: ChainHashInfos,
      action: PayloadAction<OffRampHashItem>
    ) {
      const { orderId, product, status, address, chainId } = action.payload;
      if (!state[chainId] || !state[chainId][address]) {
        state[chainId] = { ...state[chainId], [address]: {} };
      }
      let productObj: any = { pending: undefined, payments: [] };
      switch (status) {
        case OffRampStatus.cancel:
        case OffRampStatus.done:
        case OffRampStatus.expired:
        case OffRampStatus.refund:
          if (state[chainId][address] && state[chainId][address][product]) {
            if (
              state[chainId][address][product].pending?.orderId.toString() ==
              orderId.toString()
            ) {
              state[chainId][address][product].pending = undefined;
            } else {
              state[chainId][address][product].payments?.filter(
                (_item: OffRampHashInfos) =>
                  _item?.orderId.toString() == orderId.toString()
              );
            }
          }
          break;
        case OffRampStatus.waitingForWithdraw:
          if (state[chainId][address] && state[chainId][address][product]) {
            let pending =
              state[chainId][address][product]?.pending?.orderId.toString() !==
              orderId.toString()
                ? state[chainId][address][product]?.pending
                : [];
            productObj = {
              pending,
              payments: [
                ...(state[chainId][address][product]?.payments ?? undefined),
                { ...action.payload },
              ],
            };
          } else {
            productObj = {
              pending: undefined,
              payments: [{ ...action.payload }],
            };
          }
          state[chainId] = {
            ...state[chainId],
            [address]: {
              ...(state[chainId][address] ?? undefined),
              [product]: productObj,
            },
          };
          break;
        case OffRampStatus.watingForCreateOrder:
        case OffRampStatus.waitingForPayment:
          if (state[chainId][address] && state[chainId][address][product]) {
            productObj = {
              pending: action.payload,
              payments: [
                ...(state[chainId][address][product]?.payments ?? undefined),
              ],
            };
          } else {
            productObj = {
              pending: action.payload,
              payments: [],
            };
          }
          state[chainId] = {
            ...state[chainId],
            [address]: {
              ...(state[chainId][address] ?? undefined),
              [product]: productObj,
            },
          };
          break;
      }
    },
  },
});
export { offRampHistorySlice };
export const { clearAll, clearOffRampHash, updateOffRampHash } =
  offRampHistorySlice.actions;
