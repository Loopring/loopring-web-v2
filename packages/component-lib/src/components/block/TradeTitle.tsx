import { WithTranslation } from 'react-i18next';
import { AvatarCoinStyled, CoinInfo, FloatTag, TradeFloat } from '@loopring-web/common-resources';
import { Box, Grid } from '@material-ui/core';
import { Avatar, Typography } from '@material-ui/core/';
import styled from '@emotion/styled';
import React from 'react';
import { baseTitleCss, useSettings } from '../../index';
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
    // const sellIconHasLoaded = useImage(coinAInfo?.icon ? coinAInfo?.icon : '').hasLoaded;
    // const buyIconHasLoaded = useImage(coinBInfo?.icon ? coinBInfo?.icon : '').hasLoaded;
    const {coinJson} = useSettings();
    const sellCoinIcon: any = coinJson [ coinAInfo?.simpleName ];
    const buyCoinIcon: any = coinJson [ coinBInfo?.simpleName ];

    const tradeFloatType = tradeFloat?.priceDollar === 0 ? FloatTag.none : tradeFloat?.priceDollar < 0 ? FloatTag.decrease : FloatTag.increase;
    const {currency} = useSettings();
    const change = (tradeFloat?.change && tradeFloat?.change !== Number.NaN) ? (tradeFloat.change * 100).toFixed(2) + ' %' : '0.00%'
    return <TradeTitleStyled custom={{chg: currency}}>{coinBInfo && coinAInfo ?
        <Grid container height={72}>
            <Grid item xs={12} height={28}>
                <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-start'} alignItems={'center'}>
                    <Box className={'logo-icon'} height={'var(--chart-title-coin-size)'}  position={'relative'}  zIndex={20}
                         width={'var(--chart-title-coin-size)'} alignItems={'center'} justifyContent={'center'}>
                        {sellCoinIcon ?
                            <AvatarCoinStyled imgx={sellCoinIcon.x} imgy={sellCoinIcon.y}
                                              imgheight={sellCoinIcon.height}
                                              imgwidth={sellCoinIcon.width} size={28}
                                              variant="circular" alt={coinAInfo?.simpleName as string}
                                // src={sellData?.icon}
                                              src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                            : <Avatar variant="circular" alt={coinAInfo?.simpleName as string} style={{
                                height: 'var(--chart-title-coin-size)',
                                width: 'var(--chart-title-coin-size)'
                            }}
                                // src={sellData?.icon}
                                      src={'static/images/icon-default.png'}/>
                        }</Box>

                    <Box className={'logo-icon'} height={'var(--chart-title-coin-size)'}   position={'relative'}  zIndex={18}   left={-8}
                         width={'var(--chart-title-coin-size)'} alignItems={'center'}
                         justifyContent={'center'}>{buyCoinIcon ?
                        <AvatarCoinStyled imgx={buyCoinIcon.x} imgy={buyCoinIcon.y} imgheight={buyCoinIcon.height}
                                          imgwidth={buyCoinIcon.width} size={28}
                                          variant="circular" alt={coinBInfo?.simpleName as string}
                            // src={sellData?.icon}
                                          src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'}/>
                        : <Avatar variant="circular" alt={coinBInfo?.simpleName as string} style={{
                            height: 'var(--chart-title-coin-size)',
                            width: 'var(--chart-title-coin-size)'
                        }}
                            // src={sellData?.icon}
                                  src={'static/images/icon-default.png'}/>} </Box>
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
                        {`${(tradeFloat.floatTag === 'decrease' ? '-' : '+') + tradeFloat.priceDollar} (${change})`}</Typography>
                </Box>
            </Grid>
        </Grid> : <></>
    } </TradeTitleStyled>
}