import { WithTranslation } from 'react-i18next';
import { CoinInfo, FloatTag, TradeFloat } from 'static-resource';
import { Box, Grid } from '@material-ui/core';
import { Avatar, Typography } from '@material-ui/core/';
import styled from '@emotion/styled';
import React from 'react';
import { baseTitleCss, useImage, useSettings } from '../../index';
import { NewTagIcon } from '../basic-lib/Tags';

type StyledProps = {
    custom: any
}
const TradeTitleStyled = styled(Box)<StyledProps>`
  ${({theme, custom}) => baseTitleCss({theme, custom})}
` as React.ElementType<StyledProps>;

export const TradeTitle = <I extends object>({
                                                 coinAInfo, coinBInfo, t,
                                                 tradeFloat = {
                                                     change: 0,
                                                     timeUnit: '24h',
                                                     priceYuan: 0,
                                                     priceDollar: 0,
                                                     floatTag: FloatTag.none
                                                 }
                                                 , isNew
                                             }: WithTranslation & { coinAInfo: CoinInfo<I>, coinBInfo: CoinInfo<I>, tradeFloat: TradeFloat, isNew: boolean }) => {
    // const {} = tradeCalcData;
    // coinSell: keyof T, //namecoinBuy: keyof T
    // const coinBInfo = tradeCalcData.buyCoinInfoMap[ coinBuy ];
    // const coinAInfo = tradeCalcData.sellCoinInfoMap[ coinSell ];
    const sellIconHasLoaded = useImage(coinAInfo?.icon ? coinAInfo?.icon : '').hasLoaded;
    const buyIconHasLoaded = useImage(coinBInfo?.icon ? coinBInfo?.icon : '').hasLoaded;
    const tradeFloatType = tradeFloat?.priceDollar === 0 ? FloatTag.none : tradeFloat?.priceDollar < 0 ? FloatTag.decrease : FloatTag.increase;
    const {currency} = useSettings();
    const change = (tradeFloat?.change && tradeFloat?.change !== Number.NaN) ? (tradeFloat.change * 100).toFixed(2) + ' %' : '0.00%'
    return <TradeTitleStyled custom={{chg: currency}}>{coinBInfo && coinAInfo ?
        <Grid container height={72}>
            <Grid item xs={12} height={28}>
                <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                    <Avatar variant="square" alt={coinAInfo?.simpleName}
                        // src={coinAInfo?.icon}
                            src={sellIconHasLoaded ? coinAInfo?.icon : 'static/images/icon-default.png'}/>
                    <Avatar variant="square" alt={coinBInfo?.simpleName} className={'icon-next'}
                        // src={coinBInfo?.icon}
                            src={buyIconHasLoaded ? coinBInfo?.icon : 'static/images/icon-default.png'}/>
                    <Typography variant={'h3'} component={'h3'} paddingRight={1}>
                        <Typography component={'span'} title={'sell'} className={'next-coin'}>
                            {coinAInfo?.simpleName}
                        </Typography>
                        <Typography component={'i'}>/</Typography>
                        <Typography component={'span'} title={'buy'}>
                            {coinBInfo.simpleName}
                        </Typography>
                    </Typography>
                    {isNew ? <NewTagIcon/> : undefined}
                </Box>
            </Grid>
            <Grid item xs={12} height={36} display={'flex'} flexDirection={'row'} justifyContent={'flex-start'}
                  alignItems={'center'} className={'float-group'}>

                <Typography variant={'h2'}>   {tradeFloat.priceDollar} {coinBInfo.simpleName}    </Typography>
                <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} justifyContent={'center'}
                     className={'float-chart'}>
                    <Typography variant={'body2'} component={'span'}
                                className={'chart-change'}>{t('labelChange24h', {timeUnit: tradeFloat.timeUnit})}</Typography>
                    <Typography variant={'h3'} component={'span'} className={`float-tag float-${tradeFloatType}`}>
                        {`${(tradeFloat.priceDollar > 0 ? '+' : '') + tradeFloat.priceDollar} (${change})`}</Typography>
                </Box>
            </Grid>
        </Grid> : <></>
    } </TradeTitleStyled>
}