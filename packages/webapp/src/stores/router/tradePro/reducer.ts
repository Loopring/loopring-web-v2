import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PageTradePro, PageTradeProStatus } from './interface';
import * as sdk from 'loopring-sdk';
import { TradeChannel } from 'loopring-sdk';

const initState = {
    market: undefined,
    tradePair: undefined,
    calcTradeParams: undefined,
    priceImpactObj: undefined,
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
                tickMap,
                ammPoolSnapshot,
                quoteMinAmtInfo,
                calcTradeParams,
                priceImpactObj,
                feeBips,
                totalFee,
                takerRate,
                buyMinAmtInfo,
                sellMinAmtInfo,
                lastStepAt
            } = action.payload;
            if (market !== state.pageTradePro.market) {
                state.pageTradePro = {
                    market,
                    calcTradeParams,
                    depth,
                    tickMap,
                    ammPoolSnapshot,
                    priceImpactObj,
                    tradeChannel: calcTradeParams ? (calcTradeParams.exceedDepth ? TradeChannel.BLANK : sdk.TradeChannel.MIXED) : undefined,
                    orderType: calcTradeParams ? (calcTradeParams.exceedDepth ? sdk.OrderType.ClassAmm : sdk.OrderType.TakerOnly) : undefined,
                    feeBips,
                    totalFee,
                    takerRate,
                    quoteMinAmtInfo,
                    buyMinAmtInfo,
                    sellMinAmtInfo,
                    lastStepAt:undefined,
                }

            } else {
                if(lastStepAt){
                    state.pageTradePro.lastStepAt = lastStepAt;
                }
                // if (tradePair) {
                //     state.pageTradePro.tradePair = tradePair;
                //     state.pageTradePro.lastStepAt = undefined
                // }
                if (depth) {
                    state.pageTradePro.depth = depth;
                }

                if (tickMap) {
                    state.pageTradePro.tickMap = tickMap;
                }
                if (ammPoolSnapshot) {
                    state.pageTradePro.ammPoolSnapshot = ammPoolSnapshot;
                }
                if (calcTradeParams) {
                    state.pageTradePro.calcTradeParams = calcTradeParams;
                    state.pageTradePro.orderType = calcTradeParams.exceedDepth ? sdk.OrderType.ClassAmm : sdk.OrderType.TakerOnly
                    state.pageTradePro.tradeChannel = calcTradeParams.exceedDepth ? TradeChannel.BLANK : sdk.TradeChannel.MIXED
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
                if (sellMinAmtInfo) {
                    state.pageTradePro.sellMinAmtInfo = sellMinAmtInfo;
                }
                if (buyMinAmtInfo) {
                    state.pageTradePro.buyMinAmtInfo = buyMinAmtInfo;
                }

            }


        },




    },
});
export { pageTradeProSlice };
export const {updatePageTradePro } = pageTradeProSlice.actions;