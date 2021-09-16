import React from 'react';
import { useToast } from 'hooks/common/useToast';
import { IBData, MarketType } from '@loopring-web/common-resources';
import { LimitTradeData, MarketTradeData, TradeBaseType, TradeProType } from '@loopring-web/component-lib';


export const useLimit = <C extends { [ key: string ]: any }>(market:MarketType):{
     [key: string]: any;
    // market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} =>{
    const limitTradeData:LimitTradeData<IBData<any>> = {
        sell: {belong: 'ETH'} as IBData<any>,
        buy: {belong: 'LRC'} as IBData<any>,
        price: {count: 0},
        type: TradeProType.sell
    }
    const {toastOpen, setToastOpen, closeToast} = useToast();
    const limitSubmit = ()=> {
        return
    }
    const onChangeLimitEvent  = async (tradeData: LimitTradeData<IBData<any>>, formType: TradeBaseType): Promise<void> => {

        // myLog('handleSwapPanelEvent...')

        // const {tradeData} = swapData
        // resetSwap(swapType, tradeData)

    }
    return {
        // alertOpen,
        // confirmOpen,
        toastOpen,
        closeToast,
        limitSubmit,
        limitTradeData,
        onChangeLimitEvent
        // marketTicker,
    }
}