import { usePairMatch } from '../../hooks/common/usePairMatch';
import { useAmount } from '../../stores/amount';
import { useAccount } from '../../stores/account';
import { useToast } from '../../hooks/common/useToast';
import { useTokenMap } from '../../stores/token';
import { useAmmMap } from '../../stores/Amm/AmmMap';
import { useSystem } from '../../stores/system';
import { useTranslation } from 'react-i18next';
import React from 'react';
import {
    AccountStatus,
    CoinInfo,
    CoinMap, IBData,
    MarketType,
    myLog,
    SagaStatus, TradeCalcData,
    WalletMap
} from '@loopring-web/common-resources';

import { usePageTradePro } from '../../stores/router';
import { marketInitCheck, swapDependAsync } from '../SwapPage/help';
import { makeWalletLayer2 } from '../../hooks/help';
import * as sdk from 'loopring-sdk';
import { useWalletLayer2 } from '../../stores/walletLayer2';

import { useProSocket, useSocketProService } from './proService';


export const usePro = <C extends { [ key: string ]: any }>():{
    [key: string]: any;
    market: MarketType|undefined;
    // marketTicker: MarketBlockProps<C> |undefined,
} =>{
    //High: No not Move!!!!!!
    let {realMarket} = usePairMatch('./trading/pro');
    realMarket = 'ETH-USDT'
    
    //basic info from redux
    const {
        pageTradePro,
        updatePageTradePro,
        __SUBMIT_LOCK_TIMER__,
        __TOAST_AUTO_CLOSE_TIMER__
    } = usePageTradePro();
    const [market, setMarket] = React.useState<MarketType>(realMarket as MarketType);
    const {getAmount} = useAmount();
    const {account, status: accountStatus} = useAccount();
    const {status: walletLayer2Status} = useWalletLayer2();

    const {toastOpen, setToastOpen, closeToast} = useToast();
    const {coinMap, tokenMap, marketArray, marketCoins, marketMap} = useTokenMap()
    const {ammMap} = useAmmMap();
    const {exchangeInfo} = useSystem();
    const {t} = useTranslation();
    useProSocket()
    const depDataCallback = React.useCallback(()=>{
        //TODO
    },[])
    const userInfoUpdateCallback = React.useCallback(()=>{
        if(accountStatus === SagaStatus.UNSET && account.readyState === 'ACTIVATED'){
            updateWalletLayer2Balance();
            // TODO:
            // updateOrderTable();
        }

    },[accountStatus])
    useSocketProService({depDataCallback,
        userInfoUpdateCallback})


    const updateWalletLayer2Balance = React.useCallback((_tradeCalcProData?)=>{
        // @ts-ignore
        let tradeCalcProData = _tradeCalcProData?_tradeCalcProData: pageTradePro.tradeCalcProData;
        // let walletMap: WalletMap<any> | undefined = tradeCalcProData?.walletMap;
        let walletMap: WalletMap<any> | undefined;
        if (account.readyState === AccountStatus.ACTIVATED && walletLayer2Status === SagaStatus.UNSET) {
            walletMap  = makeWalletLayer2(false).walletMap??{};
        }
        // debugger
        tradeCalcProData={
            ...pageTradePro.tradeCalcProData,
            ...tradeCalcProData,
            walletMap,
            priceImpact: '',
            priceImpactColor: 'inherit',
            minimumReceived: '',
        }
        updatePageTradePro({market, tradeCalcProData})

    },[market,pageTradePro,account,walletLayer2Status])






    React.useEffect(()=>{
        resetTradeCalcData(undefined, market)
    },[])
    React.useEffect(() => {
        // getDependencyData();
        if (account.readyState === AccountStatus.ACTIVATED) {
            getAmount({market})
        }
        if(market){
        }
    }, [market])



    const resetTradeCalcData = React.useCallback((_tradeData, _market) => {
        if (coinMap && tokenMap && marketMap && marketArray ) {
            const {tradePair} = marketInitCheck(_market);
            // @ts-ignore
            let [, coinA, coinB] = tradePair.match(/([\w]+)-([\w]+)/i);
            let {market} = sdk.getExistedMarket(marketArray, coinA, coinB);
            setMarket(market);
            // @ts-ignore
            [, coinA, coinB] = market.match(/([\w]+)-([\w]+)/i);
            let tradeCalcProData = pageTradePro.tradeCalcProData;
            tradeCalcProData = {
                ...tradeCalcProData,
                coinBase: coinA,
                coinQuote: coinB,
                StoB: undefined,
                BtoS: undefined,
                fee: undefined,
                coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
                    return {...prev, [ item ]: coinMap ? coinMap[ item ] : {}}
                }, {} as CoinMap<C>),
            }
            if (!Object.keys(tradeCalcProData.walletMap ?? {}).length){
                updateWalletLayer2Balance(tradeCalcProData)
            }

            updatePageTradePro({market, tradeCalcProData})


        }
    }, [coinMap, tokenMap, marketMap, marketArray,  setMarket])

    //init market

    return {
        market,

        // marketTicker,
    }
}