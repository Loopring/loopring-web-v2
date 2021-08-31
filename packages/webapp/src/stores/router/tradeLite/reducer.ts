import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { PageTradeLite } from './interface';
import * as sdk from 'loopring-sdk';
import { TradeChannel } from 'loopring-sdk';

const initialState: PageTradeLite = {
    market: undefined,
    tradePair: undefined,
    calcTradeParams: undefined,
    priceImpactObj: undefined,
    __SUBMIT_LOCK_TIMER__: 1000,
    __TOAST_AUTO_CLOSE_TIMER__: 3000,
};
const pageTradeLiteSlice: Slice<PageTradeLite> = createSlice({
    name: 'pageTradeLite',
    initialState,
    reducers: {
        updatePageTradeLite(state, action: PayloadAction<Partial<PageTradeLite>>) {
            const {
                market,
                depth,
                tickMap,
                ammPoolsBalance,
                tradePair,
                quoteMinAmtInfo,
                calcTradeParams,
                priceImpactObj,
                feeBips,
                totalFee,
                takerRate,
                buyMinAmtInfo,
                sellMinAmtInfo
            } = action.payload;
            if (market !== state.market) {
                state = {
                    market,
                    tradePair,  //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
                    calcTradeParams,
                    depth,
                    tickMap,
                    ammPoolsBalance,
                    priceImpactObj,
                    tradeChannel: calcTradeParams ? (calcTradeParams.exceedDepth ? TradeChannel.BLANK : sdk.TradeChannel.MIXED) : undefined,
                    orderType: calcTradeParams ? (calcTradeParams.exceedDepth ? sdk.OrderType.ClassAmm : sdk.OrderType.TakerOnly) : undefined,
                    feeBips,
                    totalFee,
                    takerRate,
                    quoteMinAmtInfo,
                    buyMinAmtInfo,
                    sellMinAmtInfo,
                    __SUBMIT_LOCK_TIMER__: 1000,
                    __TOAST_AUTO_CLOSE_TIMER__: 3000,
                }

            } else {
                if (depth) {
                    state.depth = depth;
                }
                if (tickMap) {
                    state.tickMap = tickMap;
                }
                if (ammPoolsBalance) {
                    state.ammPoolsBalance = ammPoolsBalance;
                }
                if (tradePair) {
                    state.tradePair = tradePair;
                }
                if (calcTradeParams) {
                    state.calcTradeParams = calcTradeParams;
                    state.orderType = calcTradeParams.exceedDepth ? sdk.OrderType.ClassAmm : sdk.OrderType.TakerOnly
                    state.tradeChannel = calcTradeParams.exceedDepth ? TradeChannel.BLANK : sdk.TradeChannel.MIXED
                }
                if (priceImpactObj) {
                    state.priceImpactObj = priceImpactObj;
                }
                if (feeBips) {
                    state.feeBips = feeBips;
                }
                if (totalFee) {
                    state.totalFee = totalFee;
                }
                if (takerRate) {
                    state.takerRate = takerRate;
                }
                if (sellMinAmtInfo) {
                    state.sellMinAmtInfo = sellMinAmtInfo;
                }
                if (buyMinAmtInfo) {
                    state.buyMinAmtInfo = buyMinAmtInfo;
                }

            }


        },


    },
});
export { pageTradeLiteSlice };
export const {updatePageTradeLite} = pageTradeLiteSlice.actions;