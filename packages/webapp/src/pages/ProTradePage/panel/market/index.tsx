import { WithTranslation, withTranslation } from 'react-i18next';
import { DepthBlock, DepthType, useSettings } from '@loopring-web/component-lib';
import {
    Currency,
    EmptyValueTag,
    getValuePrecisionThousand,
    LoadingIcon,
    MarketType,
    PriceTag
} from '@loopring-web/common-resources';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { usePageTradePro } from 'stores/router';
import { useTokenMap } from 'stores/token';
import { useTokenPrices } from '../../../../stores/tokenPrices';
import { useSystem } from '../../../../stores/system';

enum TabIndex {
    orderbook = 'orderbook',
    trades = 'trades'
}
export  const MarketView = withTranslation('common')(({
                                                          t, market
                                                          // ,marketTicker
                                                      }: {
    market: MarketType,
    // marketTicker:  MarketBlockProps<C>
} & WithTranslation)=>{
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const [tabIndex, setTabIndex] = React.useState<TabIndex>(TabIndex.orderbook)
    const {pageTradePro} = usePageTradePro();

    const {tickerMap,depth} = pageTradePro;
    const { marketMap,tokenMap }  = useTokenMap();
    const {upColor, currency } = useSettings();
    const {tokenPrices} = useTokenPrices();
    // @ts-ignore
    const basePrice = tokenPrices[baseSymbol];
    const {forex} = useSystem();



    const value = currency === Currency.dollar ? '\u2248 ' + PriceTag.Dollar
        + getValuePrecisionThousand((
            (tickerMap && tickerMap[ market ])? tickerMap[ market ].close * basePrice
                : 0), undefined, undefined, undefined, true, {isFait: true})
        : '\u2248 ' + PriceTag.Yuan
        + getValuePrecisionThousand(( (tickerMap && tickerMap[ market ])?
            tickerMap[ market ].close * basePrice / forex: 0), undefined, undefined, undefined, true, {isFait: true})
     // }
    return <>
        <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
            <Box component={'header'} width={'100%'}>
                <Tabs variant={'fullWidth'} value={tabIndex} onChange={(_e, value) => {
                    setTabIndex(value)
                }}>
                    <Tab value={TabIndex.orderbook} label={t('labelProLimit')}/>
                    {/*<Tab value={TabIndex.market} label={t('labelProMarket')}/>*/}
                </Tabs>
            </Box>
            {pageTradePro.depth && pageTradePro.tickerMap && tokenMap && marketMap && market == pageTradePro.market ?
                <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} paddingX={2}>
                    <DepthBlock marketInfo={marketMap[market]}
                                type={DepthType.ask}
                                tokenBaseInfo={tokenMap[baseSymbol]}
                                tokenQuoteInfo={tokenMap[quoteSymbol]}
                                depths={pageTradePro.depth[ `${DepthType.ask}s`].slice(0,8)}
                                showTitle ={true}  />
                    <Box paddingY={1/2} display={'flex'} flexDirection={'column'}  alignItems={'center'}>
                         <Typography color={'var(--color-text-third)'} variant={'body2'} component={'p'} textAlign={'center'} >
                             {pageTradePro.tickerMap[market].close} {value}
                         </Typography>
                    </Box>
                    <DepthBlock marketInfo={marketMap[market]}
                                type={DepthType.bid}
                                tokenBaseInfo={tokenMap[baseSymbol]}
                                tokenQuoteInfo={tokenMap[quoteSymbol]}
                                depths={pageTradePro.depth[ `${DepthType.bid}s`].slice(0,8)}
                                showTitle ={false}  />
                </Box>
                :<LoadingIcon/>
            }


        </Box>

    </>
})