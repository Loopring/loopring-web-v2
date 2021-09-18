import { withTranslation } from 'react-i18next';
import { CoinInfo, MarketType, SagaStatus } from '@loopring-web/common-resources';
import { useTicker } from 'stores/ticker';
import React from 'react';
import { MarketBlockProps } from '@loopring-web/component-lib';
import { useTokenMap } from 'stores/token';

export const Toolbar = withTranslation('common')(<C extends { [ key: string ]: any }>({
                                                                                          market
                                                                                          // ,marketTicker
                                                                                      }: {
    market: MarketType,
    // marketTicker:  MarketBlockProps<C>
}) => {
    const {tickerMap,status:tickerStatus} = useTicker();
    const [marketTicker,setMarketTicker] = React.useState<MarketBlockProps<C>|undefined>(undefined);
    const {coinMap} = useTokenMap()
    React.useEffect(() => {
        if(tickerStatus === SagaStatus.UNSET) {
            setDefaultData();
        }
    }, [tickerStatus]);
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
    return <>
    </>
})