import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { TradeDefi, TradeDefiStatus } from "./interface";
import { CoinInfo, IBData, RequireOne } from "@loopring-web/common-resources";

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
  feeRaw: "0",
};
type R = { [key: string]: any };
const initialState: TradeDefiStatus<IBData<R>> = {
  tradeDefi: initState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const tradeDefiSlice: Slice<TradeDefiStatus<IBData<R>>> = createSlice({
  name: "_router_tradeDefi",
  initialState,
  reducers: {
    updateTradeDefi(
      state,
      action: PayloadAction<RequireOne<TradeDefi<IBData<any>>, "market">>
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
        defiBalances,
        depositPrice,
        withdrawPrice,
        request,
        feeRaw,
        maxSellVol,
        maxFeeBips,
        miniSellVol,
      } = action.payload;
      if (market !== state.tradeDefi.market) {
        // @ts-ignore
        state.tradeDefi = {
          ...initState,
          type: type ?? "LIDO",
          market,
          sellCoin: sellCoin as CoinInfo<R>,
          buyCoin: buyCoin as CoinInfo<R>,
        };
      }
      if (request) {
        state.tradeDefi.request = request;
      }

      if (deFiCalcData) {
        state.tradeDefi.deFiCalcData = deFiCalcData;
      }
      if (isStoB) {
        state.tradeDefi.isStoB = isStoB;
      }
      if (defiBalances) {
        state.tradeDefi.defiBalances = defiBalances;
      }
      if (maxSellVol) {
        state.tradeDefi.maxSellVol = maxSellVol;
      }
      if (maxFeeBips) {
        state.tradeDefi.maxFeeBips = maxFeeBips;
      }
      if (miniSellVol) {
        state.tradeDefi.miniSellVol = miniSellVol;
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
      if (feeRaw) {
        state.tradeDefi.feeRaw = feeRaw;
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
