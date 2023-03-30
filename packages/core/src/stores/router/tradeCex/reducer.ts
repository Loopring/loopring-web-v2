import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { TradeCex, TradeCexStatus } from "./interface";
import { MAPFEEBIPS } from "../../../defs";

const initState: TradeCex = {
  market: undefined,
  tradePair: undefined,
  tradeCalcData: {
    isCex: true,
  },
  maxFeeBips: MAPFEEBIPS,
} as unknown as TradeCex;
const initialState: TradeCexStatus = {
  // pageTradePro: initState,
  tradeCex: initState,
  __DAYS__: 30,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const tradeCexSlice: Slice<TradeCexStatus> = createSlice({
  name: "_router_tradeCex",
  initialState,
  reducers: {
    resetCexSwap(state) {
      state.tradeCex = initState;
    },
    updateCexTrade(state, action: PayloadAction<Partial<TradeCex>>) {
      const {
        market,
        tradePair,
        request,
        tradeCalcData,
        depth,
        sellUserOrderInfo,
        buyUserOrderInfo,
        minOrderInfo,
        lastStepAt,
        totalFee,
        maxFeeBips,
        ...rest
      } = action.payload;
      if (market !== state.tradeCex.market && market) {
        // @ts-ignore
        state.tradeCex = {
          market,
          tradePair, //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
          request,
          depth,
          totalFee,
          minOrderInfo,
          tradeCalcData: tradeCalcData as any,
          sellUserOrderInfo,
          buyUserOrderInfo,
          lastStepAt: undefined,
          maxFeeBips: MAPFEEBIPS,
          ...rest,
        };
      } else {
        if (lastStepAt) {
          state.tradeCex.lastStepAt = lastStepAt;
        }
        if (tradePair && tradePair) {
          state.tradeCex.tradePair = tradePair;
          state.tradeCex.lastStepAt = undefined;
        }
        if (depth) {
          state.tradeCex.depth = depth;
        }
        // if (feeBips) {
        //   state.tradeCex.feeBips = feeBips;
        // }
        if (totalFee) {
          state.tradeCex.totalFee = totalFee;
        }
        // if (takerRate) {
        //   state.tradeCex.takerRate = takerRate;
        // }
        if (minOrderInfo) {
          state.tradeCex.minOrderInfo = minOrderInfo;
        }
        if (maxFeeBips) {
          state.tradeCex.maxFeeBips = maxFeeBips;
        }
        if (tradeCalcData) {
          state.tradeCex.tradeCalcData = tradeCalcData;
        }
        if (sellUserOrderInfo !== undefined) {
          state.tradeCex.sellUserOrderInfo = sellUserOrderInfo;
        }
        if (buyUserOrderInfo !== undefined) {
          state.tradeCex.buyUserOrderInfo = buyUserOrderInfo;
        }
      }
    },
  },
});

export { tradeCexSlice };
export const { resetCexSwap, updateCexTrade } = tradeCexSlice.actions;
