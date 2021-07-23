// import {WithTranslation, withTranslation} from "react-i18next";
// import styled from "@emotion/styled";
// import { IOrigDataItem, IGetDepthDataParams } from './data'
import TrendChart from './TrendChart'
import DepthChart from './DepthChart'
import { ChartType } from '../';

import { DayilyStockChart } from './KlineChart'

export interface ScaleAreaChartProps {
    type: ChartType
    data: any
    handleMove?: (props: any) => void
    yAxisDomainPercent?: number // defualt 0.1
    riseColor?: 'green' | 'red'
    showTooltip?: boolean
    showArea?: boolean
    extraInfo?: string
    showXAxis?: boolean
}

export const ScaleAreaChart = (props: ScaleAreaChartProps) => {
    switch (props.type) {
        case ChartType.Trend:
            return <TrendChart {...props} />
        case ChartType.Depth:
            return <DepthChart {...props} />
        case ChartType.Kline:
            return <DayilyStockChart data={props.data}/>
        default:
            return <span>prop "type" is not avaible for current chart</span>
    }
}
