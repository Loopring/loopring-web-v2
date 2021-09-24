import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PageTradePro, PageTradeProStatus } from './interface';
import { TradeProType } from '@loopring-web/component-lib';

const initState = {
    market: undefined,
    tradePair: undefined,
    request: undefined,
    calcTradeParams: undefined,
    priceImpactObj: undefined,
    tradeCalcProData: {},
    tradeArray:[],
    tradeType:TradeProType.buy,
}

const initialState: PageTradeProStatus<{ [ key: string ]: any }> = {
    pageTradePro: initState,
    __DAYS__:30,
    __API_REFRESH__:15000,
    __SUBMIT_LOCK_TIMER__: 1000,
    __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const pageTradeProSlice: Slice<PageTradeProStatus<{ [ key: string ]: any }>> = createSlice({
    name: '_router_pageTradePro',
    initialState,
    reducers: {
        resetOrderPge(state) {
            state.pageTradePro = initState
        },
        updatePageTradePro(state, action: PayloadAction<Partial<PageTradePro<{ [ key: string ]: any }>>>) {
            const {
                market,
                depth,
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
                totalFee,
                takerRate,
                defaultPrice,
                baseMinAmtInfo,
                quoteMinAmtInfo,
                lastStepAt
            } = action.payload;
            if (market !== state.pageTradePro.market) {
                state.pageTradePro = {
                    ...initState,
                    tradeType:state.pageTradePro.tradeType??tradeType??initState.tradeType,
                    market,
                    tradeCalcProData:tradeCalcProData?tradeCalcProData:{},
                    request,
                    calcTradeParams,
                    limitCalcTradeParams,
                    depth,
                    ticker,
                    ammPoolSnapshot,
                    priceImpactObj,
                    feeBips,
                    totalFee,
                    takerRate,
                    baseMinAmtInfo,
                    quoteMinAmtInfo,
                    tradeArray,
                    defaultPrice,
                    precisionLevels,
                    depthLevel,
                    lastStepAt:undefined,
                }

            } else {
                if(tradeType){
                    state.pageTradePro.tradeType = tradeType
                }
                if(precisionLevels){
                    state.pageTradePro.precisionLevels = precisionLevels
                }
                if(defaultPrice){
                    state.pageTradePro.defaultPrice = defaultPrice
                }
                if(depthLevel){
                    state.pageTradePro.depthLevel = depthLevel
                }

                if(lastStepAt){
                    state.pageTradePro.lastStepAt = lastStepAt;
                }
                if (tradeCalcProData) {
                    state.pageTradePro.tradeCalcProData = tradeCalcProData;
                }
                if (depth) {
                    state.pageTradePro.depth = depth;
                }

                if (ticker) {
                    state.pageTradePro.ticker = ticker;
                }

                if (ammPoolSnapshot) {
                    state.pageTradePro.ammPoolSnapshot = ammPoolSnapshot;
                }

                if (request) {
                    state.pageTradePro.request = request
                }

                if (calcTradeParams !== undefined) {
                    state.pageTradePro.calcTradeParams = calcTradeParams;
                }

                if (limitCalcTradeParams !== undefined) {
                    state.pageTradePro.limitCalcTradeParams = limitCalcTradeParams;
                }
                
                if(tradeArray){
                    state.pageTradePro.tradeArray= tradeArray;
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
                if (baseMinAmtInfo) {
                    state.pageTradePro.baseMinAmtInfo = baseMinAmtInfo;
                }
                if (quoteMinAmtInfo) {
                    state.pageTradePro.quoteMinAmtInfo = quoteMinAmtInfo;
                }

            }


        },




    },
});
export { pageTradeProSlice };
export const {updatePageTradePro } = pageTradeProSlice.actions;