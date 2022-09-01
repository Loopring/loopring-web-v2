import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { TradeDual, TradeDualStatus } from "./interface";
import { IBData, RequireOne } from "@loopring-web/common-resources";
import { TokenInfo } from "@loopring-web/loopring-sdk";

const initState: TradeDual<any> = {
  type: "Dual",
  isStoB: true,
  sellToken: {} as any,
  buyToken: {} as any,
  depositPrice: "0",
  withdrawPrice: "0",
  sellVol: "0",
  buyVol: "0",
  dualCalcData: {
    coinSell: {},
    coinBuy: {},
    AtoB: undefined as any,
    BtoA: undefined as any,
    fee: undefined as any,
  },
  fee: "0",
  feeRaw: "0",
};
type R = { [key: string]: any };
const initialState: TradeDualStatus<IBData<R>> = {
  tradeDual: initState,
  __DAYS__: 30,
  // __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const tradeDualSlice: Slice<TradeDualStatus<IBData<R>>> = createSlice({
  name: "_router_tradeDual",
  initialState,
  reducers: {
    resetTradeDual(state) {
      state.tradeDual = initState;
    },
    updateTradeDual(
      state,
      action: PayloadAction<RequireOne<TradeDual<IBData<any>>, "market">>
    ) {
      const {
        type,
        market,
        isStoB,
        sellToken,
        buyToken,
        sellVol,
        buyVol,
        dualCalcData,
        fee,
        DualBalances,
        depositPrice,
        withdrawPrice,
        request,
        feeRaw,
        maxSellVol,
        maxFeeBips,
        miniSellVol,
      } = action.payload;
      if (market !== undefined && market !== state.tradeDual.market) {
        // @ts-ignore
        state.tradeDual = {
          ...initState,
          type: type ?? "LIDO",
          market,
          sellToken: sellToken as TokenInfo,
          buyToken: buyToken as TokenInfo,
        };
      }

      if (request) {
        state.tradeDual.request = request;
      }

      if (dualCalcData) {
        state.tradeDual.dualCalcData = dualCalcData;
      }
      if (isStoB) {
        state.tradeDual.isStoB = isStoB;
      }
      if (DualBalances) {
        state.tradeDual.DualBalances = DualBalances;
      }
      if (maxSellVol) {
        state.tradeDual.maxSellVol = maxSellVol;
      }
      if (maxFeeBips) {
        state.tradeDual.maxFeeBips = maxFeeBips;
      }
      if (miniSellVol) {
        state.tradeDual.miniSellVol = miniSellVol;
      }
      if (sellVol !== undefined) {
        state.tradeDual.sellVol = sellVol;
      }
      if (buyVol !== undefined) {
        state.tradeDual.buyVol = buyVol;
      }
      if (fee) {
        state.tradeDual.fee = fee;
      }
      if (feeRaw) {
        state.tradeDual.feeRaw = feeRaw;
      }
      if (depositPrice) {
        state.tradeDual.depositPrice = depositPrice;
      }
      if (withdrawPrice) {
        state.tradeDual.withdrawPrice = withdrawPrice;
      }
    },
  },
});
export { tradeDualSlice };
export const { updateTradeDual, resetTradeDual } = tradeDualSlice.actions;
