import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { RedeemStackStatus, TradeStackStatus } from "./interface";
import {
  IBData,
  RedeemStack,
  TradeStack,
} from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";

const initState: TradeStack<any> = {
  sellToken: {} as any,
  sellVol: "0",
  deFiSideCalcData: {
    coinSell: {},
    stackViewInfo: {} as any,
  },
};
type R = { [key: string]: any };
const initialState: TradeStackStatus<IBData<R>> = {
  tradeStack: initState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const tradeStackSlice: Slice<TradeStackStatus<IBData<R>>> = createSlice({
  name: "_router_tradeStack",
  initialState,
  reducers: {
    resetTradeStack(state) {
      state.tradeStack = initState;
    },
    updateTradeStack(state, action: PayloadAction<TradeStack<IBData<any>>>) {
      const { sellToken, sellVol, deFiSideCalcData, request } = action.payload;
      state.tradeStack = {
        ...initState,
        sellToken: sellToken as TokenInfo,
      };

      if (request) {
        state.tradeStack.request = request;
      }

      if (deFiSideCalcData) {
        // let _deFiCalcData = { ...deFiCalcData };
        state.tradeStack.deFiSideCalcData = deFiSideCalcData;
        // if (_deFiCalcData.AtoB === undefined) {
        //   _deFiCalcData.AtoB = state.tradeStack.deFiCalcData.AtoB;
        //   _deFiCalcData.BtoA = state.tradeStack.deFiCalcData.BtoA;
        // }
      }

      if (sellVol !== undefined) {
        state.tradeStack.sellVol = sellVol;
      }
    },
  },
});

const initRedeemState: RedeemStack<any> = {
  sellToken: {} as any,
  sellVol: "0",
  deFiSideRedeemCalcData: {
    coinSell: {},
  } as any,
};
const initialRedeemState: RedeemStackStatus<any> = {
  redeemStack: initRedeemState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const redeemStackSlice: Slice<RedeemStackStatus<IBData<R>>> = createSlice({
  name: "_router_redeemStack",
  initialState: initialRedeemState,
  reducers: {
    resetRedeemStack(state) {
      state.redeemStack = initRedeemState;
    },
    updateRedeemStack(state, action: PayloadAction<RedeemStack<IBData<any>>>) {
      const { sellToken, sellVol, deFiSideRedeemCalcData, request } =
        action.payload;
      state.redeemStack = {
        ...initRedeemState,
        sellToken: sellToken as TokenInfo,
      };

      if (request) {
        state.redeemStack.request = request;
      }

      if (deFiSideRedeemCalcData) {
        // let _deFiCalcData = { ...deFiCalcData };
        state.redeemStack.deFiSideRedeemCalcData = deFiSideRedeemCalcData;
        // if (_deFiCalcData.AtoB === undefined) {
        //   _deFiCalcData.AtoB = state.redeemStack.deFiCalcData.AtoB;
        //   _deFiCalcData.BtoA = state.redeemStack.deFiCalcData.BtoA;
        // }
      }

      if (sellVol !== undefined) {
        state.redeemStack.sellVol = sellVol;
      }
    },
  },
});
export { tradeStackSlice, redeemStackSlice };
export const { updateTradeStack, resetTradeStack } = tradeStackSlice.actions;
export const { updateRedeemStack, resetRedeemStack } = redeemStackSlice.actions;
