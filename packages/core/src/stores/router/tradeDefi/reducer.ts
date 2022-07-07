import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { TradeDefi, TradeDefiStatus } from "./interface";
import { CoinInfo, RequireOne } from "@loopring-web/common-resources";

const initState: TradeDefi<any> = {
  type: "LIDO",
  isStoB: true,
  sellCoin: {} as any,
  buyCoin: {} as any,
  depositPrice: "0",
  withdrawPrice: "0",
  sellVol: "0",
  buyVol: "0",
  deFiCalcData: undefined,
  fee: "0",
};
type R = { [key: string]: any };
const initialState: TradeDefiStatus<R> = {
  tradeDefi: initState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const tradeDefiSlice: Slice<TradeDefiStatus<R>> = createSlice({
  name: "_router_tradeDefi",
  initialState,
  reducers: {
    updateTradeDefi(
      state,
      action: PayloadAction<RequireOne<TradeDefi<R>, "market">>
    ) {
      const {
        type,
        market,
        isStoB,
        sellCoin,
        buyCoin,
        sellVol,
        buyVol,
        deFiCalcData,
        fee,
        depositPrice,
        withdrawPrice,
        request,
      } = action.payload;
      if (market !== state.tradeDefi.market) {
        state.tradeDefi = {
          ...initState,
          type: type ?? "LIDO",
          market,
          sellCoin: sellCoin as CoinInfo<R>,
          buyCoin: buyCoin as CoinInfo<R>,
          deFiCalcData,
          request,
        };
      }
      if (isStoB) {
        state.tradeDefi.isStoB = isStoB;
      }
      if (sellVol !== undefined) {
        state.tradeDefi.sellVol = sellVol;
      }
      if (buyVol !== undefined) {
        state.tradeDefi.buyVol = buyVol;
      }
      if (fee) {
        state.tradeDefi.fee = fee;
      }
      if (depositPrice) {
        state.tradeDefi.depositPrice = depositPrice;
      }
      if (withdrawPrice) {
        state.tradeDefi.withdrawPrice = withdrawPrice;
      }
    },
  },
});
export { tradeDefiSlice };
export const { updateTradeDefi, resetTradeDefi } = tradeDefiSlice.actions;
