import { Box, Grid, Typography } from '@mui/material';
import { MarketInfo } from 'loopring-sdk/dist/defs';
import { WithTranslation, withTranslation } from 'react-i18next';
import { DepthViewData } from '@loopring-web/common-resources';
import { useTheme } from '@emotion/react';

export type Row = DepthViewData  & {type:DepthType}
const Height = '20px'
export const Depth = ({
                          price,
                          // amt,
                          amtForShow,
                          // amtTotal,
                          amtTotalForShow,
                          percentage,
                          type,
                      }: Row) => {
    const theme = useTheme();
    const color = type === DepthType.ask? 'var(--color-error)':'var(--color-success)';
    return <Grid container spacing={1} position={'relative'} wrap={'nowrap'} >
        <Box style={{opacity:0.1,backgroundColor:color}} display={'block'} position={'absolute'} top={theme.unit} right={0} width={percentage*100+'%'} height={Height} zIndex={44}/>
        <Grid item xs={4} alignSelf={'flex-start'} zIndex={55} >
            <Typography lineHeight={Height} color={color} variant={'body2'} > {price}  </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} textAlign={'right'} zIndex={55}>
            <Typography lineHeight={Height} color={'text.secondary'} variant={'body2'}>  {amtForShow}  </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} textAlign={'right'} zIndex={55} >
            <Typography lineHeight={Height} color={'text.secondary'} variant={'body2'}>  {amtTotalForShow} </Typography>
        </Grid>
    </Grid>
}

export enum DepthType {
    ask = 'ask',
    bid = 'bid'
}

export const DepthTitle = withTranslation('common')(({
                                                          marketInfo,

                                                          t,
                                                      }: {
    // type: DepthType,
    // tokenBaseInfo: TokenInfo, tokenQuoteInfo: TokenInfo,
    marketInfo: MarketInfo
} & WithTranslation)=>{
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = marketInfo.market.match(/(\w+)-(\w+)/i);

    return < Grid container spacing={1} position={'relative'} wrap={'nowrap'} >
        <Grid item xs={4} alignSelf={'flex-start'} >
            <Typography lineHeight={Height} color={'var(--color-text-third)'}
                        variant={'body2'} component={'p'} >{t('labelDepthPrice', {symbol: quoteSymbol})} </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} >
            <Typography lineHeight={Height} color={'var(--color-text-third)'}
                        variant={'body2'} textAlign={'right'}  component={'p'} >  {t('labelDepthAmount', {symbol: baseSymbol})} </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} >
            <Typography lineHeight={Height} color={'var(--color-text-third)'} variant={'body2'} textAlign={'right'}  component={'p'} >  {t('labelDepthTotal')} </Typography>
        </Grid>
    </Grid>
})
export const DepthBlock = withTranslation('common')(({
                                                         depths,
                                                         // tokenBaseInfo,
                                                         type,
                                                     }: {
    type: DepthType,
    depths: DepthViewData[],
    marketInfo: MarketInfo
} & WithTranslation) => {


    return <>
        {depths.map((depth,index) => {
            // const amt_p = ;
            //
            // const amtTotal_p = getValuePrecisionThousand(toBig(depth.amtTotal).div('1e' + tokenBaseInfo.decimals),
            //     undefined, undefined, marketInfo.precisionForPrice, true);


            return <Depth key={index} {...{
                ...depth,
                type,
            }}    />
        })}

    </>
})
