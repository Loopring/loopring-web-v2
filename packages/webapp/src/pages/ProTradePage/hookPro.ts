import { usePairMatch } from 'hooks/common/usePairMatch';
import { useAmount } from 'stores/amount';
import { useAccount } from 'stores/account';
import { useTokenMap } from 'stores/token';

import React from 'react';
import {
    AccountStatus,
    CoinMap, IBData,
    MarketType,
    myLog,
    PrecisionTree,
    SagaStatus,
    WalletMap
} from '@loopring-web/common-resources';

import { usePageTradePro } from 'stores/router';
import { marketInitCheck } from '../SwapPage/help';
import { makeWalletLayer2 } from 'hooks/help';
import * as sdk from '@loopring-web/loopring-sdk';
import { useWalletLayer2 } from 'stores/walletLayer2';
import { useOrderList } from './panel/orderTable/hookTable'
import { useProSocket, useSocketProService } from './proService';
import store from '../../stores';


export const usePro = <C extends { [ key: string ]: any }>(): {
    [ key: string ]: any;
    market: MarketType | undefined;
    resetTradeCalcData:(props:{ tradeData?:any, market: MarketType|string } )=> void
    // marketTicker: MarketBlockProps<C> |undefined,
} => {
    //High: No not Move!!!!!!
    let {realMarket} = usePairMatch('/trade/pro');
    // myLog('router',realMarket)
    // realMarket = 'ETH-USDT'              

    //basic info from redux
    const {
        // pageTradePro,
        updatePageTradePro,
        // __SUBMIT_LOCK_TIMER__,
        // __TOAST_AUTO_CLOSE_TIMER__
    } = usePageTradePro();
    const [market, setMarket] = React.useState<MarketType>(realMarket as MarketType);
    const {getAmount} = useAmount();
    const {account, status: accountStatus} = useAccount();
    const {status: walletLayer2Status} = useWalletLayer2();
    const {getOrderList} = useOrderList()
    // const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);

    const {coinMap, tokenMap, marketArray, marketCoins, marketMap} = useTokenMap()
    useProSocket({market});
    // const depDataCallback = React.useCallback(()=>{
    //     //TODO
    // },[])
    React.useEffect(() => {
        myLog('account.status', accountStatus, account.readyState)
        if (account.readyState !== AccountStatus.ACTIVATED && accountStatus === SagaStatus.UNSET) {
            userInfoUpdateCallback()
        }
    }, [accountStatus])
    const updateWalletLayer2Balance = React.useCallback((_tradeCalcProData?, _market?: MarketType) => {
        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
        const account = store.getState().account
        // @ts-ignore
        let tradeCalcProData = _tradeCalcProData ? _tradeCalcProData : pageTradePro.tradeCalcProData;
        let market: MarketType = _market ? _market : pageTradePro.market;
        // let walletMap: WalletMap<any> | undefined = tradeCalcProData?.walletMap;
        let walletMap: WalletMap<any> | undefined;
        if (account.readyState === AccountStatus.ACTIVATED) {
            walletMap = makeWalletLayer2(false).walletMap ?? {};
        }
        // debugger
        tradeCalcProData = {
            ...pageTradePro.tradeCalcProData,
            ...tradeCalcProData,
            walletMap,
            priceImpact: '',
            priceImpactColor: 'inherit',
            minimumReceived: '',
        }
        updatePageTradePro({market, tradeCalcProData})

    }, [market , walletLayer2Status])


    const userInfoUpdateCallback = React.useCallback(() => {
        updateWalletLayer2Balance();
        getOrderList({})
    }, [updateWalletLayer2Balance, getOrderList])
    useSocketProService({
        // depDataCallback,
        market,
        userInfoUpdateCallback
    })


    React.useEffect(() => {
        resetTradeCalcData({ market})
        precisionList(market);
    }, [market])
    React.useEffect(() => {
        // getDependencyData();
        if (account.readyState === AccountStatus.ACTIVATED) {
            getAmount({market: market})
        }
    }, [market, accountStatus]);
    const handleOnMarketChange = React.useCallback(async (newMarket: MarketType) => {
        // resetTradeCalcData({ market:newMarket})
        // precisionList(newMarket)
        setMarket(newMarket)
    }, [])

    const precisionList = React.useCallback((market: MarketType) => {
        const precisionForPrice = marketMap[ market ].precisionForPrice;
        const orderbookAggLevels = marketMap[ market ].orderbookAggLevels;
        let precisionLevels: { value: number, label: string }[] = [];
        for (let i = 0; i < orderbookAggLevels; i++) {
            if (PrecisionTree[ precisionForPrice - i ]) {
                precisionLevels.push({value: precisionForPrice - i, label: PrecisionTree[ precisionForPrice - i ]})
            }

        }
        updatePageTradePro({market, precisionLevels: precisionLevels, depthLevel: precisionForPrice})


        // return list

    }, [])


    const resetTradeCalcData = React.useCallback((props:{
        tradeData?:any, market: MarketType|string
    }) => {
        const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
        if (coinMap && tokenMap && marketMap && marketArray) {
            const {tradePair} = marketInitCheck(props.market as string);
            // @ts-ignore
            let [, coinA, coinB] = tradePair.match(/([\w]+)-([\w]+)/i);
            let {market:_market} = sdk.getExistedMarket(marketArray, coinA, coinB);
            if(_market!==market){
                setMarket(_market);
            }
            // @ts-ignore
            [, coinA, coinB] = _market.match(/([\w]+)-([\w]+)/i);
            let tradeCalcProData = pageTradePro.tradeCalcProData;
            tradeCalcProData = {
                ...tradeCalcProData,
                coinBase: coinA,
                coinQuote: coinB,
                fee: undefined,
                minimumReceived: undefined,
                priceImpact: undefined,
                priceImpactColor: 'inherit',
                coinInfoMap: marketCoins?.reduce((prev: any, item: string | number) => {
                    return {...prev, [ item ]: coinMap ? coinMap[ item ] : {}}
                }, {} as CoinMap<C>),
            }
            updateWalletLayer2Balance(tradeCalcProData, _market)

            // if (!Object.keys(tradeCalcProData.walletMap ?? {}).length) {
            //    
            // } else {
            //     updatePageTradePro({market, tradeCalcProData})
            // }


        }
    }, [coinMap, tokenMap, marketMap, marketArray,market])

    //init market

    return {
        market,
        handleOnMarketChange,
        resetTradeCalcData,
        // marketTicker,
    }
}