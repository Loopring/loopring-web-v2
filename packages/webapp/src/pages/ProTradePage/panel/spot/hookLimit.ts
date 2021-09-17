import React from 'react';
import { useToast } from 'hooks/common/useToast';
import { IBData, MarketType, myLog } from '@loopring-web/common-resources';
import { LimitTradeData, TradeBaseType, TradeBtnStatus, TradeProType } from '@loopring-web/component-lib';
import { usePageTradePro } from 'stores/router';
import { walletLayer2Service } from 'services/socket';
import { useSubmitBtn } from './hookBtn';
import { usePlaceOrder } from 'pages/SwapPage/swap_hook';


export const useLimit = <C extends { [ key: string ]: any }>(market: MarketType): {
    [ key: string ]: any;
    // market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} => {
    const {pageTradePro} = usePageTradePro();
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {};
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
            price: {belong: pageTradePro.tradeCalcProData.coinQuote, tradeValue: pageTradePro.depth?.mid_price??''} as IBData<any>,
            type: TradeProType.sell
        } : {
            base: {belong: baseSymbol} as IBData<any>,
            quote: {belong: quoteSymbol} as IBData<any>,
            price: {belong: quoteSymbol, tradeValue: pageTradePro.depth?.mid_price} as IBData<any>,
            type: TradeProType.sell
        }
    )

    const {toastOpen, setToastOpen, closeToast} = useToast();

    React.useEffect(()=>{
        resetTradeData(limitTradeData.type)
    },[ pageTradePro.market,
        pageTradePro.tradeCalcProData.walletMap])

    const resetTradeData = React.useCallback((type:TradeProType)=>{
        const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {};
        // @ts-ignore
        const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
        setLimitTradeData( (state)=>{
            return pageTradePro.market === market ?{
                type,
                base: {
                    belong: baseSymbol,
                    balance: walletMap ? walletMap[ baseSymbol as string ]?.count : 0,
                } as IBData<any>,
                quote: {
                    belong: quoteSymbol,
                    balance: walletMap ? walletMap[ quoteSymbol as string ]?.count : 0,
                } as IBData<any>,
                price: {belong: quoteSymbol, tradeValue: pageTradePro.depth?.mid_price} as IBData<any>,
            } : {
                type,
                base: {belong: baseSymbol} as IBData<any>,
                quote: {belong: quoteSymbol} as IBData<any>,
                price: {belong: quoteSymbol, tradeValue: 0} as IBData<any>,
            }
        })
    },[pageTradePro,market])

    const limitSubmit = () => {
        walletLayer2Service.sendUserUpdate()
        return
    }

    const { makelimitReqInHook } = usePlaceOrder()

    const onChangeLimitEvent = React.useCallback(async (tradeData: LimitTradeData<IBData<any>>, formType: TradeBaseType): Promise<void> => {
        myLog(`onChangeLimitEvent tradeData:`, tradeData, 'formType', formType)

        if (formType === TradeBaseType.slippage) {
            return
        }
        
        setLimitTradeData(tradeData)
        // {isBuy, price, amountB or amountS, (base, quote / market), feeBips, takerRate, }

        let amountBase = formType === TradeBaseType.base ? tradeData.base.tradeValue : undefined
        let amountQuote = formType === TradeBaseType.quote ? tradeData.quote.tradeValue : undefined

        if (formType === TradeBaseType.price) {
            amountBase = tradeData.base.tradeValue !== undefined ? tradeData.base.tradeValue : undefined
            amountQuote = amountBase !== undefined ? undefined : tradeData.quote.tradeValue !== undefined ? tradeData.quote.tradeValue : undefined
        }

        const request = makelimitReqInHook({
            isBuy: tradeData.type === 'buy',
            base: tradeData.base.belong,
            quote: tradeData.quote.belong,
            price: tradeData.price.tradeValue as number,
            amountBase,
            amountQuote,
        })

        myLog('limitRequest:', request?.limitRequest)

        // myLog('handleSwapPanelEvent...')

        // const {tradeData} = swapData
        // resetSwap(swapType, tradeData)

    } ,[setLimitTradeData])

    const {
        btnStatus:tradeLimitBtnStatus ,
        onBtnClick:limitBtnClick,
        btnLabel:tradeLimitI18nKey,
        // btnClickCallbackArray
    } =  useSubmitBtn({
        availableTradeCheck: ()=> {return  {label:'', tradeBtnStatus: TradeBtnStatus.AVAILABLE}},
        isLoading:true,
        submitCallback: limitSubmit
    })
    return {
        // alertOpen,
        // confirmOpen,
        toastOpen,
        closeToast,
        // limitSubmit,
        isLimitLoading:false,
        limitTradeData,
        onChangeLimitEvent,
        tradeLimitI18nKey,
        tradeLimitBtnStatus,
        limitBtnClick,
        // marketTicker,
    }
}