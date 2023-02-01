import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { SliceCaseReducers } from "@reduxjs/toolkit/src/createSlice";
import {
  ChainHashInfos,
  RedPacketHashInfo,
  RedpacketHashInfos,
  RedPacketHashItems,
  TX_HASH,
} from "@loopring-web/common-resources";
import { ChainId } from "@loopring-web/loopring-sdk";
import * as sdk from "@loopring-web/loopring-sdk";
export type updateRedpacketHashProps = {
  hash: TX_HASH;
  luckToken: { validSince: number; hash: string };
  chainId: sdk.ChainId;
  address: string;
  claimAmount: string;
};
const initialState: RedpacketHashInfos = {
  [ChainId.GOERLI]: {},
  [ChainId.MAINNET]: {},
  // withdrawHashes:{},
};
const redPacketHistorySlice: Slice<RedpacketHashInfos> = createSlice<
  RedpacketHashInfos,
  SliceCaseReducers<any>,
  "redPacketHistory"
>({
  name: "redPacketHistory",
  initialState,
  reducers: {
    // @ts-ignore
    clearAll(state: RedpacketHashInfos, _action: PayloadAction<undefined>) {
      state = { ...initialState };
    },
    clearRedPacketHash(
      state: RedpacketHashInfos,
      _action: PayloadAction<undefined>
    ) {
      function make(state: RedpacketHashInfos, chainId: string) {
        return Reflect.ownKeys(state[chainId]).reduce(
          (prev, address) => {
            if (state[chainId][address.toString()]) {
              let obj = state[chainId][address.toString()];
              obj = Reflect.ownKeys(obj).reduce((_prev, hash) => {
                const item = obj[hash.toString()];
                if (
                  item &&
                  new Date(item.luckToken.validSince + 86400000).getTime() -
                    Date.now() >
                    0
                ) {
                  _prev = { ..._prev, [hash]: item };
                }
                return _prev;
              }, {} as RedPacketHashItems);
              if (Reflect.ownKeys(obj).length) {
                prev = { ...prev, [address.toString()]: obj };
              }
            }
            return prev;
          },

          {} as RedPacketHashInfo
        );
      }

      state = {
        [ChainId.GOERLI]: make(state, ChainId.GOERLI.toString()),
        [ChainId.MAINNET]: make(state, ChainId.MAINNET.toString()),
      };
    },
    updateRedpacketHash(
      state: ChainHashInfos,
      action: PayloadAction<updateRedpacketHashProps>
    ) {
      const { hash, luckToken, claimAmount, address, chainId } = action.payload;
      if (!state[chainId] || !state[chainId][address]) {
        state[chainId] = { ...state[chainId], [address]: {} };
      }
      if (luckToken && hash) {
        state[chainId] = {
          ...state[chainId],
          [address]: {
            ...state[chainId][address],
            [hash]: {
              luckToken: {
                validSince: luckToken.validSince,
                hash: luckToken.hash,
              },
              claim: claimAmount,
            },
          },
        };
      }
    },
  },
});
export { redPacketHistorySlice };
export const { clearAll, clearRedPacketHash, updateRedpacketHash } =
  redPacketHistorySlice.actions;
