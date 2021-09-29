import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import React from "react";
import {
    Annotate,
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
    sar,
    rsi,
    withDeviceRatio,
    withSize,
    XAxis,
    YAxis,
    BarSeries,
    SARSeries,
    SingleValueTooltip,
    RSISeries,
    RSITooltip,
    Label,
} from "react-financial-charts";
import { macd, } from "@react-financial-charts/indicators";
import { myLog } from "@loopring-web/common-resources";

enum CandleStickFill {
    up = '#00BBA8',
    down = '#FF5677'
}

export interface IOHLCData {
    date: Date;
    open: number;
    high: number;
    low: number;
    close: number;
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
    RSI = 'RSI',
    SAR = 'SAR',
}

export interface IndicatorProps {
    mainIndicators?: { indicator: MainIndicator, params?: any }[]
    subIndicator?: { indicator: SubIndicator, params?: any }[]
}

export interface StockChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly dateTimeFormat: string;
    readonly width: number;
    readonly ratio: number;
}

export function fibonacci(n: number) {
    let n1 = 1, n2 = 1;
    for (let i = 2; i < n; i++) {
        [n1, n2] = [n2, n1 + n2]
    }
    return [n1, n2]
}

export type StockChartExtraProps = {
    themeMode: 'light' | 'dark';
    upColor: 'green' | 'red';
    colorBase: any;
}

