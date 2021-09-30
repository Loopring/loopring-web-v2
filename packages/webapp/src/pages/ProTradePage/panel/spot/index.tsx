import { WithTranslation, withTranslation } from 'react-i18next';
import React from 'react';
import {
    AlertImpact,
    AlertLimitPrice,
    ConfirmImpact,
    LimitTrade,
    MarketTrade,
    Toast,
    TradeProType
} from '@loopring-web/component-lib';
import { TOAST_TIME } from 'defs/common_defs';
import { getValuePrecisionThousand, IBData, LoadingIcon, MarketType } from '@loopring-web/common-resources';
import { usePageTradePro } from 'stores/router';
import { useMarket } from './hookMarket';
import { useLimit } from './hookLimit';
import { Box, Divider, Tab, Tabs } from '@mui/material';
import { useTokenMap } from 'stores/token';
import store from '../../../../stores';

// const TabsStyle = styled(Tabs)`
//   flex: 1;
//   width: 100%;
// ` as typeof Tabs
export enum TabIndex {
    market = 'market',
    limit = 'limit'
}

export const SpotView = withTranslation('common')(({
                                                       t, market,
                                                       resetTradeCalcData,
                                                       // ,marketTicker
                                                   }: {
    market: MarketType,
    resetTradeCalcData:(props:{ tradeData?:any, market: MarketType|string } )=> void
    // marketTicker:  MarketBlockProps<C>
} & WithTranslation) => {
    const {pageTradePro} = usePageTradePro();
    const [tabIndex, setTabIndex] = React.useState<TabIndex>(TabIndex.limit);
    const {marketMap, tokenMap} = useTokenMap();
    //@ts-ignore 
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const {
        toastOpen: toastOpenL, closeToast: closeToastL, limitTradeData, onChangeLimitEvent,
        tradeLimitI18nKey,
        tradeLimitBtnStatus,
        tradeLimitBtnStyle,
        limitBtnClick,
        isLimitLoading,
        handlePriceError,
        resetLimitData,
        limitAlertOpen,
        limitSubmit,
    } = useLimit(market)

    const {
        alertOpen, confirmOpen, toastOpen, closeToast,
        marketTradeData, onChangeMarketEvent,
        tradeMarketI18nKey,
        tradeMarketBtnStatus,
        tradeMarketBtnStyle,
        marketSubmit,
        resetMarketData,
        marketBtnClick,
        isMarketLoading,
    } = useMarket(market)
    const onTabChange = React.useCallback((_e, value) => {
        setTabIndex(value);
        //HIGH: Do not move the query
        resetLimitData();
        resetMarketData();
        resetTradeCalcData({market})
        //HIGH: Do not move the query
    }, [market])

    const p = getValuePrecisionThousand(parseFloat(pageTradePro.calcTradeParams?.priceImpact ?? '0') * 100, 2) + '%' as any

    return <>
        <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'}
               open={toastOpen?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToast}/>
        <Toast alertText={toastOpenL?.content ?? ''} severity={toastOpenL?.type ?? 'success'}
               open={toastOpenL?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToastL}/>
        <AlertImpact handleClose={marketSubmit} open={alertOpen}
                     value={p}/>
        <ConfirmImpact handleClose={marketSubmit} open={confirmOpen}
                       value={p}/>
        <AlertLimitPrice handleClose={limitSubmit} open={limitAlertOpen}
                         value={pageTradePro.tradeType === TradeProType.buy ? "labelPriceCompareGreat" : "labelPriceCompareLess"}/>

        <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
            <Box component={'header'} width={'100%'}>
            <Tabs variant={'fullWidth'} value={tabIndex} onChange={onTabChange}>
            <Tab value={TabIndex.limit} label={t('labelProLimit')}/>
            <Tab value={TabIndex.market} label={t('labelProMarket')}/>
            </Tabs>
            </Box>
            <Divider style={{marginTop: '-1px'}}/>
            <Box flex={1} component={'section'}>
        {tabIndex === TabIndex.limit && <LimitTrade
            // disabled={false}
            tokenPriceProps={{
            handleError: handlePriceError as any,
            decimalsLimit: marketMap[ market ].precisionForPrice
        }
        }
            tradeType={pageTradePro.tradeType}
            tokenBaseProps={{disabled: isLimitLoading, decimalsLimit: tokenMap[ baseSymbol ].precision}}
            tokenQuoteProps={{disabled: isLimitLoading, decimalsLimit: tokenMap[ quoteSymbol ].precision}}
            tradeLimitI18nKey={tradeLimitI18nKey}
            tradeLimitBtnStyle={tradeLimitBtnStyle}
            tradeLimitBtnStatus={tradeLimitBtnStatus as any}
            handleSubmitEvent={limitBtnClick as any}
            tradeCalcProData={pageTradePro.tradeCalcProData}
            tradeData={limitTradeData}
            onChangeEvent={onChangeLimitEvent as any}/>}
        {tabIndex === TabIndex.market && <MarketTrade
            // disabled={false}

            tokenBaseProps={{disabled: isMarketLoading, decimalsLimit: tokenMap[ baseSymbol ].precision}}
            tokenQuoteProps={{disabled: isMarketLoading, decimalsLimit: tokenMap[ quoteSymbol ].precision}}
            tradeMarketI18nKey={tradeMarketI18nKey}
            tradeMarketBtnStyle={tradeMarketBtnStyle}
            tradeType={pageTradePro.tradeType}
            tradeMarketBtnStatus={tradeMarketBtnStatus}
            handleSubmitEvent={marketBtnClick}
            tradeCalcProData={pageTradePro.tradeCalcProData}
            tradeData={marketTradeData}
            onChangeEvent={onChangeMarketEvent}/>}
            </Box>

        </Box>
    </>
})

