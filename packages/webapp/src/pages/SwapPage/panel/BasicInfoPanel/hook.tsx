import { useCallback, useState } from 'react'
import moment from 'moment'
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'

import {
    Candlestick,
    dumpError400,
    GetCandlestickRequest,
    GetDepthRequest,
    getExistedMarket,
    TradingInterval
} from '@loopring-web/loopring-sdk'

import { ChartType, IGetDepthDataParams, TGItemData, TGItemJSXInterface } from '@loopring-web/component-lib'
import { LoopringAPI } from 'api_wrapper'

const chartTypeToggleOptionData: TGItemData[] = [
    {
        value: ChartType.Trend,
        key: ChartType.Trend,
        label: 'label' + ChartType.Trend
    },
    {
        value: ChartType.Depth,
        key: ChartType.Depth,
        label: 'label' + ChartType.Depth
    },
];

const chartIntervalOptionData: TGItemData[] = [
    {
        value: TradingInterval.min30,
        key: TradingInterval.min30,
        label: 'labelToday'
    },
    {
        value: TradingInterval.hr4,
        key: TradingInterval.hr4,
        label: 'labelWeek', //'label' + TradingInterval.hr1
    },
    {
        value: TradingInterval.d1,
        key: TradingInterval.d1,
        label: 'labelMonth'
    },
    {
        value: TradingInterval.w1,
        key: TradingInterval.w1,
        label: 'labelYear'
    },
];

const chartIntervalData = {
    [TradingInterval.min30]: { limit: 48, xAxisIsTime: true, xAxisLabelCount: 12 }, // 1 day
    [TradingInterval.hr4]: { limit: 42, xAxisLabelCount: 6 }, // 1 week
    [TradingInterval.d1]: { limit: 30 }, // ~1 month
    [TradingInterval.w1]: { limit: 52, xAxisLabelCount: 6 }, // 1 year
};

export function useBasicInfo(props: any, coinAInfo: any, coinBInfo: any, marketArray: any[], t: any) {
    const chartTypeOptionsJSXs: TGItemJSXInterface[] = chartTypeToggleOptionData.map(({value, label, key}) => {
        return {value, tlabel: t(label), key, JSX: <>{t(label)}</>}
    });

    const chartIntervalOptionsJSXs: TGItemJSXInterface[] = chartIntervalOptionData.map(({value, label, key}) => {
        return {value, tlabel: t(label), key, JSX: <>{t(label)}</>}
    })

    const {market, amm, baseShow, quoteShow, } = getExistedMarket(marketArray, coinAInfo?.name, coinBInfo?.name)

    const [chartType, setChartType] = useState<ChartType>(ChartType.Trend)

    const [chartInterval, setChartInterval] = useState(TradingInterval.min30);
    const { xAxisIsTime, xAxisLabelCount } = chartIntervalData[chartInterval] || {};

    const [originData, setOriginData] = useState<any>(undefined)

    const handleChartTypeChange = useCallback((_e: React.MouseEvent, value: any) => {
        if (value === null) return
        // Settings.setChartType(value)
        // console.log('useBasicInfo handleChange:', value)
        setOriginData(undefined)
        setChartType(value === 'Trend' ? ChartType.Trend : ChartType.Depth)
    }, [setOriginData, setChartType]);

    const handleChartIntervalChange = useCallback((_e: React.MouseEvent, value: any) => {
        if (value === null) return
        setOriginData(undefined)
        setChartInterval(value)
    }, [setOriginData, setChartInterval]);

    useCustomDCEffect(async () => {

        let mounted = true

        if (!LoopringAPI.exchangeAPI || !market || !amm) {
            return
        }

        if (chartType === ChartType.Trend) {
            const request: GetCandlestickRequest = {
                market: amm as string,
                interval: chartInterval,
                limit: (chartIntervalData[chartInterval] || {}).limit || 30
            }

            try {
                const candlesticks = await LoopringAPI.exchangeAPI.getCandlestick(request)

                if (mounted) {
                    const originData = candlesticks.candlesticks.map((item: Candlestick) => {
                        return {
                            timeStamp: item.timestamp,
                            low: item.low,
                            high: item.high,
                            open: item.open,
                            close: item.close,
                            volume: item.quoteVol,
                            change: (item.close - item.open) / item.open,
                            date: moment(item.timestamp).format('MMM DD'),
                            timeOfDay: moment(item.timestamp).format('hh:mm A')
                        }
                    })
                    setOriginData(originData)
                }
            } catch (reason) {
                dumpError400(reason, 'ChartPanel getCandlestick')
            }

        } else {
            const request: GetDepthRequest = {
                market,
            }

            try {

                const {depth} = await LoopringAPI.exchangeAPI.getMixDepth(request)

                if (mounted) {
                    const originData: IGetDepthDataParams = {
                        bidsPrices: depth.bids_prices,
                        bidsAmtTotals: depth.bids_amtTotals as any,
                        asksPrices: depth.asks_prices,
                        asksAmtTotals: depth.asks_amtTotals as any,
                    }
                    setOriginData(originData)
                }

            } catch (reason) {
                dumpError400(reason)
            }

        }

        return () => {
            mounted = false
        }

    }, [LoopringAPI.exchangeAPI, amm, market, chartType, chartInterval])

    return {
        // change,
        // volume,
        baseShow,
        quoteShow,
        chartType,
        chartTypeOptionsJSXs,
        handleChartTypeChange,
        originData,
        chartInterval,
        chartIntervalOptionsJSXs,
        handleChartIntervalChange,
        xAxisIsTime,
        xAxisLabelCount
    }
}