class StockChart extends React.Component<StockChartProps & IndicatorProps & StockChartExtraProps> {

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
            macd: "#0093FF",
            signal: "#D84315",
            zero: "rgba(0, 0, 0, 0.3)",
        },
    };

    public render() {
        const { data: initialData, dateTimeFormat, height, ratio, width, mainIndicators, subIndicator, themeMode, upColor, colorBase } = this.props;
        // const isDark = themeMode === 'dark'
        const isUpGreen = upColor === 'green'
        // simple moving average

        let mainIndicatorLst: any[] = []
        let subIndicatorLst: any[] = []

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
                        mainIndicatorLst.push({ func: indMA, type: item.indicator })
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
                        mainIndicatorLst.push({ func: indEMA, type: item.indicator })
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
                        mainIndicatorLst.push({ func: indBOLL, type: item.indicator })
                        bollToolTipOption = indBOLL.options()
                        break
                    default:
                        break
                }
            })
        }

        if (subIndicator && subIndicator.length > 0) {
            subIndicator.forEach((item: { indicator: SubIndicator, params?: any }) => {
                switch (item.indicator) {
                    case SubIndicator.MACD:
                        const macdCalculator = macd().id(id++)
                            .options({
                                fast: 12,
                                signal: 9,
                                slow: 26,
                            })
                            .merge((d: any, c: any) => {
                                d.macd = c;
                            })
                            .accessor((d: any) => d.macd)
                        subIndicatorLst.push({ func: macdCalculator, type: item.indicator })
                        break
                    case SubIndicator.RSI:
                        const rsiCalculator = rsi()
                            .options({ windowSize: 14 })
                            .merge((d: any, c: any) => {
                                d.rsi = c;
                            })
                            .accessor((d: any) => d.rsi);
                        subIndicatorLst.push({ func: rsiCalculator, type: item.indicator })
                        break
                    case SubIndicator.SAR:
                        const sarCalculator = sar().id(id++)
                            .options({
                                accelerationFactor: item?.params.accelerationFactor,
                                maxAccelerationFactor: item?.params.maxAccelerationFactor,
                            })
                            .merge((d: any, c: any) => {
                                d.sar = c;
                            })
                            .accessor((d: any) => d.sar);
                        subIndicatorLst.push({ func: sarCalculator, type: item.indicator, params: item?.params, })
                        break
                    case SubIndicator.VOLUME:
                        subIndicatorLst.push({ func: undefined, type: item.indicator })
                        break
                    default:
                        break
                }
            })
        }

        let calculatedData = initialData

        mainIndicatorLst.forEach((item: any) => {
            if (item.func) {
                calculatedData = item.func(calculatedData)
            }
        })

        subIndicatorLst.forEach((item: any) => {
            if (item.func) {
                calculatedData = item.func(calculatedData)
            }
        })

        const { margin, xScaleProvider } = this;

        const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData);

        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - 100)]);

        const xExtents = [min, max + 5]

        const gridHeight = height - margin.top - margin.bottom;

        const [h1, hall] = fibonacci(3 + subIndicatorLst.length)

        const chartHeight = Math.floor(gridHeight * h1 / hall)

        const subHeight = subIndicatorLst.length ? Math.floor((gridHeight - chartHeight) / subIndicatorLst.length) : 0

        const timeDisplayFormat = timeFormat(dateTimeFormat)

        const bbStroke = {
            top: "#FF01FF",
            middle: "#CC0165",
            bottom: "#01CCCB",
        };

        let chartId = 1

        const getTrendValueColor = (data?: any) => {
            if (data && data.close && data.open) {
                return data.close > data.open
                    ? isUpGreen
                        ? colorBase.success : colorBase.error
                    : isUpGreen
                        ? colorBase.error : colorBase.success
            }
            return colorBase.textPrimary
        }

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

                <Chart id={chartId++} height={chartHeight} yExtents={this.candleChartExtents} padding={{ top: 20, bottom: 10 }}>
                    <XAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} showTicks={false}
                        // showTickLabel={false} tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                        showTickLabel={false} tickLabelFill={colorBase.providerBtn}
                        // strokeStyle={'rgba(255, 255, 255, 0.3)'} />
                        strokeStyle={colorBase.textDisable} />
                    {/* <YAxis showGridLines gridLinesStrokeStyle={'rgba(255, 255, 255, 0.1)'} */}
                    <YAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn}
                        // tickFormat={this.pricesDisplayFormat} tickLabelFill={'rgba(255, 255, 255, 0.4)'}
                        tickFormat={this.pricesDisplayFormat} tickLabelFill={colorBase.textDisable}
                        // strokeStyle={'rgba(255, 255, 255, 0.3)'} />
                        strokeStyle={colorBase.textDisable} />
                    <CandlestickSeries fill={(data) => getTrendValueColor(data)} wickStroke={(data) => getTrendValueColor(data)} />

                    {
                        mainIndicatorLst && mainIndicatorLst.map((item: any, index: number) => {
                            return (<React.Fragment key={`${item}-${index}`}>
                                <LineSeries yAccessor={item.func.accessor()} strokeStyle={item.func.stroke()} />
                                <CurrentCoordinate yAccessor={item.func.accessor()} fillStyle={item.func.stroke()} />
                            </React.Fragment>)
                        })
                    }

                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                    <EdgeIndicator
                        itemType="last"
                        rectWidth={margin.right}
                        fill={(data) => getTrendValueColor(data)}
                        lineStroke={(data) => getTrendValueColor(data)}
                        displayFormat={this.pricesDisplayFormat}
                        yAccessor={this.yEdgeIndicator}
                    />
                    <OHLCTooltip origin={[8, 16]} textFill={(data: any) => getTrendValueColor(data)} />
                    {
                        maToolTipOptions &&
                        <MovingAverageTooltip
                            origin={[8, 24]}
                            textFill={colorBase.textPrimary}
                            options={maToolTipOptions}
                        />}
                    {
                        bollToolTipOption && <>
                            <BollingerSeries
                                strokeStyle={bbStroke}
                            />
                            <BollingerBandTooltip
                                origin={[8, 64]}
                                yAccessor={d => d.bb}
                                options={bollToolTipOption}
                                textFill={colorBase.textPrimary}
                            /></>}
                    <Label
                        text={'Loopring'}
                        fontFamily={'Roboto'}
                        // fontSize: number;
                        fontWeight={'400'}
                        fillStyle={colorBase.fieldOpacity}
                        x={(width - this.margin.left - this.margin.right) / 2}
                        y={(height - this.margin.top - this.margin.bottom) * 2 / 5}
                    />
                </Chart>

                {
                    subIndicatorLst && subIndicatorLst.length > 0 && subIndicatorLst.map((item: any, ind: number) => {
                        switch (item.type) {
                            case SubIndicator.MACD:
                                return <Chart key={SubIndicator.MACD} id={chartId++} height={subHeight} origin={(_w, _h) => [0, _h - (subIndicatorLst.length - ind) * subHeight]} yExtents={item.func.accessor()}>
                                    <XAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} axisAt="bottom"
                                        orient="bottom" tickLabelFill={colorBase.textDisable}
                                        strokeStyle={colorBase.textDisable} />
                                    <YAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} axisAt="right" orient="right"
                                        ticks={2} tickFormat={format("2s")} tickLabelFill={colorBase.textDisable}
                                        strokeStyle={colorBase.textDisable} />
                                    <MouseCoordinateX displayFormat={timeDisplayFormat} />
                                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                                    <MACDSeries yAccessor={item.func.accessor()} {...this.macdAppearance} />
                                    <MACDTooltip
                                        origin={[8, 16]}
                                        appearance={this.macdAppearance}
                                        options={item.func.options()}
                                        yAccessor={item.func.accessor()}
                                    />
                                </Chart>
                            case SubIndicator.VOLUME:
                                return <Chart key={SubIndicator.VOLUME} id={chartId++} height={subHeight} origin={(_: number, h: number) => [0, h - (subIndicatorLst.length - ind) * subHeight]} yExtents={this.barChartExtents}>
                                    <XAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} axisAt="bottom"
                                        orient="bottom" tickLabelFill={colorBase.textDisable}
                                        strokeStyle={colorBase.textDisable} />
                                    <YAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} axisAt="right" orient="right"
                                        ticks={2} tickFormat={format(".2s")} tickLabelFill={colorBase.textDisable}
                                        strokeStyle={colorBase.textDisable} />
                                    <MouseCoordinateX displayFormat={timeDisplayFormat} />
                                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                                    <BarSeries fillStyle={this.volumeColor} yAccessor={this.volumeSeries} />
                                    <SingleValueTooltip
                                        yAccessor={this.volumeSeries}
                                        yLabel={`VOL`}
                                        origin={[8, 16]}
                                        valueFill={colorBase.textPrimary}
                                    />
                                </Chart>
                            case SubIndicator.RSI:
                                return <Chart key={SubIndicator.RSI} id={chartId++} height={subHeight} origin={(_: number, h: number) => [0, h - (subIndicatorLst.length - ind) * subHeight]} yExtents={[0, 100]}>
                                    <XAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} axisAt="bottom"
                                        orient="bottom" tickLabelFill={colorBase.textDisable}
                                        strokeStyle={colorBase.textDisable} />
                                    <YAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} axisAt="right" orient="right"
                                        ticks={2} tickFormat={format(".2s")} tickLabelFill={colorBase.textDisable}
                                        strokeStyle={colorBase.textDisable} />
                                    <MouseCoordinateX displayFormat={timeDisplayFormat} />
                                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                                    <RSISeries yAccessor={item.func.accessor()} />
                                    <RSITooltip origin={[8, 16]} yAccessor={item.func.accessor()} options={item.func.options()} textFill={colorBase.textPrimary} />
                                </Chart>
                            case SubIndicator.SAR:
                                return <Chart key={SubIndicator.SAR} id={chartId++} height={subHeight} origin={(_: number, h: number) => [0, h - (subIndicatorLst.length - ind) * subHeight]} yExtents={item.func.accessor()}>
                                    <XAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} axisAt="bottom"
                                        orient="bottom" tickLabelFill={colorBase.textDisable}
                                        strokeStyle={colorBase.textDisable} />
                                    <YAxis showGridLines gridLinesStrokeStyle={colorBase.providerBtn} axisAt="right" orient="right"
                                        ticks={2} tickFormat={format(".2s")} tickLabelFill={colorBase.textDisable}
                                        strokeStyle={colorBase.textDisable} />
                                    <MouseCoordinateX displayFormat={timeDisplayFormat} />
                                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                                    <SARSeries yAccessor={item.func.accessor()} />
                                    <SingleValueTooltip
                                        yLabel={`SAR (${item.params.accelerationFactor}, ${item.params.maxAccelerationFactor})`}
                                        yAccessor={item.func.accessor()}
                                        origin={[8, 16]}
                                        valueFill={colorBase.textPrimary}
                                    />
                                </Chart>
                            default:
                                break
                        }
                        return <></>
                    })
                }
                <CrossHairCursor strokeStyle={colorBase.textPrimary} />
            </ChartCanvas>
        );
    }

    // @ts-ignore
    private readonly barChartExtents = (data: IOHLCData) => {
        return data.volume
    };

    private readonly candleChartExtents = (data: any) => {
        // data max > bolling band ? data max : bolling band
        // data min < booling band ? data min : bolling band
        return [data.bb
            ? data.high >= data.bb.top 
                ? data.high
                : data.bb.top * 1.05
            : data.high, data.bb
                            ? data.low <= data.bb.bottom
                                ? data.low
                                : data.bb.bottom * 0.95 
                            : data.low];
    };

    private readonly yEdgeIndicator = (data: IOHLCData) => {
        return data.close;
    };

    // private readonly candleStickColor = (data: IOHLCData) => data.close > data.open
    //     ? this.props.upColor ==='green'
    //         ? CandleStickFill.up
    //         : CandleStickFill.down
    //     : this.props.upColor ==='green'
    //         ? CandleStickFill.down
    //         : CandleStickFill.up

    private readonly volumeColor = (data: IOHLCData) => {
        return data.close > data.open 
            ? this.props.upColor ==='green'
                ? "rgba(38, 166, 154, 0.3)"
                : "rgba(239, 83, 80, 0.3)"
            : this.props.upColor ==='green'
                ? "rgba(239, 83, 80, 0.3)"
                : "rgba(38, 166, 154, 0.3)"
    };

    private readonly volumeSeries = (data: IOHLCData) => {
        return data.volume
    };

    // private readonly openCloseColor = (data: IOHLCData) => {
    //     return data.close > data.open
    //         ? this.props.upColor ==='green'
    //             ? CandleStickFill.up
    //             : CandleStickFill.down
    //         : this.props.upColor ==='green'
    //             ? CandleStickFill.down
    //             : CandleStickFill.up
    // };
}

export const WrapperedKlineChart = withSize({ style: { minHeight: 200 } })(withDeviceRatio()(StockChart));
