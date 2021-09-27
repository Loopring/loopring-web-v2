import React from 'react';
import { useToast } from 'hooks/common/useToast';
import { AccountStatus, IBData, MarketType, myLog, } from '@loopring-web/common-resources';
import {
    LimitTradeData,
    TradeBaseType,
    TradeBtnStatus,
    TradeProType,
    useOpenModals, useSettings
} from '@loopring-web/component-lib';
import { usePageTradePro } from 'stores/router';
import { walletLayer2Service } from 'services/socket';
import { useSubmitBtn } from './hookBtn';
import { getPriceImpactInfo, PriceLevel, usePlaceOrder } from 'hooks/common/useTrade';
import { useTokenMap } from 'stores/token';
import { useTranslation } from 'react-i18next';
import store from 'stores';
import * as sdk from 'loopring-sdk';
import { Currency } from 'loopring-sdk';
import { LoopringAPI } from 'api_wrapper';
import * as _ from 'lodash'
import { BIGO } from 'defs/common_defs';
import { VolToNumberWithPrecision } from '../../../../utils/formatter_tool';
import { useTokenPrices } from '../../../../stores/tokenPrices';
import { useSystem } from '../../../../stores/system';

export const useLimit = <C extends { [ key: string ]: any }>(market: MarketType) => {
    const {
        pageTradePro,
        updatePageTradePro,
        // __DAYS__,
        __SUBMIT_LOCK_TIMER__,
        // __TOAST_AUTO_CLOSE_TIMER__
    } = usePageTradePro();
    const {marketMap} = useTokenMap();
    const {tokenPrices} = useTokenPrices();
    const {forex} = useSystem()
    const {currency} = useSettings()

    const {t} = useTranslation('common');

    const [alertOpen, setAlertOpen] = React.useState<boolean>(false);

    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {};
    const marketPrecision = marketMap[ market ].precisionForPrice;
    const {setShowSupport} = useOpenModals()
    const tradePrice = (pageTradePro.market === market && pageTradePro.ticker) ? pageTradePro.ticker.close ? pageTradePro.ticker.close.toFixed(marketPrecision) : pageTradePro?.depth?.mid_price.toFixed(marketPrecision) : 0
    let balance = tradePrice && tokenPrices && (Number(tradePrice) * tokenPrices[ quoteSymbol as string ])
    if (balance && currency === Currency.cny) {
        balance = Number(balance) / forex;
    }
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
                tradeValue: tradePrice,
                balance: balance
            } as IBData<any>,
            type: pageTradePro.tradeType ?? TradeProType.buy
        }
    )
    const [isLimitLoading, setIsLimitLoading] = React.useState(false)

    const {toastOpen, setToastOpen, closeToast} = useToast();

    React.useEffect(() => {
        resetTradeData(pageTradePro.tradeType)
    }, [pageTradePro.market,
        pageTradePro.tradeCalcProData.walletMap])

    React.useEffect(() => {
        if (pageTradePro.defaultPrice) {
            setLimitTradeData((state) => {
                const tradePrice = pageTradePro.defaultPrice ? pageTradePro.defaultPrice : (pageTradePro.market === market && pageTradePro.ticker) ? pageTradePro.ticker.close ? pageTradePro.ticker.close.toFixed(marketPrecision) : pageTradePro?.depth?.mid_price.toFixed(marketPrecision) : 0;
                let balance = tradePrice && tokenPrices && (Number(tradePrice) * tokenPrices[ quoteSymbol as string ])
                if (balance && currency === Currency.cny) {
                    balance = Number(balance) / forex;
                }
                return {
                    ...state,
                    price: {
                        ...state.price,
                        tradeValue: tradePrice,
                        balance
                    } as IBData<any>,
                }
            })
        }

    }, [pageTradePro.defaultPrice,currency,forex])

    const resetTradeData = React.useCallback((type?: TradeProType) => {
        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
        const walletMap = pageTradePro.tradeCalcProData.walletMap ?? {};
        // const marketPrecision =  marketMap[market].precisionForPrice;
        // @ts-ignore
        const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);

        setLimitTradeData((state) => {
            const tradePrice = (pageTradePro.market === market && pageTradePro.ticker) ?
                pageTradePro.ticker.close ? pageTradePro.ticker.close.toFixed(marketPrecision) : pageTradePro?.depth?.mid_price.toFixed(marketPrecision) : 0
            let balance = tradePrice && tokenPrices && (Number(tradePrice) * tokenPrices[ quoteSymbol as string ])
            if (balance && currency === Currency.cny) {
                balance = Number(balance) / forex;
            }
            return {
                ...state,
                type: type ?? pageTradePro.tradeType,
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
                    tradeValue: tradePrice,
                    balance: balance
                } as IBData<any>,
            }
        });

        updatePageTradePro({
            market,
            minOrderInfo: null,
            sellUserOrderInfo: null,
            buyUserOrderInfo: null,
            request: null,
            calcTradeParams: null,
            limitCalcTradeParams: null,
            defaultPrice: undefined,
            tradeCalcProData: {
                ...pageTradePro.tradeCalcProData,
                fee: undefined,
                minimumReceived: undefined,
                priceImpact: undefined,
                priceImpactColor: 'inherit',

            }
        })
    }, [pageTradePro, marketPrecision, market, currency, forex])

    const limitSubmit = React.useCallback(async (event: MouseEvent, isAgree?: boolean) => {
        myLog('limitSubmit:', event, isAgree)

        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
        const {limitCalcTradeParams, request, tradeCalcProData} = pageTradePro;

        setAlertOpen(false)

        if (isAgree && LoopringAPI.userAPI && request) {
            try {

                //TODO maker order
                myLog('try to submit order', limitCalcTradeParams, tradeCalcProData)

                const account = store.getState().account

                const req: sdk.GetNextStorageIdRequest = {
                    accountId: account.accountId,
                    sellTokenId: request.sellToken.tokenId as number
                }

                const storageId = await LoopringAPI.userAPI.getNextStorageId(req, account.apiKey)

                const requestClone = _.cloneDeep(request)
                requestClone.storageId = storageId.orderId

                myLog(requestClone)

                const response = await LoopringAPI.userAPI.submitOrder(requestClone, account.eddsaKey.sk, account.apiKey)

                myLog(response)

                if (!response?.hash) {
                    setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                    myLog(response?.resultInfo)
                } else {
                    await sdk.sleep(__SUBMIT_LOCK_TIMER__)

                    const resp = await LoopringAPI.userAPI.getOrderDetails({
                        accountId: account.accountId,
                        orderHash: response.hash
                    }, account.apiKey)

                    myLog('-----> resp:', resp)

                    if (resp.orderDetail?.status !== undefined) {
                        myLog('resp.orderDetail:', resp.orderDetail)
                        switch (resp.orderDetail?.status) {
                            case sdk.OrderStatus.cancelled:
                                const baseAmount = sdk.toBig(resp.orderDetail.volumes.baseAmount)
                                const baseFilled = sdk.toBig(resp.orderDetail.volumes.baseFilled)
                                const quoteAmount = sdk.toBig(resp.orderDetail.volumes.quoteAmount)
                                const quoteFilled = sdk.toBig(resp.orderDetail.volumes.quoteFilled)
                                const percentage1 = baseAmount.eq(BIGO) ? 0 : baseFilled.div(baseAmount).toNumber()
                                const percentage2 = quoteAmount.eq(BIGO) ? 0 : quoteFilled.div(quoteAmount).toNumber()
                                myLog('percentage1:', percentage1, ' percentage2:', percentage2)
                                if (percentage1 === 0 || percentage2 === 0) {
                                    setToastOpen({open: true, type: 'warning', content: t('labelSwapCancelled')})
                                } else {
                                    setToastOpen({open: true, type: 'success', content: t('labelSwapSuccess')})
                                }
                                break
                            case sdk.OrderStatus.processed:
                                setToastOpen({open: true, type: 'success', content: t('labelSwapSuccess')})
                                break
                            default:
                                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})
                        }
                    }

                    walletLayer2Service.sendUserUpdate()
                }

                resetTradeData()

                setIsLimitLoading(false)
            } catch (reason) {
                sdk.dumpError400(reason)
                setToastOpen({open: true, type: 'error', content: t('labelSwapFailed')})

            }
            setIsLimitLoading(false)
        } else {
            setIsLimitLoading(false)
        }
    }, [])

    const {makeLimitReqInHook} = usePlaceOrder()
    const onChangeLimitEvent = React.useCallback((tradeData: LimitTradeData<IBData<any>>, formType: TradeBaseType) => {
        // myLog(`onChangeLimitEvent tradeData:`, tradeData, 'formType', formType)

        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro

        if (formType === TradeBaseType.tab) {
            resetTradeData(tradeData.type)
            updatePageTradePro({market, tradeType: tradeData.type})
        } else {

            // {isBuy, price, amountB or amountS, (base, quote / market), feeBips, takerRate, }

            let amountBase = formType === TradeBaseType.base ? tradeData.base.tradeValue : undefined
            let amountQuote = formType === TradeBaseType.quote ? tradeData.quote.tradeValue : undefined

            if (formType === TradeBaseType.price) {
                amountBase = tradeData.base.tradeValue !== undefined ? tradeData.base.tradeValue : undefined
                amountQuote = amountBase !== undefined ? undefined : tradeData.quote.tradeValue !== undefined ? tradeData.quote.tradeValue : undefined
            }

            // myLog(`tradeData price:${tradeData.price.tradeValue}`, tradeData.type, amountBase, amountQuote)

            const {limitRequest, calcTradeParams, sellUserOrderInfo, buyUserOrderInfo, minOrderInfo, } = makeLimitReqInHook({
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
            updatePageTradePro({
                market,
                sellUserOrderInfo,
                buyUserOrderInfo,
                minOrderInfo,
                request: limitRequest as sdk.SubmitOrderRequestV3,
                limitCalcTradeParams: calcTradeParams,
                tradeCalcProData: {
                    ...pageTradePro.tradeCalcProData,
                    fee: calcTradeParams && calcTradeParams.maxFeeBips ? calcTradeParams.maxFeeBips.toString() : undefined,
                }
            })
            setLimitTradeData((state) => {
                const tradePrice = tradeData.price.tradeValue;
                let balance = tradePrice && tokenPrices && (Number(tradePrice) * tokenPrices[ quoteSymbol as string ])
                if (balance && currency === Currency.cny) {
                    balance = Number(balance) / forex;
                }
                return {
                    ...state,
                    price: {
                        belong: quoteSymbol,
                        tradeValue: tradePrice,
                        balance: balance,
                    } as IBData<any>,
                    base: {
                        ...state.base,
                        tradeValue: calcTradeParams?.baseVolShow as number
                    },
                    quote: {
                        ...state.quote,
                        tradeValue: calcTradeParams?.quoteVolShow as number
                    }

                }
            })
        }
        // if (formType === TradeBaseType.slippage) {
        //     return
        // }


    }, [setLimitTradeData,currency, forex])
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

    const onSubmitBtnClick = React.useCallback(async () => {
        setIsLimitLoading(true);
        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
        const {priceLevel} = getPriceImpactInfo(pageTradePro.limitCalcTradeParams, false)

        const isIpValid = true

        myLog('---- onSubmitBtnClick priceLevel:', priceLevel)

        //TODO: pending on checkIpValid API
        if (!isIpValid) {
            setShowSupport({isShow: true})
            setIsLimitLoading(false)
        } else {
            switch (priceLevel) {
                case PriceLevel.Lv1:
                    setAlertOpen(true)
                    break
                default:
                    limitSubmit(undefined as any, true);
                    break
            }
        }
    }, [])
    const availableTradeCheck = React.useCallback((): { tradeBtnStatus: TradeBtnStatus, label: string } => {
        const account = store.getState().account;
        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
        const {
            minOrderInfo,
        } = pageTradePro;
        if (account.readyState === AccountStatus.ACTIVATED) {
            // const type = limitTradeData.type === TradeProType.sell ? 'quote' : 'base';
            if (limitTradeData?.base.tradeValue === undefined
                || limitTradeData?.quote.tradeValue === undefined
                || limitTradeData?.base.tradeValue === 0
                || limitTradeData?.quote.tradeValue === 0) {
                return {tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelEnterAmount'}
            } else if (minOrderInfo?.minAmtCheck || minOrderInfo?.minAmtShow === undefined) {
                return {tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: ''}     // label: ''}
            } else {
                //todo
                const symbol: string = limitTradeData[ 'base' ].belong;
                const minOrderSize = `${minOrderInfo?.minAmtShow} ${minOrderInfo?.symbol}`;
                return {tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelLimitMin, ${minOrderSize}`}
            }
        }
        return {tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: ''}
    }, [limitTradeData, limitSubmit])


    const {
        btnStatus: tradeLimitBtnStatus,
        onBtnClick: limitBtnClick,
        btnLabel: tradeLimitI18nKey,
        btnStyle: tradeLimitBtnStyle
    } = useSubmitBtn({
        availableTradeCheck,
        isLoading: isLimitLoading,
        submitCallback: onSubmitBtnClick
    })
    return {
        toastOpen,
        setToastOpen,
        closeToast,
        limitAlertOpen: alertOpen,
        resetLimitData: resetTradeData,
        isLimitLoading: false,
        limitTradeData,
        onChangeLimitEvent,
        tradeLimitI18nKey,
        tradeLimitBtnStatus,
        limitSubmit,
        limitBtnClick,
        handlePriceError,
        tradeLimitBtnStyle,
        // marketTicker,
    }
}