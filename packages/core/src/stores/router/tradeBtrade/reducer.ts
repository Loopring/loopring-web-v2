import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { TradeBtrade, TradeBtradeStatus } from "./interface";
import { MAPFEEBIPS } from "../../../defs";

const initState: TradeBtrade = {
  market: undefined,
  tradePair: undefined,
  tradeCalcData: {
    isBtrade: true,
  },
  maxFeeBips: MAPFEEBIPS,
} as unknown as TradeBtrade;
const initialState: TradeBtradeStatus = {
  // pageTradePro: initState,
  tradeBtrade: initState,
  __DAYS__: 30,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const tradeBtradeSlice: Slice<TradeBtradeStatus> = createSlice({
  name: "_router_tradeBtrade",
  initialState,
  reducers: {
    resetBtradeSwap(state) {
      state.tradeBtrade = initState;
    },
    updateBtradeTrade(state, action: PayloadAction<Partial<TradeBtrade>>) {
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
        sellMinAmtInfo,
        sellMaxL2AmtInfo,
        sellMaxAmtInfo,
        // btradeMarket,
        maxFeeBips,
        ...rest
      } = action.payload;
      if (market !== state.tradeBtrade.market && market && tradePair) {
        // @ts-ignore
        const [_, sellToken, buyToken] = (tradePair ?? "").match(
          /(\w+)-(\w+)/i
        );
        // @ts-ignore
        state.tradeBtrade = {
          market,
          tradePair, //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
          request,
          depth,
          totalFee,
          minOrderInfo,
          sellToken,
          buyToken,
          tradeCalcData: tradeCalcData as any,
          sellUserOrderInfo,
          buyUserOrderInfo,
          sellMinAmtInfo,
          sellMaxL2AmtInfo,
          sellMaxAmtInfo,
          lastStepAt: undefined,
          // btradeMarket,
          maxFeeBips,
          ...rest,
        };
      } else {
        if (lastStepAt) {
          state.tradeBtrade.lastStepAt = lastStepAt;
        }
        if (tradePair && tradePair) {
          const [_, sellToken, buyToken] = tradePair.match(/(\w+)-(\w+)/i);
          state.tradeBtrade.tradePair = tradePair;
          state.tradeBtrade.sellToken = sellToken;
          state.tradeBtrade.buyToken = buyToken;
          state.tradeBtrade.lastStepAt = undefined;
        }
        if (depth) {
          state.tradeBtrade.depth = depth;
        }

        if (totalFee) {
          state.tradeBtrade.totalFee = totalFee;
        }
        // if (takerRate) {
        //   state.tradeBtrade.takerRate = takerRate;
        // }
        if (minOrderInfo) {
          state.tradeBtrade.minOrderInfo = minOrderInfo;
        }
        if (maxFeeBips !== undefined) {
          state.tradeBtrade.maxFeeBips = maxFeeBips;
        }
        if (tradeCalcData) {
          state.tradeBtrade.tradeCalcData = tradeCalcData;
        }
        if (sellUserOrderInfo !== undefined) {
          state.tradeBtrade.sellUserOrderInfo = sellUserOrderInfo;
        }
        if (buyUserOrderInfo !== undefined) {
          state.tradeBtrade.buyUserOrderInfo = buyUserOrderInfo;
        }

        if (sellMinAmtInfo !== undefined) {
          state.tradeBtrade.sellMinAmtInfo = sellMinAmtInfo;
        }
        if (sellMaxL2AmtInfo !== undefined) {
          state.tradeBtrade.sellMaxL2AmtInfo = sellMaxL2AmtInfo;
        }
        if (sellMaxAmtInfo !== undefined) {
          state.tradeBtrade.sellMaxAmtInfo = sellMaxAmtInfo;
        }
      }
    },
  },
});

export { tradeBtradeSlice };
export const { resetBtradeSwap, updateBtradeTrade } = tradeBtradeSlice.actions;
