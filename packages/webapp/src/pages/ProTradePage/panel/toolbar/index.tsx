import React from 'react';
import { TFunction, withTranslation } from 'react-i18next';
import {
    CoinInfo,
    DropDownIcon, EmptyValueTag,
    getValuePrecisionThousand, layoutConfigs,
    MarketType,
    PriceTag,
    SagaStatus
} from '@loopring-web/common-resources';
import { Button, MarketBlockProps, useSettings } from '@loopring-web/component-lib';
import { useTicker } from 'stores/ticker';
import { useTokenMap } from 'stores/token';
import { Box, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { usePageTradePro } from 'stores/router';
import { volumeToCount } from 'hooks/help'
import styled from '@emotion/styled'
import { Currency } from 'loopring-sdk';
import { Layout, Layouts } from 'react-grid-layout';
import { useTokenPrices } from 'stores/tokenPrices';
import { useSystem } from 'stores/system';

const PriceTitleStyled = styled(Typography)`
  color: var(--color-text-third);
  font-size: 1.2rem;
`

const PriceValueStyled = styled(Typography)`
  font-size: 1.2rem;
`

export const Toolbar = withTranslation('common')(<C extends { [ key: string ]: any }>({
                                                                                          market,
                                                                                          handleLayoutChange,
                                                                                          handleOnMarketChange,
                                                                                          // ,marketTicker
                                                                                          t,
                                                                                      }: {
    t: TFunction<"translation">,
    market: MarketType,
    handleLayoutChange: (currentLayout: Layout[], allLayouts?: Layouts, layouts?: Layouts) => void,

    handleOnMarketChange: (newMarket: MarketType) => void,
    // marketTicker:  MarketBlockProps<C>
}) => {
    //@ts-ignore
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
    const {coinMap, marketArray, marketMap, tokenMap} = useTokenMap();
    const {tickerMap, status: tickerStatus} = useTicker();
    const [marketTicker,setMarketTicker] = React.useState<MarketBlockProps<C> & any | undefined>({
        coinAInfo: coinMap[ coinA ] as CoinInfo<C>,
        coinBInfo: coinMap[ coinB ] as CoinInfo<C>,
        tradeFloat: tickerMap[market],
        // base,
        // quote,
        // isRise,
        // baseVol,
        // basePriceDollar,
        // basePriceYuan
    });
    // const {pageTradePro: {ticker}} = usePageTradePro()
    const {currency} = useSettings()
    const {forex} = useSystem()
    const {tokenPrices} = useTokenPrices()

    // const {
    //     change,
    //     close,
    //     floatTag,
    //     high,
    //     low,
    //     volume: quoteVol,
    //     // priceDollar,
    //     // priceYuan,
    //     __rawTicker__,
    // } = tickerMap[] || {} as any
    // const base = __rawTicker__?.base
    // const quote = __rawTicker__?.quote
    // const baseVol = volumeToCount(base, __rawTicker__?.base_token_volume || 0)
    // const isRise = floatTag === 'increase'
    const isUSD = currency === Currency.usd
    // const basePriceDollar = tokenPrices ? tokenPrices[base] : 0
    // const basePriceYuan = basePriceDollar * forex

    const getMarketPrecision = React.useCallback((market: string) => {
        if (marketMap) {
            return marketMap[ market ].precisionForPrice
        }
        return undefined
    }, [marketMap])

    const getTokenPrecision = React.useCallback((token: string) => {
        if (tokenMap) {
            return tokenMap[ token ]?.precision
        }
        return undefined
    }, [tokenMap])
    // const {pageTradePro,updatePageTradePro} = usePageTradePro()
    React.useEffect(() => {
        if (tickerStatus === SagaStatus.UNSET) {
            setDefaultData();
        }
    }, [tickerStatus,market]);
    const setDefaultData = React.useCallback(() => {
        if (coinMap && tickerMap && tickerMap[ market ] && tickerMap[ market ].__rawTicker__) {

            // const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
            const ticker = tickerMap[ market ]
            const base:string =  ticker.__rawTicker__?.base??'';
            const quote:string =  ticker.__rawTicker__?.quote??'';
            const baseVol = volumeToCount(base, ticker.__rawTicker__?.base_token_volume || 0)
            const isRise = ticker.floatTag === 'increase'
            const basePriceDollar = tokenPrices ? tokenPrices[base] : 0
            const basePriceYuan = basePriceDollar * forex
            setMarketTicker((state: any)=>{
                return {
                    ...state,
                    tradeFloat: ticker,
                    base,
                    quote,
                    isRise,
                    baseVol,
                    basePriceDollar,
                    basePriceYuan
                }
            })
        }

    }, [tickerMap, market])
    const _handleOnMarketChange = React.useCallback((event: React.ChangeEvent<{ value: string }>) => {
        handleOnMarketChange(event.target.value as MarketType)
    }, [])
    return <Box display={'flex'} alignItems={'center'} height={'100%'} paddingX={2} justifyContent={'space-between'}>
        <Box alignItems={'center'} display={'flex'}>
            <TextField
                id="outlined-select-level"
                select
                size={'small'}
                style={{width: '190px'}}
                value={market}
                onChange={_handleOnMarketChange}
                inputProps={{IconComponent: DropDownIcon}}
            >
                {marketArray && !!marketArray.length && (marketArray.slice().sort((a, b) => a.localeCompare(b))).map((item) =>
                    <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <Grid container spacing={3} marginLeft={0} display={'flex'} alignItems={'center'}>
                <Grid item>
                    <Typography fontWeight={500}
                                color={!marketTicker?.tradeFloat?.close ? 'var(--color-text-primary)' : marketTicker.isRise ? 'var(--color-success)' : 'var(--color-error)'}>
                        {marketTicker?.tradeFloat?.close??EmptyValueTag}</Typography>
                    <PriceValueStyled>{isUSD ? PriceTag.Dollar : PriceTag.Yuan}{getValuePrecisionThousand((isUSD ? marketTicker.basePriceDollar : marketTicker.basePriceYuan), undefined, undefined, undefined, true, {isFait: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hChange')}</PriceTitleStyled>
                    <PriceValueStyled color={marketTicker.isRise ? 'var(--color-success)' : 'var(--color-error)'}>
                        {`${marketTicker.isRise ? '+' : ''} ${getValuePrecisionThousand(marketTicker?.tradeFloat?.change, undefined, undefined, 2, true)}%`}
                    </PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hHigh')}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(marketTicker?.tradeFloat?.high, undefined, undefined, getMarketPrecision(market), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hLow')}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(marketTicker?.tradeFloat?.low, undefined, undefined, getMarketPrecision(market), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hBaseVol', {symbol: marketTicker.base})}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(marketTicker.baseVol, undefined, undefined, getTokenPrecision(marketTicker.base), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hQuoteVol', {symbol: marketTicker.quote})}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(marketTicker.quoteVol, undefined, undefined, getTokenPrecision(marketTicker.quote), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
            </Grid>
        </Box>
        <Box>
            <Button onClick={() => {
                handleLayoutChange([], undefined, layoutConfigs[ 0 ].layouts)

            }}>{t('labelResetLayout')}</Button>
        </Box>
    </Box>

})
