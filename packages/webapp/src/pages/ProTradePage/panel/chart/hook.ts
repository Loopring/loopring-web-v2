import { LoopringAPI } from 'api_wrapper'
import React from 'react'
import * as sdk from 'loopring-sdk'
import { TradingInterval } from 'loopring-sdk'
import { IOHLCData } from '@loopring-web/component-lib'

export function useKlineChart(market: string | undefined) {

    const [candlestickViewData, setCandlestickViewData] = React.useState<IOHLCData[]>([])

    const genCandlestickData = React.useCallback(async(market: string | undefined) => {

        if (market && LoopringAPI.exchangeAPI) {
        
            const rep: sdk.GetCandlestickRequest = {
                market,
                interval: TradingInterval.d1
            }

            const candlesticks = await LoopringAPI.exchangeAPI.getMixCandlestick(rep)

            let candlestickViewData: IOHLCData[] = []
            
            candlesticks.candlesticks.forEach((item: sdk.Candlestick) => {

                const dataItem: IOHLCData = {
                    date: new Date(item.timestamp),
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    close: item.close,
                    volume: parseInt(item.baseVol),
                }

                candlestickViewData.push(dataItem)

            })

            setCandlestickViewData(candlestickViewData)
        }

    }, [])

    React.useEffect(() => {
        genCandlestickData(market)
    }, [market])

    return {
        candlestickViewData,
        market,
    }
}
