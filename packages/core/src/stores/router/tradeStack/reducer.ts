import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { TradeStackStatus } from "./interface";
import { IBData, TradeStack } from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";

const initState: TradeStack<any> = {
  type: "LIDO",
  sellToken: {} as any,
  sellVol: "0",
  maxSellVol: "",
  miniSellVol: "",
  deFiSideCalcData: {
    coinSell: {},
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
      const {
        sellToken,
        type,
        sellVol,
        deFiSideCalcData,
        maxFeeBips,
        maxSellVol,
        miniSellVol,
        request,
      } = action.payload;
      state.tradeStack = {
        ...initState,
        type,
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

      if (maxSellVol) {
        state.tradeStack.maxSellVol = maxSellVol;
      }
      if (maxFeeBips) {
        state.tradeStack.maxFeeBips = maxFeeBips;
      }
      if (miniSellVol) {
        state.tradeStack.miniSellVol = miniSellVol;
      }
      if (sellVol !== undefined) {
        state.tradeStack.sellVol = sellVol;
      }
    },
  },
});
export { tradeStackSlice };
export const { updateTradeStack, resetTradeStack } = tradeStackSlice.actions;
