import { createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { PageTradePro, PageTradeProStatus } from "./interface";
import { TradeProType } from "@loopring-web/component-lib";
import { RequireOne } from "@loopring-web/common-resources";

const initState = {
  market: "" as any,
  tradePair: undefined,
  request: undefined,
  calcTradeParams: undefined,
  priceImpactObj: undefined,
  tradeCalcProData: {},
  tradeArray: [],
  tradeType: TradeProType.buy,
};

const initialState: PageTradeProStatus<{ [key: string]: any }> = {
  pageTradePro: initState,
  __DAYS__: 30,
  __API_REFRESH__: 15000,
  __SUBMIT_LOCK_TIMER__: 1000,
  __TOAST_AUTO_CLOSE_TIMER__: 3000,
  __AUTO_RECALC__: 3000,
};
const pageTradeProSlice: Slice<PageTradeProStatus<{ [key: string]: any }>> =
  createSlice({
    name: "_router_pageTradePro",
    initialState,
    reducers: {
      resetOrderPge(state) {
        state.pageTradePro = initState;
      },
      updatePageTradePro(
        state,
        action: PayloadAction<
          RequireOne<PageTradePro<{ [key: string]: any }>, "market">
        >
      ) {
        const {
          market,
          depth,
          depthForCalc,
          tradeType,
          precisionLevels,
          depthLevel,
          ticker,
          request,
          tradeCalcProData,
          ammPoolSnapshot,
          calcTradeParams,
          limitCalcTradeParams,
          priceImpactObj,
          feeBips,
          tradeArray,
          tradeMapByTimeStamp,
          totalFee,
          takerRate,
          chooseDepth,
          sellUserOrderInfo,
          buyUserOrderInfo,
          minOrderInfo,
          lastStepAt,
        } = action.payload;
        if (market !== state.pageTradePro.market) {
          state.pageTradePro = {
            ...initState,
            tradeType:
              state.pageTradePro.tradeType ?? tradeType ?? initState.tradeType,
            market,
            tradeCalcProData: tradeCalcProData ? tradeCalcProData : {},
            request,
            calcTradeParams,
            limitCalcTradeParams,
            depth,
            depthForCalc,
            ticker,
            ammPoolSnapshot,
            priceImpactObj,
            feeBips,
            totalFee,
            takerRate,
            tradeArray,
            chooseDepth,
            precisionLevels,
            depthLevel,
            sellUserOrderInfo,
            buyUserOrderInfo,
            minOrderInfo,
            lastStepAt: undefined,
          };
        } else {
          if (tradeType) {
            state.pageTradePro.tradeType = tradeType;
          }
          if (precisionLevels) {
            state.pageTradePro.precisionLevels = precisionLevels;
          }
          if (chooseDepth !== undefined) {
            state.pageTradePro.chooseDepth = chooseDepth;
          }
          if (depthLevel) {
            state.pageTradePro.depthLevel = depthLevel;
          }

          if (lastStepAt) {
            state.pageTradePro.lastStepAt = lastStepAt;
          }
          if (tradeCalcProData) {
            state.pageTradePro.tradeCalcProData = tradeCalcProData;
          }
          if (depth) {
            state.pageTradePro.depth = depth;
          }
          if (depthForCalc) {
            state.pageTradePro.depthForCalc = depthForCalc;
          }
          if (ticker) {
            state.pageTradePro.ticker = ticker;
          }

          if (ammPoolSnapshot) {
            state.pageTradePro.ammPoolSnapshot = ammPoolSnapshot;
          }

          if (request !== undefined) {
            state.pageTradePro.request = request;
          }

          if (calcTradeParams !== undefined) {
            state.pageTradePro.calcTradeParams = calcTradeParams;
          }

          if (limitCalcTradeParams !== undefined) {
            state.pageTradePro.limitCalcTradeParams = limitCalcTradeParams;
          }

          if (tradeArray) {
            state.pageTradePro.tradeArray = tradeArray;
          }
          if (tradeMapByTimeStamp) {
            state.pageTradePro.tradeMapByTimeStamp = tradeMapByTimeStamp;
          }
          if (priceImpactObj) {
            state.pageTradePro.priceImpactObj = priceImpactObj;
          }
          if (feeBips) {
            state.pageTradePro.feeBips = feeBips;
          }
          if (totalFee) {
            state.pageTradePro.totalFee = totalFee;
          }
          if (takerRate) {
            state.pageTradePro.takerRate = takerRate;
          }
          if (sellUserOrderInfo !== undefined) {
            state.pageTradePro.sellUserOrderInfo = sellUserOrderInfo;
          }
          if (buyUserOrderInfo !== undefined) {
            state.pageTradePro.buyUserOrderInfo = buyUserOrderInfo;
          }
          if (minOrderInfo !== undefined) {
            state.pageTradePro.minOrderInfo = minOrderInfo;
          }
        }
      },
    },
  });
export { pageTradeProSlice };
export const { updatePageTradePro } = pageTradeProSlice.actions;
