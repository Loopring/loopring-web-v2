import { WithTranslation } from 'react-i18next';
import { CoinKey, EmptyValueTag, getThousandFormattedNumbers, abbreviateNumber } from '@loopring-web/common-resources';
import { Box, BoxProps, Grid } from '@material-ui/core';
import { Typography } from '@material-ui/core/';
import styled from '@emotion/styled';
import React from 'react';
import { floatTag, MarketBlockProps, useSettings } from './../../index';
import { ScaleAreaChart } from '../charts/scaleAreaChart'
import { ChartType } from '../charts'

type StyledProps = {
    custom: any
}
//${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
const MarketBlockStyled = styled(Box)<StyledProps>`
  min-height: ${({theme}) => theme.unit * 14.625}px;
  & {
    background: var(--color-box);

    border-radius: ${({theme}) => theme.unit}px;

  }

  // &:not(:last-of-type){
    //   margin-right: ${({theme}) => theme.unit * 3}px;
  //   background-color: chocolate;
  // }
  ${({theme, custom}) => floatTag({theme, custom})};

  .left-block {
    min-width: 76px;
    max-width: 84px;
  }

  .float-group span {
    display: flex;
    align-items: flex-end;
  }

` as React.ElementType<StyledProps & BoxProps>;

export const MarketBlock = <C extends CoinKey<I>, I>({
                                                         coinAInfo,
                                                         t,
                                                         coinBInfo,
                                                         tradeFloat,
                                                         chartData = []
                                                     }: & WithTranslation & MarketBlockProps<C>) => {
    const {upColor} = useSettings();
    return <MarketBlockStyled className={'MuiPaper-elevation2'} custom={{chg: upColor}} padding={0.5 * 5} display={'flex'}
                              justifyContent={'stretch'}>
        {coinAInfo && coinBInfo ?
            <Grid container justifyContent={'space-around'} position={'relative'}>
                <Grid item xs={12} display={'flex'} flexDirection={'row'} justifyContent={'flex-start'}
                      alignItems={'center'} height={24}>
                    <Typography variant={'h4'} component={'h3'}>
                        <Typography component={'span'} title={'sell'} color={'textPrimary'}>
                            {coinAInfo?.simpleName}
                        </Typography>
                        <Typography component={'i'}>/</Typography>
                        <Typography component={'span'} title={'buy'} color={'textPrimary'}>
                            {coinBInfo.simpleName}
                        </Typography>
                    </Typography>
                </Grid>
                <Grid item xs={12} display={'flex'} flexDirection={'row'} justifyContent={'flex-start'}
                      alignItems={'stretch'} className={'float-group'} marginTop={1}>
                    <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} justifyContent={'flex-end'}
                         className={'left-block'}>
                        <Typography variant={'h5'} height={24} component={'span'}
                                    className={`float-tag float-${tradeFloat.floatTag}`}>${
                            getThousandFormattedNumbers(tradeFloat.priceDollar, 2, {isAbbreviate: true})
                        } </Typography>
                        <Typography variant={'body2'} component={'span'} marginTop={1 / 2}
                                    className={`float-tag float-${tradeFloat.floatTag}`}>{
                            tradeFloat.change
                              ? `${tradeFloat.change > 0 ? '+' : ''}${getThousandFormattedNumbers(tradeFloat.change, 2)}%`
                              : EmptyValueTag
                        }</Typography>
                    </Box>
                    <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'}
                         justifyContent={'flex-end'}>
                        <Typography variant={'body2'} component={'span'} textOverflow={'ellipsis'}
                                    height={24}> ￥{
                                      tradeFloat.priceYuan ? abbreviateNumber(tradeFloat.priceYuan) : '--'
                        } </Typography>
                        <Typography variant={'body2'} component={'div'} textOverflow={'ellipsis'} overflow={'hidden'} whiteSpace={'nowrap'}
                                    marginTop={1 / 2}>{t('labelVolume')} : {(tradeFloat.volume ? getThousandFormattedNumbers(tradeFloat.volume, 3) : '--')}</Typography>
                    </Box>

                </Grid>
                <Grid item position={'absolute'} top={0} right={0} width={120} height={42}>
                    <ScaleAreaChart showTooltip={false} showArea={false} type={ChartType.Trend} data={chartData}/>
                </Grid>
            </Grid> : <></>
        } </MarketBlockStyled>
}