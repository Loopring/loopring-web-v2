import { WithTranslation, withTranslation } from 'react-i18next';
import { DepthBlock } from '@loopring-web/component-lib';
import { LoadingIcon, MarketType } from '@loopring-web/common-resources';
import { Box, Tab, Tabs } from '@mui/material';
import React from 'react';
import { usePageTradePro } from 'stores/router';
import { useTokenMap } from 'stores/token';

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
    const [tabIndex, setTabIndex] = React.useState<TabIndex>(TabIndex.orderbook)
    const {pageTradePro} = usePageTradePro();
    const { marketMap }  = useTokenMap()
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
            {pageTradePro.depth && marketMap && market == pageTradePro.market ?<>
                    <DepthBlock marketInfo={marketMap[market]}
                                depths={pageTradePro.depth.asks}
                                showTitle ={true}  />
                    <></>
                    <DepthBlock marketInfo={marketMap[market]}
                                depths={pageTradePro.depth.bids}
                                showTitle ={true}  />
                </>
                :<LoadingIcon/>
            }


        </Box>

    </>
})