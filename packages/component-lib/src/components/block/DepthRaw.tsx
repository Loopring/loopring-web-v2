// amt: "64000000000000000000"
// amtTotal: "64000000000000000000"
// price: 0.011674
// vol: "747100000000000000"

import { ABInfo, toBig, TokenInfo } from "loopring-sdk";
import { Box, Grid, Typography } from '@mui/material';
import { MarketInfo } from 'loopring-sdk/dist/defs';
import { WithTranslation, withTranslation } from 'react-i18next';
import { getValuePrecisionThousand } from '@loopring-web/common-resources';

// volTotal: "747100000000000000"
export type Row = ABInfo & { amt_p: string, amtTotal_p: string, type: DepthType }
export const Depth = ({price, amt_p, amtTotal_p, type}: Row) => {
    const color = type === DepthType.ask? 'error':'var(--color-success)';
    return <Grid container spacing={1} position={'relative'} wrap={'nowrap'} >
        <Grid item xs={4} alignSelf={'flex-start'}>
            <Typography lineHeight={'20px'} color={color} variant={'body2'} > {price}  </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} textAlign={'right'}>
            <Typography lineHeight={'20px'} color={'text.secondary'} variant={'body2'}>  {amt_p}  </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} textAlign={'right'}>
            <Typography lineHeight={'20px'} color={'text.secondary'} variant={'body2'}>  {amtTotal_p} </Typography>
        </Grid>

    </Grid>
}

export enum DepthType {
    ask = 'ask',
    bid = 'bid'
}

export const DepthBlock = withTranslation('common')(({
                                                         marketInfo,
                                                         depths,
                                                         tokenBaseInfo,
                                                         type,
                                                         t,
                                                         showTitle = true
                                                     }: { showTitle?: boolean, type: DepthType, depths: ABInfo[], tokenBaseInfo: TokenInfo, tokenQuoteInfo: TokenInfo, marketInfo: MarketInfo } & WithTranslation) => {

    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = marketInfo.market.match(/(\w+)-(\w+)/i);

    return <Box paddingTop={1/2}>
        {showTitle && < Grid container spacing={1} position={'relative'} wrap={'nowrap'} >
          <Grid item xs={4} alignSelf={'flex-start'} >
            <Typography lineHeight={'20px'} color={'var(--color-text-third)'}
                        variant={'body2'} component={'p'} >{t('labelDepthPrice', {symbol: quoteSymbol})} </Typography>
          </Grid>
          <Grid item xs={4} alignSelf={'flex-end'} >
            <Typography lineHeight={'20px'} color={'var(--color-text-third)'}
                        variant={'body2'} textAlign={'right'}  component={'p'} >  {t('labelDepthAmount', {symbol: baseSymbol})} </Typography>
          </Grid>
          <Grid item xs={4} alignSelf={'flex-end'}>
            <Typography lineHeight={'20px'} color={'var(--color-text-third)'} variant={'body2'} textAlign={'right'}  component={'p'} >  {t('labelDepthTotal')} </Typography>
          </Grid>
        </Grid>}
        {depths.map((depth) => {
            const amt_p = getValuePrecisionThousand(toBig(depth.amt).div('1e' + tokenBaseInfo.decimals),
                undefined, undefined, marketInfo.precisionForPrice, true);

            const amtTotal_p = getValuePrecisionThousand(toBig(depth.amtTotal).div('1e' + tokenBaseInfo.decimals),
                undefined, undefined, marketInfo.precisionForPrice, true);


            return <Depth {...{
                ...depth,
                type,
                amt_p,
                amtTotal_p
            }}    />
        })}

    </Box>
})
