// amt: "64000000000000000000"
// amtTotal: "64000000000000000000"
// price: 0.011674
// vol: "747100000000000000"

import { ABInfo } from "loopring-sdk";
import { Box, Grid } from '@mui/material';
import { MarketInfo } from 'loopring-sdk/dist/defs';
import { WithTranslation, withTranslation } from 'react-i18next';
import { getValuePrecisionThousand } from '@loopring-web/common-resources';

// volTotal: "747100000000000000"
export type Row = ABInfo & { amt_p:string, amtTotal_p:string }
export const Depth = ({price, amt_p, amtTotal_p}: Row) => {
    return <Grid container spacing={1} position={'relative'} wrap={'nowrap'}>
        <Grid item xs={4} alignSelf={'flex-start'}>
            {price}
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'}>
            {amt_p}
        </Grid>
        <Grid item xs={4} alignSelf={'flex-end'}>
            {amtTotal_p}
        </Grid>

    </Grid>
}
export const DepthBlock = withTranslation('common')(({
                                                  marketInfo,
                                                  depths,
                                                  t,
                                                  showTitle = true
                                              }: { showTitle?: boolean, depths: ABInfo[], marketInfo: MarketInfo } & WithTranslation) => {

    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = marketInfo.market.match(/(\w+)-(\w+)/i);

    return <Box>
        {showTitle && < Grid container spacing={1} position={'relative'} wrap={'nowrap'}>
          <Grid item xs={4} alignSelf={'flex-start'}>
              {t('LabelDepthPrice', {symbol: quoteSymbol})}
          </Grid>
          <Grid item xs={4} alignSelf={'flex-end'}>
              {t('LabelDepthAmount', {symbol: baseSymbol})}

          </Grid>
          <Grid item xs={4} alignSelf={'flex-end'}>
              {t('LabelDepthTotal')}
          </Grid>
        </Grid>}
        {depths.map((depth) => {
            return <Depth {...{
                ...depth,
                amt_p: getValuePrecisionThousand(depth.amt, undefined, undefined, marketInfo.precisionForPrice, true),
                amtTotal_p: getValuePrecisionThousand(depth.amtTotal, undefined, undefined, marketInfo.precisionForPrice, true),
            }}    />
        })}

    </Box>
})
