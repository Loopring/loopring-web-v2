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
import { LoopringAPI } from '../../api_wrapper';

import { useProSocket, useSocketProService } from './proService';
import { SwapTradeData } from '@loopring-web/component-lib';


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
    const [market, setMarket] = React.useState<MarketType>(realMarket as MarketType);
    const {amountMap, getAmount} = useAmount();
    const {account, status: accountStatus} = useAccount();
    const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();

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
        updateWalletLayer2Balance();
        // TODO:
        // updateOrderTable();
    },[])
    useSocketProService({depDataCallback,
        userInfoUpdateCallback})


    const updateWalletLayer2Balance = React.useCallback((_tradeCalcData?)=>{
        // @ts-ignore
        let tradeCalcData = _tradeCalcData?_tradeCalcData: pageTradePro.tradeCalcData;
        // let walletMap: WalletMap<any> | undefined = tradeCalcData?.walletMap;
        let walletMap: WalletMap<any> | undefined;
        if (account.readyState === AccountStatus.ACTIVATED && walletLayer2Status === SagaStatus.UNSET) {
            walletMap = makeWalletLayer2().walletMap as WalletMap<any>;
        }

        tradeCalcData={
            ...pageTradePro.tradeCalcData,
            ...tradeCalcData,
            walletMap,
            priceImpact: '',
            priceImpactColor: 'inherit',
            minimumReceived: '',
        }
        updatePageTradePro({market, tradeCalcData})

    },[market,pageTradePro])






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
            let tradeCalcData = pageTradePro.tradeCalcData;
            tradeCalcData = {
                ...tradeCalcData,
                coinSell: coinA,
                coinBuy: coinB,
                StoB: undefined,
                BtoS: undefined,
                fee: undefined,
                coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
                    return {...prev, [ item ]: coinMap ? coinMap[ item ] : {}}
                }, {} as CoinMap<C>),
            }
            if (!Object.keys(tradeCalcData.walletMap ?? {}).length){
                updateWalletLayer2Balance(tradeCalcData)
            }

            updatePageTradePro({market, tradeCalcData})


        }
    }, [coinMap, tokenMap, marketMap, marketArray,  setMarket])

    //init market

    return {
        market,

        // marketTicker,
    }
}