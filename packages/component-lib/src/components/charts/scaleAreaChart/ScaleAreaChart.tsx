// import {WithTranslation, withTranslation} from "react-i18next";
// import styled from "@emotion/styled";
// import { IOrigDataItem, IGetDepthDataParams } from './data'
import TrendChart from "./TrendChart";
import DepthChart from "./DepthChart";
import { ChartType } from "../";

import { IndicatorProps, WrapperedKlineChart } from "./KlineChart";

import * as sdk from "@loopring-web/loopring-sdk";
import { TradingInterval } from "@loopring-web/loopring-sdk";
import { useSettings } from "../../../stores";
import { getTheme } from "@loopring-web/common-resources";

export interface ScaleAreaChartProps {
  type: ChartType;
  data: any;
  indicator?: IndicatorProps;
  interval?: sdk.TradingInterval;
  handleMove?: (props: any) => void;
  yAxisDomainPercent?: number; // defualt 0.1
  riseColor?: "green" | "red";
  showTooltip?: boolean;
  showArea?: boolean;
  quoteSymbol?: string;
  showXAxis?: boolean;
  isHeadTailCompare?: boolean;
  marketPrecision?: number;
  isDailyTrend?: boolean;
  handleMoveOut?: () => void;
}

export const ScaleAreaChart = ({
  type,
  interval,
  indicator,
  data,
  marketPrecision,
  ...rest
}: ScaleAreaChartProps) => {
  const { themeMode, upColor } = useSettings();
  switch (type) {
    case ChartType.Trend:
      return <TrendChart type={type} data={data} {...rest} />;
    case ChartType.Depth:
      return (
        <DepthChart
          data={data}
          marketPrecision={marketPrecision}
          colorBase={getTheme(themeMode).colorBase}
          {...rest}
        />
      );
    case ChartType.Kline:
      // let dateTimeFormat = '%Y %a %d'
      let dateTimeFormat = "%x";
      if (interval) {
        switch (interval) {
          case TradingInterval.min1:
          case TradingInterval.min5:
          case TradingInterval.min15:
          case TradingInterval.min30:
            // dateTimeFormat = '%Y %b %d, %I:%M %p'
            dateTimeFormat = "%c";
            break;
          case TradingInterval.hr1:
          case TradingInterval.hr2:
          case TradingInterval.hr4:
          case TradingInterval.hr12:
            // dateTimeFormat = '%Y %b %d, %I %p'
            dateTimeFormat = "%c";
            break;
          case TradingInterval.d1:
            break;
          case TradingInterval.w1:
            // dateTimeFormat = '%Y %b %d'
            break;
          default:
            break;
        }
      }
      return (
        <WrapperedKlineChart
          dateTimeFormat={dateTimeFormat}
          {...indicator}
          data={data}
          upColor={upColor}
          colorBase={getTheme(themeMode).colorBase}
          marketPrecision={marketPrecision}
        />
      );
    default:
      return <span>prop "type" is not avaible for current chart</span>;
  }
};
