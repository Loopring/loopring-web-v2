import React from 'react';
import { useToast } from 'hooks/common/useToast';
import { IBData, MarketType, myLog } from '@loopring-web/common-resources';
import { LimitTradeData, TradeBaseType, TradeProType } from '@loopring-web/component-lib';
import { usePageTradePro } from '../../../../stores/router';
import { walletLayer2Service } from '../../../../services/socket';


export const useLimit = <C extends { [ key: string ]: any }>(market: MarketType): {
    [ key: string ]: any;
    // market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} => {
    const {pageTradePro} = usePageTradePro();
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {}
    const [limitTradeData, setLimitTradeData] = React.useState<LimitTradeData<IBData<any>>>(
        pageTradePro.market === market ? {
            base: {
                belong: baseSymbol,
                balance: walletMap ? walletMap[ baseSymbol as string ]?.count : 0,
            } as IBData<any>,
            quote: {
                belong: quoteSymbol,
                balance: walletMap ? walletMap[ quoteSymbol as string ]?.count : 0,
            } as IBData<any>,
            price: {belong: pageTradePro.tradeCalcProData.coinQuote, tradeValue: 0} as IBData<any>,
            type: TradeProType.sell
        } : {
            base: {belong: baseSymbol} as IBData<any>,
            quote: {belong: quoteSymbol} as IBData<any>,
            price: {belong: quoteSymbol, tradeValue: 0} as IBData<any>,
            type: TradeProType.sell
        }
    )
    const {toastOpen, setToastOpen, closeToast} = useToast();
    const limitSubmit = () => {
        walletLayer2Service.sendUserUpdate()
        return
    }
    const onChangeLimitEvent = async (tradeData: LimitTradeData<IBData<any>>, formType: TradeBaseType): Promise<void> => {
        myLog(`onChangeLimitEvent tradeData:`, tradeData, 'formType', formType)
        //TODO:
        setLimitTradeData(tradeData)
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