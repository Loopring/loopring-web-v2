import { WithTranslation, withTranslation } from 'react-i18next';
import React from 'react';
import { AlertImpact, ConfirmImpact, LimitTrade, MarketTrade, Toast } from '@loopring-web/component-lib';
import { TOAST_TIME } from '../../../../defs/common_defs';
import { MarketType } from '@loopring-web/common-resources';
import { usePageTradePro } from '../../../../stores/router';
import { useMarket } from './useMarket';
import { useLimit } from './hookLimit';
import { Box, Tab, Tabs } from '@mui/material';

export  enum TabIndex  {
    market='market',
    limit='limit'
}
export  const SpotView = withTranslation('common')(<C extends { [ key: string ]: any }>({
    t,market
    // ,marketTicker
}: {
    market: MarketType,
    // marketTicker:  MarketBlockProps<C>
} & WithTranslation)=>{
    const { pageTradePro } = usePageTradePro();
    const { toastOpenL, closeToastL,limitSubmit,limitTradeData,onChangeLimitEvent} = useLimit(market)
    const [tabIndex, setTabIndex] = React.useState<TabIndex>(TabIndex.limit)
    const { alertOpen, confirmOpen, toastOpen, closeToast,
        marketSubmit,marketTradeData,onChangeMarketEvent} = useMarket(market)
    return <>
        <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'}
               open={toastOpen?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToast}/>
        <Toast alertText={toastOpenL?.content ?? ''} severity={toastOpenL?.type ?? 'success'}
               open={toastOpenL?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToastL}/>
        <AlertImpact handleClose={marketSubmit} open={alertOpen} value={pageTradePro?.priceImpactObj?.value as any}/>
        <ConfirmImpact handleClose={marketSubmit} open={confirmOpen} value={pageTradePro?.priceImpactObj?.value as any}/>
        <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
            <Box component={'header'}>
                <Tabs value={tabIndex}>
                    <Tab value={TabIndex.limit} label={t('labelProLimit')}/>
                    <Tab value={TabIndex.market} label={t('labelProMarket')}/>
                </Tabs>
            </Box>

            <Box flex={1} component={'section'}>
                {tabIndex === TabIndex.limit && <LimitTrade  handleSubmitEvent={limitSubmit}
                                                             tradeCalcData={pageTradePro.tradeCalcData as any}
                                                             tradeData={limitTradeData}
                                                             onChangeEvent={onChangeLimitEvent}/>}
                {tabIndex === TabIndex.market && <MarketTrade   handleSubmitEvent={marketSubmit}
                                                                tradeCalcData={pageTradePro.tradeCalcData as any}
                                                                tradeData={marketTradeData}
                                                                onChangeEvent={onChangeMarketEvent}/>}
            </Box>

        </Box>
    </>
})

