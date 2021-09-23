import React from 'react';
import { withTranslation, TFunction } from 'react-i18next';
import { CoinInfo, DropDownIcon, MarketType, myLog, PriceTag, SagaStatus } from '@loopring-web/common-resources';
import { useTicker } from 'stores/ticker';
import { MarketBlockProps } from '@loopring-web/component-lib';
import { useTokenMap } from 'stores/token';
import { useSettings } from '@loopring-web/component-lib';
import { Box, MenuItem, TextField, Grid, Typography } from '@mui/material';
import { usePageTradePro } from '../../../../stores/router';
import { getValuePrecisionThousand } from '@loopring-web/common-resources';
import { volumeToCount } from 'hooks/help'
import styled from '@emotion/styled'

const PriceTitleStyled = styled(Typography)`
    color: var(--color-text-third);
`

export const Toolbar = withTranslation('common')(<C extends { [ key: string ]: any }>({
                                                                                          market,
                                                                                          handleOnMarketChange,
                                                                                          // ,marketTicker
                                                                                          t,
                                                                                      }: {
    t: TFunction<"translation">,
    market: MarketType,
    handleOnMarketChange:(newMarket:MarketType) => void,
    // marketTicker:  MarketBlockProps<C>
}) => {
    const {tickerMap,status:tickerStatus} = useTicker();
    const [marketTicker,setMarketTicker] = React.useState<MarketBlockProps<C>|undefined>(undefined);
    const {coinMap, marketArray, marketMap, tokenMap} = useTokenMap();
    const { pageTradePro: {ticker} } = usePageTradePro()
    const { currency } = useSettings()
    
    const {
        change,
        close,
        floatTag,
        high, 
        low,
        volume: quoteVol,
        priceDollar,
        priceYuan,
        __rawTicker__,
    } = ticker || {} as any
    const base = __rawTicker__?.base
    const quote = __rawTicker__?.quote
    const baseVol = volumeToCount(base, __rawTicker__?.base_token_volume || 0)
    const isRise = floatTag === 'increase'
    const isUSD = currency === 'USD'

    const getMarketPrecision = React.useCallback((market: string) => {
        if (marketMap) {
            return marketMap[market].precisionForPrice
        }
        return undefined
    }, [marketMap])

    const getTokenPrecision = React.useCallback((token: string) => {
        if (tokenMap) {
            return tokenMap[token]?.precision
        }
        return undefined
    }, [tokenMap])

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
        <Grid container spacing={3} marginLeft={0}>
            <Grid item>
                <Typography color={isRise ? 'var(--color-success)' : 'var(--color-error)'}>{close}</Typography>
                <Typography>{isUSD ? PriceTag.Dollar : PriceTag.Yuan}{getValuePrecisionThousand((isUSD ? priceDollar : priceYuan), undefined, undefined, undefined, true, {isFait: true})}</Typography>
            </Grid>
            <Grid item>
                <PriceTitleStyled>{t('labelProToolbar24hChange')}</PriceTitleStyled>
                <Typography color={isRise ? 'var(--color-success)' : 'var(--color-error)'}>
                    {`${isRise ? '+' : '-'} ${getValuePrecisionThousand(change, undefined, undefined, 2, true)}%`}
                </Typography>
            </Grid>
            <Grid item>
                <PriceTitleStyled>{t('labelProToolbar24hHigh')}</PriceTitleStyled>
                <Typography>{getValuePrecisionThousand(high, undefined, undefined, getMarketPrecision(market), true, {isPrice: true})}</Typography>
            </Grid>
            <Grid item>
                <PriceTitleStyled>{t('labelProToolbar24hLow')}</PriceTitleStyled>
                <Typography>{getValuePrecisionThousand(low, undefined, undefined, getMarketPrecision(market), true, {isPrice: true})}</Typography>
            </Grid>
            <Grid item>
                <PriceTitleStyled>{t('labelProToolbar24hBaseVol', {symbol: base})}</PriceTitleStyled>
                <Typography>{getValuePrecisionThousand(baseVol, undefined, undefined, getTokenPrecision(base), true, {isPrice: true})}</Typography>
            </Grid>
            <Grid item>
                <PriceTitleStyled>{t('labelProToolbar24hQuoteVol', {symbol: quote})}</PriceTitleStyled>
                <Typography>{getValuePrecisionThousand(quoteVol, undefined, undefined, getTokenPrecision(quote), true, {isPrice: true})}</Typography>
            </Grid>
        </Grid>
    </Box>

})
