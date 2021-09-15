import { usePairMatch } from '../../hooks/common/usePairMatch';
import { useAmount } from '../../stores/amount';
import { useAccount } from '../../stores/account';
import { useToast } from '../../hooks/common/useToast';
import { useTokenMap } from '../../stores/token';
import { useAmmMap } from '../../stores/Amm/AmmMap';
import { useSystem } from '../../stores/system';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { CoinInfo, MarketType } from '@loopring-web/common-resources';
import {  useTicker } from '../../stores/ticker';
import { MarketBlockProps } from '@loopring-web/component-lib';
import { useSwap } from '../SwapPage/hookSwap';
import { usePageTradeLite, usePageTradePro } from '../../stores/router';

export const usePro = <C extends { [ key: string ]: any }>():{
    [key: string]: any;
    market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} =>{
    //High: No not Move!!!!!!
    const {realMarket} = usePairMatch('./trading/pro');
    //basic info from redux
    const {
        pageTradePro,
        updatePageTradePro,
        __SUBMIT_LOCK_TIMER__,
        __TOAST_AUTO_CLOSE_TIMER__
    } = usePageTradePro();
    const {amountMap, getAmount} = useAmount();
    const {account, status: accountStatus} = useAccount();
    const {toastOpen, setToastOpen, closeToast} = useToast();
    const {coinMap, tokenMap, marketArray, marketCoins, marketMap} = useTokenMap()
    const {ammMap} = useAmmMap();
    const {exchangeInfo} = useSystem();
    const {t} = useTranslation();
    const {
        market,
        tradeCalcData,
        tradeData,
        tradeFloat,
        tradeArray,
        // myTradeArray,
        // marketArray,
        handleSwapPanelEvent,
        onSwapClick,
        pair,
        swapBtnI18nKey,
        swapBtnStatus,
        // toastOpen,
        // closeToast,
        should15sRefresh,
        // debugInfo,
        alertOpen,
        confirmOpen,
        refreshRef,
        swapFunc,
        isSwapLoading,
        pageTradeLite,
    } = useSwap({path:'./trading/pro'});



    //

    //init market

    //useEffect by Market
    React.useEffect(()=>{
        if(market){
            // setDefaultData()
        }
    },[market])


    return {
        market,
        toastOpen,
        closeToast,
        swapFunc,
        alertOpen,
        confirmOpen,
        pageTradeLite,
        tradeCalcData,
        // marketTicker,
    }
}