import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import React from "react";
import {
    bollingerBand,
    BollingerBandTooltip,
    BollingerSeries,
    CandlestickSeries,
    Chart,
    ChartCanvas,
    CrossHairCursor,
    CurrentCoordinate,
    discontinuousTimeScaleProviderBuilder,
    EdgeIndicator,
    ema,
    lastVisibleItemBasedZoomAnchor,
    LineSeries,
    MACDSeries,
    MACDTooltip,
    MouseCoordinateX,
    MouseCoordinateY,
    MovingAverageTooltip,
    OHLCTooltip,
    sma,
    withDeviceRatio,
    withSize,
    XAxis,
    YAxis,
} from "react-financial-charts";
import { macd, } from "@react-financial-charts/indicators";
import { myLog } from "@loopring-web/common-resources";

enum CandleStickFill {
    up = '#00BBA8',
    down = '#fb3838'
}

export interface IOHLCData {
    close: number;
    date: Date;
    high: number;
    low: number;
    open: number;
    volume: number;
}

export enum MainIndicator {
    MA = 'MA',
    EMA = 'EMA',
    BOLL = 'BOLL',
}

export enum SubIndicator {
    VOLUME = 'VOLUME',
    MACD = 'MACD',
    KDJ = 'KDJ',
    RSI = 'RSI',
}

export interface IndicatorProps {
    mainIndicators?: { indicator: MainIndicator, params?: any }[]
    subIndicator?: { indicator: SubIndicator, params?: any }
}

export interface StockChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly dateTimeFormat?: string;
    readonly width: number;
    readonly ratio: number;
}

class StockChart extends React.Component<StockChartProps & IndicatorProps> {
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
    private readonly pricesDisplayFormat = format(".2f");
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    private readonly macdAppearance = {
        fillStyle: {
            divergence: "#4682B4",
        },
        strokeStyle: {
            macd: "#FF0000",
            signal: "#00F300",
            zero: "yellow",
        },
    };

