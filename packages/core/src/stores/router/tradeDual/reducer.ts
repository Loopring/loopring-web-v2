import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { TradeDual, TradeDualStatus } from "./interface";
import { DualViewInfo } from "@loopring-web/common-resources";

const initialState: TradeDualStatus<DualViewInfo> = {
  tradeDual: {} as any,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const tradeDualSlice: Slice<TradeDualStatus<DualViewInfo>> = createSlice({
  name: "_router_tradeDual",
  initialState,
  reducers: {
    resetTradeDual(state) {
      state.tradeDual = {} as any;
    },
    updateTradeDual(
      state,
      action: PayloadAction<Partial<TradeDual<DualViewInfo>>>
    ) {
      const {
        lessEarnVol,
        lessEarnTokenSymbol,
        greaterEarnVol,
        greaterEarnTokenSymbol,
        maxSellAmount,
        miniSellVol,
        dualViewInfo,
        feeVol,
        feeTokenSymbol,
        maxFeeBips,
        sellToken,
        buyToken,
        balance,
        request,
        coinSell,
        sellVol,
      } = action.payload;
      if (dualViewInfo !== undefined) {
        state.tradeDual.dualViewInfo = dualViewInfo;
      }
      if (sellToken !== undefined) {
        state.tradeDual.sellToken = sellToken;
      }
      if (coinSell) {
        state.tradeDual.coinSell = coinSell;
      }
      if (buyToken !== undefined) {
        state.tradeDual.buyToken = buyToken;
      }

      if (request) {
        state.tradeDual.request = request;
      }

      if (maxSellAmount) {
        state.tradeDual.maxSellAmount = maxSellAmount;
      }

      if (miniSellVol) {
        state.tradeDual.miniSellVol = miniSellVol;
      }
      if (maxFeeBips !== undefined) {
        state.tradeDual.maxFeeBips = maxFeeBips;
      }
      if (lessEarnVol) {
        state.tradeDual.lessEarnVol = lessEarnVol;
      }
      if (lessEarnTokenSymbol) {
        state.tradeDual.lessEarnTokenSymbol = lessEarnTokenSymbol;
      }
      if (greaterEarnVol) {
        state.tradeDual.greaterEarnVol = greaterEarnVol;
      }
      if (greaterEarnTokenSymbol) {
        state.tradeDual.greaterEarnTokenSymbol = greaterEarnTokenSymbol;
      }
      if (feeVol) {
        state.tradeDual.feeVol = feeVol;
      }
      if (feeTokenSymbol) {
        state.tradeDual.feeTokenSymbol = feeTokenSymbol;
      }
      if (balance) {
        state.tradeDual.balance = balance;
      }
      if (sellVol) {
        state.tradeDual.sellVol = sellVol;
      }
    },
  },
});
export { tradeDualSlice };
export const { updateTradeDual, resetTradeDual } = tradeDualSlice.actions;
