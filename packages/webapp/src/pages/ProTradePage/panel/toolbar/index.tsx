import React from 'react';
import { TFunction, withTranslation } from 'react-i18next';
import {
    CoinInfo,
    DropDownIcon,
    getValuePrecisionThousand, layoutConfigs,
    MarketType,
    PriceTag,
    SagaStatus
} from '@loopring-web/common-resources';
import { useTicker } from 'stores/ticker';
import { MarketBlockProps, useSettings } from '@loopring-web/component-lib';
import { useTokenMap } from 'stores/token';
import { Box, Button, Grid, MenuItem, TextField, Typography } from '@mui/material';
import { usePageTradePro } from '../../../../stores/router';
import { volumeToCount } from 'hooks/help'
import styled from '@emotion/styled'
import { Currency } from 'loopring-sdk';
import { Layouts } from 'react-grid-layout';

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
    handleLayoutChange:(layouts:Layouts)=>void,
    handleOnMarketChange: (newMarket: MarketType) => void,
    // marketTicker:  MarketBlockProps<C>
}) => {
    const {tickerMap, status: tickerStatus} = useTicker();
    const [marketTicker, setMarketTicker] = React.useState<MarketBlockProps<C> | undefined>(undefined);
    const {coinMap, marketArray, marketMap, tokenMap} = useTokenMap();
    const {pageTradePro: {ticker}} = usePageTradePro()
    const {currency,setLayouts} = useSettings()

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
    const isUSD = currency === Currency.usd

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
    }, [tickerStatus]);
    const setDefaultData = React.useCallback(() => {
        if (coinMap && tickerMap) {
            //@ts-ignore
            const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
            setMarketTicker({
                coinAInfo: coinMap[ coinA ] as CoinInfo<C>,
                coinBInfo: coinMap[ coinB ] as CoinInfo<C>,
                tradeFloat: tickerMap[ market as string ]
            })
        }

    }, [tickerMap, market])
    const _handleOnMarketChange = React.useCallback((event: React.ChangeEvent<{ value: string }>) => {
        handleOnMarketChange(event.target.value as MarketType)
    }, [])
    return <Box display={'flex'} alignItems={'center'} height={'100%'} paddingX={2}  justifyContent={'space-between'}>
        <Box alignItems={'center'} display={'flex'} >
            <TextField
                id="outlined-select-level"
                select
                size={'small'}
                style={{ width: '190px' }}
                value={market}
                onChange={_handleOnMarketChange}
                inputProps={{IconComponent: DropDownIcon}}
            >
                {marketArray && !!marketArray.length && (marketArray.slice().sort((a, b) => a.localeCompare(b))).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField>
            <Grid container spacing={3} marginLeft={0} display={'flex'} alignItems={'center'}>
                <Grid item>
                    <Typography fontWeight={500}
                                color={isRise ? 'var(--color-success)' : 'var(--color-error)'}>{close}</Typography>
                    <PriceValueStyled>{isUSD ? PriceTag.Dollar : PriceTag.Yuan}{getValuePrecisionThousand((isUSD ? priceDollar : priceYuan), undefined, undefined, undefined, true, {isFait: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hChange')}</PriceTitleStyled>
                    <PriceValueStyled color={isRise ? 'var(--color-success)' : 'var(--color-error)'}>
                        {`${isRise ? '+' : ''} ${getValuePrecisionThousand(change, undefined, undefined, 2, true)}%`}
                    </PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hHigh')}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(high, undefined, undefined, getMarketPrecision(market), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hLow')}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(low, undefined, undefined, getMarketPrecision(market), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hBaseVol', {symbol: base})}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(baseVol, undefined, undefined, getTokenPrecision(base), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hQuoteVol', {symbol: quote})}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(quoteVol, undefined, undefined, getTokenPrecision(quote), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
            </Grid>
        </Box>
        <Box>
            <Button onClick={()=>{
                setLayouts(layoutConfigs[0].layouts)
                handleLayoutChange(layoutConfigs[0].layouts)}}>{t('labelResetLayout')}</Button>
        </Box>
    </Box>

})
