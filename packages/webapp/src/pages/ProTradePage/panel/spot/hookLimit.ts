import React from 'react';
import { useToast } from 'hooks/common/useToast';
import { IBData, MarketType, myLog } from '@loopring-web/common-resources';
import { LimitTradeData, TradeBaseType, TradeBtnStatus, TradeProType } from '@loopring-web/component-lib';
import { usePageTradePro } from 'stores/router';
import { walletLayer2Service } from 'services/socket';
import { useSubmitBtn } from './hookBtn';
import { usePlaceOrder } from 'hooks/common/useTrade';
import { useTokenMap } from 'stores/token';
import { useTranslation } from 'react-i18next';
import store from 'stores';


export const useLimit = <C extends { [ key: string ]: any }>(market: MarketType): {
    [ key: string ]: any;
    // market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} => {
    const {
        pageTradePro,
        updatePageTradePro,
        // __DAYS__,
        // __SUBMIT_LOCK_TIMER__,
        // __TOAST_AUTO_CLOSE_TIMER__
    } = usePageTradePro();
    const {marketMap} = useTokenMap();
    const {t} = useTranslation('common');
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {};
    const marketPrecision = marketMap[ market ].precisionForPrice;
    const [limitTradeData, setLimitTradeData] = React.useState<LimitTradeData<IBData<any>>>(
        {
            base: {
                belong: baseSymbol,
                balance: walletMap ? walletMap[ baseSymbol as string ]?.count : 0,
            } as IBData<any>,
            quote: {
                belong: quoteSymbol,
                balance: walletMap ? walletMap[ quoteSymbol as string ]?.count : 0,
            } as IBData<any>,
            price: {
                belong: pageTradePro.tradeCalcProData.coinQuote,
                tradeValue: (pageTradePro.market === market && pageTradePro.ticker)?pageTradePro.ticker.close:0
            } as IBData<any>,
            type: TradeProType.buy
        }
    )
    const [isLimitLoading, setIsLimitLoading] = React.useState(false)

    const {toastOpen, setToastOpen, closeToast} = useToast();

    React.useEffect(() => {
        resetTradeData(limitTradeData.type)
    }, [pageTradePro.market,
        pageTradePro.tradeCalcProData.walletMap])

    React.useEffect(() => {
        // resetTradeData(limitTradeData.type)
        if(pageTradePro.defaultPrice){
            setLimitTradeData((state) => {
                return {
                    ...state,
                    price: {
                        ...state.price,
                        tradeValue: pageTradePro.defaultPrice? pageTradePro.defaultPrice: (pageTradePro.market === market && pageTradePro.ticker)?pageTradePro.ticker.close:0
                    } as IBData<any>,
                }
            })
        }

    }, [pageTradePro.defaultPrice])

    const resetTradeData = React.useCallback((type: TradeProType) => {
        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
        const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {};
        // const marketPrecision =  marketMap[market].precisionForPrice;
        // @ts-ignore
        const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
        setLimitTradeData((state) => {
           return  {
                ...state,
                type,
                base: {
                    belong: baseSymbol,
                    balance: walletMap ? walletMap[ baseSymbol as string ]?.count : 0,
                } as IBData<any>,
                quote: {
                    belong: quoteSymbol,
                    balance: walletMap ? walletMap[ quoteSymbol as string ]?.count : 0,
                } as IBData<any>,
                price: {
                    belong: quoteSymbol,
                    tradeValue: (pageTradePro.market === market && pageTradePro.ticker)?pageTradePro.ticker.close:0
                } as IBData<any>,
            }
        });
        updatePageTradePro({market,defaultPrice:undefined})
    }, [pageTradePro, marketPrecision, market])

    const limitSubmit = () => {
        walletLayer2Service.sendUserUpdate()
        return
    }

    const {makeLimitReqInHook} = usePlaceOrder()

    const onChangeLimitEvent = React.useCallback((tradeData: LimitTradeData<IBData<any>>, formType: TradeBaseType) => {
        // myLog(`onChangeLimitEvent tradeData:`, tradeData, 'formType', formType)

        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro

        if (formType === TradeBaseType.tab) {
            resetTradeData(tradeData.type)
        } else {

            // {isBuy, price, amountB or amountS, (base, quote / market), feeBips, takerRate, }

            let amountBase = formType === TradeBaseType.base ? tradeData.base.tradeValue : undefined
            let amountQuote = formType === TradeBaseType.quote ? tradeData.quote.tradeValue : undefined

            if (formType === TradeBaseType.price) {
                amountBase = tradeData.base.tradeValue !== undefined ? tradeData.base.tradeValue : undefined
                amountQuote = amountBase !== undefined ? undefined : tradeData.quote.tradeValue !== undefined ? tradeData.quote.tradeValue : undefined
            }

            myLog(`tradeData price:${tradeData.price.tradeValue}`, tradeData.type,amountBase,amountQuote)

            const request = makeLimitReqInHook({
                isBuy: tradeData.type === 'buy',
                base: tradeData.base.belong,
                quote: tradeData.quote.belong,
                price: tradeData.price.tradeValue as number,
                depth: pageTradePro.depth,
                amountBase,
                amountQuote,
            })

            // myLog('limitRequest:', request)
            //TODO: fee update
            updatePageTradePro({market,
                request: request?.limitRequest,
                limitCalcTradeParams: request?.calcTradeParams,
                tradeCalcProData: {
                    ...pageTradePro.tradeCalcProData,
                    fee: 'TODO'
                }
            })
            setLimitTradeData((state) => {
                return  {
                    ...state,
                    price:{
                        ...state.price,
                        tradeValue:tradeData.price.tradeValue
                    },
                    base:{
                        ...state.base,
                        tradeValue:request?.calcTradeParams.baseVolShow  as number
                    },
                    quote:{
                        ...state.base,
                        tradeValue:request?.calcTradeParams.quoteVolShow  as number
                    }
                }
            })
        }
        // if (formType === TradeBaseType.slippage) {
        //     return
        // }


    }, [setLimitTradeData])

    const handlePriceError = React.useCallback((data: IBData<any>): { error: boolean, message?: string | React.ElementType<HTMLElement> } | undefined => {

        const tradeValue = data.tradeValue
        if (tradeValue) {
            const [, precision] = tradeValue.toString().split('.');
            if (precision && precision.length > marketMap[ market ].precisionForPrice) {
                return {
                    error: true,
                    message: t('labelErrorPricePrecisionLimit', {
                        symbol: data.belong,
                        decimal: marketMap[ market ].precisionForPrice
                    })
                    //labelErrorPricePrecisionLimit:'{{symbol}} price only {{decimal}} decimals allowed',
                    //labelErrorPricePrecisionLimit:'限价 {{symbol}}，最多可保留小数点后 {{decimal} 位'

                }
            }
            return undefined
        } else {
            return undefined
        }


    }, [])
    const {
        btnStatus: tradeLimitBtnStatus,
        onBtnClick: limitBtnClick,
        btnLabel: tradeLimitI18nKey,
        btnStyle: tradeLimitBtnStyle
    } = useSubmitBtn({
        availableTradeCheck: () => {
            return {label: '', tradeBtnStatus: TradeBtnStatus.AVAILABLE}
        },
        isLoading: isLimitLoading,
        submitCallback: limitSubmit
    })
    return {
        // alertOpen,
        // confirmOpen,
        toastOpen,
        closeToast,
        // limitSubmit,
        isLimitLoading: false,
        limitTradeData,
        onChangeLimitEvent,
        tradeLimitI18nKey,
        tradeLimitBtnStatus,
        limitBtnClick,
        handlePriceError,
        tradeLimitBtnStyle,
        // marketTicker,
    }
}