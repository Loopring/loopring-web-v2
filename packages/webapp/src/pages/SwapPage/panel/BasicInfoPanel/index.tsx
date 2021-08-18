import { ChartUnit,UpColor } from '@loopring-web/common-resources'
import { ScaleAreaChart, ToggleButtonGroup, useSettings, TradeTitle, ChartType } from '@loopring-web/component-lib'
import { Box, Grid } from "@material-ui/core"
import { WithTranslation } from 'react-i18next'
import { useBasicInfo } from './hook'
import { VolToNumberWithPrecision } from 'utils/formatter_tool'
import { myLog } from 'utils/log_tools'

const BasicInfoPanel = ({ props, coinAInfo, coinBInfo, tradeFloat, marketArray, t, ...rest }: any & WithTranslation) => {

    const {
        chartType,
        tgItemJSXs,
        handleChange,
        originData,
    } = useBasicInfo(props, coinAInfo, coinBInfo, marketArray, t)
    const { upColor } = useSettings();
    const baseToken = coinAInfo?.name
    const quoteToken = coinBInfo?.name

    // myLog('basicInfo baseToken:', baseToken, ' quoteToken:', quoteToken)

    const trendChartData = originData && !!originData.length ? originData.sort((a: any, b: any) => a.timeStamp - b.timeStamp) : []
    const depthChartData = originData && coinAInfo && originData.asksAmtTotals ? { 
        ...originData,
        asksAmtTotals: originData.asksAmtTotals.map((amt: string) => Number(VolToNumberWithPrecision(amt, baseToken))),
        bidsAmtTotals: originData.bidsAmtTotals.map((amt: string) => Number(VolToNumberWithPrecision(amt, baseToken))),
    } : []
    return  <>
        <Grid item >
           <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} >
               <TradeTitle {...{
                   coinAInfo, coinBInfo,
                   ...rest, t, tradeFloat
               }}></TradeTitle>
               <ToggleButtonGroup exclusive {...{ ...rest, t, tgItemJSXs, value: chartType }}
                                  handleChange={handleChange} />
           </Box>  
        </Grid>
        <Box flex={1} alignItems={'stretch'} flexDirection="row" marginTop={3}  position={'relative'} >
            <Box flex={1} display={'flex'} flexDirection={'column'} minHeight={396} maxHeight={420}  style={{ height: '100%', width: '101%' }}>
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
        </Box>
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
