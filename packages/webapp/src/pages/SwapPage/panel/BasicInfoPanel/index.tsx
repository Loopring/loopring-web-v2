import { ChartUnit,UpColor } from '@loopring-web/common-resources'
import { ScaleAreaChart, ToggleButtonGroup, useSettings, TradeTitle, ChartType } from '@loopring-web/component-lib'
import { Box, Grid } from "@material-ui/core"
import { WithTranslation } from 'react-i18next'
import { useBasicInfo } from './hook'
import { VolToNumberWithPrecision } from 'utils/formatter_tool'

const BasicInfoPanel = ({ props, coinAInfo, coinBInfo, tradeFloat, marketArray, t, ...rest }: any & WithTranslation) => {

    const {
        // change,
        chartType,
        tgItemJSXs,
        tgItemJSXsPriceChart,
        handleChange,
        originData,
        chartUnit,
        handleChartUnitChange,
    } = useBasicInfo(props, coinAInfo, coinBInfo, marketArray, t)
    const { upColor } = useSettings();
    const baseToken = coinAInfo?.name
    const quoteToken = coinBInfo?.name
    const trendChartData = originData && !!originData.length ? originData.sort((a: any, b: any) => a.timeStamp - b.timeStamp) : []
    const depthChartData = originData && coinAInfo && originData.asksAmtTotals ? { 
        ...originData,
        asksAmtTotals: originData.asksAmtTotals.map((amt: string) => Number(VolToNumberWithPrecision(amt, baseToken))),
        bidsAmtTotals: originData.bidsAmtTotals.map((amt: string) => Number(VolToNumberWithPrecision(amt, baseToken))),
    } : []
    return  <>
        <Grid item xs={8}>
            <TradeTitle {...{
                coinAInfo, coinBInfo,
                ...rest, t, tradeFloat
            }}></TradeTitle>
        </Grid>
        <Grid item xs={4} display={'flex'} justifyContent={'flex-end'} alignItems={'flex-end'}>
            <ToggleButtonGroup exclusive {...{ ...rest, t, tgItemJSXs, value: chartType }}
                handleChange={handleChange} />
        </Grid>

        <Grid item xs={12} position={'relative'}>
            <Box minHeight={256} maxHeight={256} display={'block'} style={{ height: '100%', width: '100%' }}>
                <ScaleAreaChart 
                    type={chartType} 
                    data={chartType === ChartType.Trend ? trendChartData : depthChartData} 
                    riseColor={upColor as keyof typeof UpColor}
                    extraInfo={quoteToken}
                    handleMove={() => {}}
                    showXAxis
                />
            </Box>
            {/* {chartType === ChartType.Trend && (
                <Box height={24} display={'flex'} justifyContent={'flex-end'} position={'absolute'} right={0} bottom={0}>
                    <ToggleButtonGroup exclusive {...{
                        ...rest, t, tgItemJSXs: tgItemJSXsPriceChart,
                        value: chartUnit, size: 'small'
                    }}
                        handleChange={handleChartUnitChange} />
                </Box>
            )} */}
        </Grid> 
        {/* <Grid item xs={12} height={24} display={'flex'} justifyContent={'flex-end'}>
            <ToggleButtonGroup exclusive {...{
                ...rest, t, tgItemJSXs: tgItemJSXsPriceChart,
                value: chartUnit, size: 'small'
            }}
                handleChange={handleChartUnitChange} />
        </Grid> */}
    </>

};

export default BasicInfoPanel
