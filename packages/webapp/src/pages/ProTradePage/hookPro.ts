import { usePairMatch } from '../../hooks/common/usePairMatch';
import { useAmount } from '../../stores/amount';
import { useAccount } from '../../stores/account';
import { useToast } from '../../hooks/common/useToast';
import { useTokenMap } from '../../stores/token';
import { useAmmMap } from '../../stores/Amm/AmmMap';
import { useSystem } from '../../stores/system';
import { usePageTradeLite } from '../../stores/router';
import { useWalletLayer2 } from '../../stores/walletLayer2';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { CoinInfo, MarketType, TradeFloat } from '@loopring-web/common-resources';
import { Ticker, useTicker } from '../../stores/ticker';
import { MarketBlockProps } from '@loopring-web/component-lib';

export const usePro = <C extends { [ key: string ]: any }>():{
    market: MarketType|undefined,
    marketTicker: MarketBlockProps<C> |undefined,
} =>{
    //High: No not Move!!!!!!
    const {realMarket} = usePairMatch('./trading/pro');
    //basic info from redux
    const {t} = useTranslation();
    const {amountMap, getAmount} = useAmount();
    const {account, status: accountStatus} = useAccount();
    const {toastOpen, setToastOpen, closeToast,} = useToast();
    const {coinMap, tokenMap, marketArray, marketCoins, marketMap} = useTokenMap()
    const {ammMap} = useAmmMap();
    const {exchangeInfo} = useSystem();
    const {tickerMap, updateTickers} = useTicker();
    //

    //init market
    const [market,setMarket] = React.useState<MarketType|undefined>(realMarket);
    const [marketTicker,setMarketTicker] = React.useState<MarketBlockProps<C>|undefined>(undefined);

    //useEffect by Market
    React.useEffect(()=>{
        if(market){
            setDefaultData()
        }
    },[market])
    const setDefaultData = React.useCallback(()=>{
        if(coinMap && tickerMap){
            //@ts-ignore
            const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
            setMarketTicker({
                coinAInfo: coinMap[coinA] as CoinInfo<C>,
                coinBInfo: coinMap[coinB] as CoinInfo<C>,
                tradeFloat: tickerMap[market as string]
            })
        }

    },[tickerMap,market])

    return {
        market,
        marketTicker,
    }
}