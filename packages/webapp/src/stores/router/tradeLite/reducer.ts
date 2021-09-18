import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PageTradeLite, PageTradeLiteStatus } from './interface';
import * as sdk from 'loopring-sdk';
import { TradeChannel } from 'loopring-sdk';

const initState = {
    market: undefined,
    tradePair: undefined,
    calcTradeParams: undefined,
    priceImpactObj: undefined,
}

const initialState: PageTradeLiteStatus = {
    pageTradeLite: initState,
    __DAYS__:30,
    __SUBMIT_LOCK_TIMER__: 1000,
    __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const pageTradeLiteSlice: Slice<PageTradeLiteStatus> = createSlice({
    name: '_router_pageTradeLite',
    initialState,
    reducers: {
        resetSwap(state) {
            state.pageTradeLite = initState
        },
        updatePageTradeLite(state, action: PayloadAction<Partial<PageTradeLite>>) {
            const {
                market,
                depth,
                tickerMap,
                ammPoolSnapshot,
                tradePair,
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
            if (market !== state.pageTradeLite.market) {
                state.pageTradeLite = {
                    market,
                    tradePair,  //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
                    calcTradeParams,
                    depth,
                    tickerMap,
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
                    state.pageTradeLite.lastStepAt = lastStepAt;
                }
                if (tradePair) {
                    state.pageTradeLite.tradePair = tradePair;
                    state.pageTradeLite.lastStepAt = undefined
                }
                if (depth) {
                    state.pageTradeLite.depth = depth;
                }

                if (tickerMap) {
                    state.pageTradeLite.tickerMap = tickerMap;
                }
                if (ammPoolSnapshot) {
                    state.pageTradeLite.ammPoolSnapshot = ammPoolSnapshot;
                }
                if (calcTradeParams) {
                    state.pageTradeLite.calcTradeParams = calcTradeParams;
                    state.pageTradeLite.orderType = calcTradeParams.exceedDepth ? sdk.OrderType.ClassAmm : sdk.OrderType.TakerOnly
                    state.pageTradeLite.tradeChannel = calcTradeParams.exceedDepth ? TradeChannel.BLANK : sdk.TradeChannel.MIXED
                }
                if (priceImpactObj) {
                    state.pageTradeLite.priceImpactObj = priceImpactObj;
                }
                if (feeBips) {
                    state.pageTradeLite.feeBips = feeBips;
                }
                if (totalFee) {
                    state.pageTradeLite.totalFee = totalFee;
                }
                if (takerRate) {
                    state.pageTradeLite.takerRate = takerRate;
                }
                if (sellMinAmtInfo) {
                    state.pageTradeLite.sellMinAmtInfo = sellMinAmtInfo;
                }
                if (buyMinAmtInfo) {
                    state.pageTradeLite.buyMinAmtInfo = buyMinAmtInfo;
                }

            }


        },




    },
});
export { pageTradeLiteSlice };
export const {updatePageTradeLite, resetSwap, } = pageTradeLiteSlice.actions;