    public render() {
        const { data: initialData, dateTimeFormat = "%d %b", height, ratio, width, mainIndicators, subIndicator, } = this.props;
        // simple moving average

        let mainIndicatorLst: any[] = []

        let id = 1

        let maToolTipOptions: any[] = []
        let bollToolTipOption: any = undefined

        if (mainIndicators && mainIndicators?.length > 0) {
            mainIndicators.forEach((item: { indicator: MainIndicator, params?: any }) => {
                switch (item.indicator) {
                    case MainIndicator.MA:
                        const periodMA = item.params.period
                        const indMA = sma()
                            .id(id++)
                            .options({ windowSize: periodMA })
                            .merge((d: any, c: any) => {
                                d[`sma${periodMA}`] = c;
                            })
                            .accessor((d: any) => d[`sma${periodMA}`]);
                        mainIndicatorLst.push(indMA)
                        maToolTipOptions.push({
                            yAccessor: indMA.accessor(),
                            type: "MA",
                            stroke: indMA.stroke(),
                            windowSize: indMA.options().windowSize,
                        })
                        break
                    case MainIndicator.EMA:
                        const periodEMA = item.params.period
                        const indEMA = ema()
                            .id(id++)
                            .options({ windowSize: periodEMA })
                            .merge((d: any, c: any) => {
                                d[`ema${periodEMA}`] = c;
                            })
                            .accessor((d: any) => d[`ema${periodEMA}`]);
                        mainIndicatorLst.push(indEMA)
                        maToolTipOptions.push({
                            yAccessor: indEMA.accessor(),
                            type: "EMA",
                            stroke: indEMA.stroke(),
                            windowSize: indEMA.options().windowSize,
                        })
                        break
                    case MainIndicator.BOLL:
                        const indBOLL = bollingerBand()
                            .id(id++)
                            .merge((d: any, c: any) => {
                                d.bb = c;
                            })
                            .accessor((d: any) => d.bb);
                        mainIndicatorLst.push(indBOLL)
                        bollToolTipOption = indBOLL.options()
                        break
                    default:
                        break
                }
            })
        }

        myLog('bollToolTipOption:', bollToolTipOption)

        if (subIndicator) {
        }

        const macdCalculator = macd()
            .options({
                fast: 12,
                signal: 9,
                slow: 26,
            })
            .merge((d: any, c: any) => {
                d.macd = c;
            })
            .accessor((d: any) => d.macd);

        const macdYAccessor = macdCalculator.accessor();
        const macdOptions = macdCalculator.options();

        let calculatedData = initialData

        mainIndicatorLst.forEach((func: any) => {
            calculatedData = func(calculatedData)
        })

        const { margin, xScaleProvider } = this;

        const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData);

        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - 100)]);
        const xExtents = [min, max + 5];

        const gridHeight = height - margin.top - margin.bottom;

        // const elderRayHeight = 100;
        // const elderRayOrigin = (_: number, h: number) => [0, h - elderRayHeight];
        // const barChartHeight = gridHeight / 4;
        // const barChartOrigin = (_: number, h: number) => [0, h - barChartHeight - elderRayHeight];
        // const chartHeight = gridHeight - elderRayHeight;
        const volumeHeight = 100;
        const MACDHeight = 100;
        const chartHeight = gridHeight - volumeHeight - MACDHeight;

        const timeDisplayFormat = timeFormat(dateTimeFormat);

        const bbStroke = {
            top: "#FF01FF",
            middle: "#CC0165",
            bottom: "#01CCCB",
        };

        return (
            <ChartCanvas
                height={height}
                ratio={ratio}
                width={width}
                margin={margin}
                data={data}
                displayXAccessor={displayXAccessor}
                seriesName="Data"
                xScale={xScale}
                xAccessor={xAccessor}
                xExtents={xExtents}
                zoomAnchor={lastVisibleItemBasedZoomAnchor}
            >
                <Chart id={1} height={chartHeight} yExtents={this.candleChartExtents} padding={{ top: 10, bottom: 20 }}>
                    <XAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'} showTicks={false}
                        showTickLabel={false} tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                        strokeStyle={'rgba(255, 255, 255, 0.3)'} />
                    <YAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'}
                        tickFormat={this.pricesDisplayFormat} tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                        strokeStyle={'rgba(255, 255, 255, 0.3)'} />
                    <CandlestickSeries fill={this.candleStickColor} />

                    {
                        mainIndicatorLst && mainIndicatorLst.map((item: any) => {
                            return (<>
                                <LineSeries yAccessor={item.accessor()} strokeStyle={item.stroke()} />
                                <CurrentCoordinate yAccessor={item.accessor()} fillStyle={item.stroke()} />
                            </>)
                        })
                    }

                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                    <EdgeIndicator
                        itemType="last"
                        rectWidth={margin.right}
                        fill={this.openCloseColor}
                        lineStroke={this.openCloseColor}
                        displayFormat={this.pricesDisplayFormat}
                        yAccessor={this.yEdgeIndicator}
                    />
                    {maToolTipOptions && 
                    <MovingAverageTooltip
                        origin={[8, 24]}
                        textFill={'#FFF'}
                        options={maToolTipOptions}
                    />}
                    {/* <ZoomButtons /> */}
                    <OHLCTooltip origin={[8, 16]} textFill={'#FFF'} />
                    { bollToolTipOption && <>
                    <BollingerSeries
                        strokeStyle={bbStroke}
                    />
                    <BollingerBandTooltip
                        origin={[8, 64]}
                        yAccessor={d => d.bb}
                        options={bollToolTipOption}
                        textFill={'#fff'}
                    /></>}
                </Chart>
                {/* <Chart id={2} origin={(w, h) => [0, h - 200]} height={100} yExtents={d => d.volume}>
					<XAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'} axisAt="bottom" orient="bottom" tickLabelFill={'rgba(255, 255, 255, 0.4)'} strokeStyle={'rgba(255, 255, 255, 0.3)'} />
					<YAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'} axisAt="right" orient="right" ticks={5} tickFormat={format(".2s")} tickLabelFill={'rgba(255, 255, 255, 0.4)'} strokeStyle={'rgba(255, 255, 255, 0.3)'} />
					<MouseCoordinateX displayFormat={timeDisplayFormat} />
                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                    <BarSeries yAccessor={this.volumeSeries} fillStyle={this.volumeColor} />
                    <SingleValueTooltip
                        yAccessor={d => d.volume}
                        yLabel={"VOL"}
                        valueFill={'rgba(255, 255, 255, 0.8)'}
                        yDisplayFormat={(d: any) => this.pricesDisplayFormat(d)}
                        origin={[8, 16]}
                    />
				</Chart> */}
                <Chart id={8} origin={(_w, _h) => [0, _h - 100]} height={100} yExtents={macdYAccessor}>
                    <XAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'} axisAt="bottom"
                        orient="bottom" tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                        strokeStyle={'rgba(255, 255, 255, 0.3)'} />
                    <YAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'} axisAt="right" orient="right"
                        ticks={5} tickFormat={format(".2s")} tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                        strokeStyle={'rgba(255, 255, 255, 0.3)'} />
                    <MouseCoordinateX displayFormat={timeDisplayFormat} />
                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                    <MACDSeries yAccessor={macdYAccessor} {...this.macdAppearance} />
                    <MACDTooltip
                        origin={[8, 16]}
                        appearance={this.macdAppearance}
                        options={macdOptions}
                        yAccessor={macdYAccessor}
                    />
                </Chart>
                <CrossHairCursor strokeStyle={'#fff'} />
            </ChartCanvas>
        );
    }

    // @ts-ignore
    private readonly barChartExtents = (data: IOHLCData) => {
        return data.volume;
    };

    private readonly candleChartExtents = (data: any) => {
        return [data.high, data.low];
    };

    private readonly yEdgeIndicator = (data: IOHLCData) => {
        return data.close;
    };

    private readonly candleStickColor = (data: IOHLCData) => data.close > data.open ? CandleStickFill.up : CandleStickFill.down
    // @ts-ignore
    private readonly volumeColor = (data: IOHLCData) => {
        return data.close > data.open ? "rgba(38, 166, 154, 0.3)" : "rgba(239, 83, 80, 0.3)";
    };
    // @ts-ignore
    private readonly volumeSeries = (data: IOHLCData) => {
        return data.volume;
    };

    private readonly openCloseColor = (data: IOHLCData) => {
        return data.close > data.open ? "#26a69a" : "#ef5350";
    };
}

export const DayilyStockChart = withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart));
