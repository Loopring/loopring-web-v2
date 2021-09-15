import { withTranslation } from 'react-i18next';
import React from 'react';
import { AlertImpact, ConfirmImpact, Toast } from '@loopring-web/component-lib';
import { TOAST_TIME } from '../../../../defs/common_defs';
import { MarketType } from '@loopring-web/common-resources';
import { usePageTradePro } from '../../../../stores/router';
import { useMarket } from './useMarket';
import { useLimit } from './hookLimit';

export  const SpotView = withTranslation('common')(<C extends { [ key: string ]: any }>({
    market
    // ,marketTicker
}: {
    market: MarketType,
    // marketTicker:  MarketBlockProps<C>
})=>{
    const { pageTradePro } = usePageTradePro();
    const { toastOpenL, closeToastL} = useLimit(market)
    const { alertOpen,
        confirmOpen,
        toastOpen,
        closeToast,
        marketLastCall} = useMarket(market)

    return <>
        <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'}
               open={toastOpen?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToast}/>
        <Toast alertText={toastOpenL?.content ?? ''} severity={toastOpenL?.type ?? 'success'}
               open={toastOpenL?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToastL}/>
        <AlertImpact handleClose={marketLastCall} open={alertOpen} value={pageTradePro?.priceImpactObj?.value as any}/>
        <ConfirmImpact handleClose={marketLastCall} open={confirmOpen} value={pageTradePro?.priceImpactObj?.value as any}/>
    </>
})

