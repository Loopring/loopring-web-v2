import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import * as React from "react";
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
import { macd } from "@react-financial-charts/indicators";

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

export interface StockChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly dateTimeFormat?: string;
    readonly width: number;
    readonly ratio: number;
}

class StockChart extends React.Component<StockChartProps> {
    private readonly margin = {left: 0, right: 48, top: 0, bottom: 24};
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

    // private readonly macdCalculator = macd()
    //     .id(6)
    //     .options({
    //         fast: 12,
    //         signal: 9,
    //         slow: 26,
    //     })
    //     .merge((d: any, c: any) => {
    //         d.macd = c;
    //     })
    //     .accessor((d: any) => d.macd);

    public render() {
        const {data: initialData, dateTimeFormat = "%d %b", height, ratio, width} = this.props;
        // simple moving average
        const macdCalculator = macd()
            // .id(6)
            .options({
                fast: 12,
                signal: 9,
                slow: 26,
            })
            .merge((d: any, c: any) => {
                d.macd = c;
            })
            .accessor((d: any) => d.macd);

        const sma5 = sma()
            .id(1)
            .options({windowSize: 5})
            .merge((d: any, c: any) => {
                d.sma5 = c;
            })
            .accessor((d: any) => d.sma5);

        const sma10 = sma()
            .id(2)
            .options({windowSize: 10})
            .merge((d: any, c: any) => {
                d.sma10 = c;
            })
            .accessor((d: any) => d.sma10);

        const sma30 = sma()
            .id(3)
            .options({windowSize: 30})
            .merge((d: any, c: any) => {
                d.sma30 = c;
            })
            .accessor((d: any) => d.sma30);

        const sma60 = sma()
            .id(4)
            .options({windowSize: 60})
            .merge((d: any, c: any) => {
                d.sma60 = c;
            })
            .accessor((d: any) => d.sma60);

        const bollinger = bollingerBand()
            .id(5)
            .merge((d: any, c: any) => {
                d.bb = c;
            })
            .accessor((d: any) => d.bb);

        // const elder = elderRay();

        const ema26 = ema()
            .id(6)
            .options({windowSize: 26})
            .merge((d: any, c: any) => {
                d.ema26 = c;
            })
            .accessor((d: any) => d.ema26);

        const ema12 = ema()
            .id(7)
            .options({windowSize: 12})
            .merge((d: any, c: any) => {
                d.ema12 = c;
            })
            .accessor((d: any) => d.ema12);

        const macdYAccessor = macdCalculator.accessor();
        const macdOptions = macdCalculator.options();

        // const calculatedData = macdCalculator(ema12(ema26(sma60(sma30(sma10(sma5(bollinger(initialData))))))));
        const calculatedData = macdCalculator(ema12(ema26(initialData)));


        const {margin, xScaleProvider} = this;

        const {data, xScale, xAccessor, displayXAccessor} = xScaleProvider(calculatedData);

        const max = xAccessor(data[ data.length - 1 ]);
        const min = xAccessor(data[ Math.max(0, data.length - 100) ]);
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
                <Chart id={1} height={chartHeight} yExtents={this.candleChartExtents} padding={{top: 10, bottom: 20}}>
                    <XAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'} showTicks={false}
                           showTickLabel={false} tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                           strokeStyle={'rgba(255, 255, 255, 0.3)'}/>
                    <YAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'}
                           tickFormat={this.pricesDisplayFormat} tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                           strokeStyle={'rgba(255, 255, 255, 0.3)'}/>
                    <CandlestickSeries fill={this.candleStickColor}/>
                    <LineSeries yAccessor={sma5.accessor()} strokeStyle={sma5.stroke()}/>
                    <CurrentCoordinate yAccessor={sma5.accessor()} fillStyle={sma5.stroke()}/>
                    <LineSeries yAccessor={sma10.accessor()} strokeStyle={sma10.stroke()}/>
                    <CurrentCoordinate yAccessor={sma10.accessor()} fillStyle={sma10.stroke()}/>
                    <LineSeries yAccessor={sma30.accessor()} strokeStyle={sma30.stroke()}/>
                    <CurrentCoordinate yAccessor={sma30.accessor()} fillStyle={sma30.stroke()}/>
                    <LineSeries yAccessor={sma60.accessor()} strokeStyle={sma60.stroke()}/>
                    <CurrentCoordinate yAccessor={sma60.accessor()} fillStyle={sma60.stroke()}/>
                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat}/>
                    <EdgeIndicator
                        itemType="last"
                        rectWidth={margin.right}
                        fill={this.openCloseColor}
                        lineStroke={this.openCloseColor}
                        displayFormat={this.pricesDisplayFormat}
                        yAccessor={this.yEdgeIndicator}
                    />
                    <MovingAverageTooltip
                        origin={[8, 24]}
                        textFill={'#FFF'}
                        options={[
                            {
                                yAccessor: sma5.accessor(),
                                type: "MA",
                                stroke: sma5.stroke(),
                                windowSize: sma5.options().windowSize,
                            },
                            {
                                yAccessor: sma10.accessor(),
                                type: "MA",
                                stroke: sma10.stroke(),
                                windowSize: sma10.options().windowSize,
                            },
                            {
                                yAccessor: sma30.accessor(),
                                type: "MA",
                                stroke: sma30.stroke(),
                                windowSize: sma30.options().windowSize,
                            },
                            {
                                yAccessor: sma60.accessor(),
                                type: "MA",
                                stroke: sma60.stroke(),
                                windowSize: sma60.options().windowSize,
                            },
                        ]}
                    />
                    {/* <ZoomButtons /> */}
                    <OHLCTooltip origin={[8, 16]} textFill={'#FFF'}/>
                    <BollingerSeries
                        strokeStyle={bbStroke}
                    />
                    <BollingerBandTooltip
                        origin={[8, 64]}
                        yAccessor={d => d.bb}
                        options={bollinger.options()}
                        textFill={'#fff'}
                    />
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
                           strokeStyle={'rgba(255, 255, 255, 0.3)'}/>
                    <YAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'} axisAt="right" orient="right"
                           ticks={5} tickFormat={format(".2s")} tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                           strokeStyle={'rgba(255, 255, 255, 0.3)'}/>
                    <MouseCoordinateX displayFormat={timeDisplayFormat}/>
                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat}/>
                    <MACDSeries yAccessor={macdYAccessor} {...this.macdAppearance} />
                    <MACDTooltip
                        origin={[8, 16]}
                        appearance={this.macdAppearance}
                        options={macdOptions}
                        yAccessor={macdYAccessor}
                    />
                </Chart>
                <CrossHairCursor strokeStyle={'#fff'}/>
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

export const DayilyStockChart = withSize({style: {minHeight: 600}})(withDeviceRatio()(StockChart));
