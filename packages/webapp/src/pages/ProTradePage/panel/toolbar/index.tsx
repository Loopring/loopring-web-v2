import { withTranslation } from 'react-i18next';
import { CoinInfo, DropDownIcon, MarketType, SagaStatus } from '@loopring-web/common-resources';
import { useTicker } from 'stores/ticker';
import React from 'react';
import { MarketBlockProps } from '@loopring-web/component-lib';
import { useTokenMap } from 'stores/token';
import { Box, MenuItem, TextField } from '@mui/material';
import { usePageTradePro } from '../../../../stores/router';

export const Toolbar = withTranslation('common')(<C extends { [ key: string ]: any }>({
                                                                                          market,
                                                                                          handleOnMarketChange,
                                                                                          // ,marketTicker
                                                                                      }: {
    market: MarketType,
    handleOnMarketChange:(newMarket:MarketType) => void,
    // marketTicker:  MarketBlockProps<C>
}) => {
    const {tickerMap,status:tickerStatus} = useTicker();
    const [marketTicker,setMarketTicker] = React.useState<MarketBlockProps<C>|undefined>(undefined);
    const {coinMap,marketArray} = useTokenMap();
    // const {pageTradePro,updatePageTradePro} = usePageTradePro()
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
    const _handleOnMarketChange = React.useCallback((event: React.ChangeEvent<{ value: string }>) => {
        handleOnMarketChange(event.target.value as MarketType)
    }, [])
    return <Box display={'flex'} alignItems={'center'} height={'100%'} paddingX={2} >
        <TextField
            id="outlined-select-level"
            select
            size={'small'}
            value={market}
            onChange={_handleOnMarketChange}
            inputProps={{IconComponent: DropDownIcon}}
        >
            {marketArray && marketArray.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}

        </TextField>
       </Box>

})