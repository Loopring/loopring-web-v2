import { Box, Grid, Typography } from '@mui/material';
import { MarketInfo } from 'loopring-sdk/dist/defs';
import { WithTranslation, withTranslation } from 'react-i18next';
import { DepthViewData, MarketRowHeight } from '@loopring-web/common-resources';
// import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

export type Row = DepthViewData  & {type:DepthType, onClick:(event:MouseEvent,price:number)=>void,}
export const  GridStyle = styled(Grid)`
  margin: 0;
  &:hover{
    background: var(--color-box-hover);
    transition: background 0.4s ease-out;
  }
  & > .MuiGrid-item{
    padding-top: 0;
    padding-left: 0;
  }
` as typeof Grid
export const Depth = ({
                          price,
                          onClick,
                          amtForShow,
                          // amtTotal,
                          amtTotalForShow,
                          percentage,
                          type,
                      }: Row) => {
    // const theme = useTheme();
    const color = type === DepthType.ask? 'var(--color-error)':'var(--color-success)';
    return <GridStyle   container spacing={1} position={'relative'} wrap={'nowrap'} style={{cursor:'pointer'}} onClick={(e)=>onClick(e as any,price)}>
        <Box style={{opacity:0.1,backgroundColor:color}} display={'block'} position={'absolute'} right={0} width={percentage*100+'%'} height={`${MarketRowHeight}px`} zIndex={44}/>
        <Grid item xs={4} alignSelf={'flex-start'} zIndex={55} >
            <Typography lineHeight={`${MarketRowHeight}px`} color={color} variant={'body2'} > {price}  </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} textAlign={'right'} zIndex={55}>
            <Typography lineHeight={`${MarketRowHeight}px`} color={'text.secondary'} variant={'body2'}>  {amtForShow}  </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} textAlign={'right'} zIndex={55} >
            <Typography lineHeight={`${MarketRowHeight}px`} color={'text.secondary'} variant={'body2'}>  {amtTotalForShow} </Typography>
        </Grid>
    </GridStyle>
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

    return <GridStyle  container spacing={1} position={'relative'} wrap={'nowrap'} >
        <Grid item xs={4} alignSelf={'flex-start'} >
            <Typography lineHeight={`${MarketRowHeight}px`} color={'var(--color-text-third)'}
                        variant={'body2'} component={'p'} >{t('labelDepthPrice', {symbol: quoteSymbol})} </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} >
            <Typography lineHeight={`${MarketRowHeight}px`} color={'var(--color-text-third)'}
                        variant={'body2'} textAlign={'right'}  component={'p'} >  {t('labelDepthAmount', {symbol: baseSymbol})} </Typography>
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'} >
            <Typography lineHeight={`${MarketRowHeight}px`} color={'var(--color-text-third)'} variant={'body2'} textAlign={'right'}  component={'p'} >  {t('labelDepthTotal')} </Typography>
        </Grid>
    </GridStyle>
})
export const DepthBlock = withTranslation('common')(({
                                                         depths,
                                                         onClick,
                                                         // tokenBaseInfo,
                                                         type,
                                                     }: {
    onClick:(event:MouseEvent,price:number)=>void,
    type: DepthType,
    // quotePrecision:number,
    depths: DepthViewData[],
    marketInfo: MarketInfo
} & WithTranslation) => {


    return <>
        {depths.map((depth,index) => {
            // const amt_p = ;
            //
            // const amtTotal_p = getValuePrecisionThousand(toBig(depth.amtTotal).div('1e' + tokenBaseInfo.decimals),
            //     undefined, undefined, marketInfo.precisionForPrice, true);


            return <Depth onClick={onClick} key={index} {...{
                ...depth,
                type,
            }}    />
        })}

    </>
})
