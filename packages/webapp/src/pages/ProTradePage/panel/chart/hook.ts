import { LoopringAPI } from 'api_wrapper'
import React from 'react'
import * as sdk from 'loopring-sdk'
import { IOHLCData } from '@loopring-web/component-lib'
import { useTokenMap } from 'stores/token'

export function useKlineChart(market: string | undefined) {

    const {tokenMap} = useTokenMap()

    const [candlestickViewData, setCandlestickViewData] = React.useState<IOHLCData[]>([])

    const genCandlestickData = React.useCallback(async ({
                                                            market,
                                                            timeInterval = sdk.TradingInterval.d1,
                                                        }: {
        market: string | undefined;
        timeInterval?: sdk.TradingInterval;
    }) => {

        if (market && LoopringAPI.exchangeAPI && tokenMap) {

            // @ts-ignore
            const [_, coinBase, coinQuote] = market.match(/(\w+)-(\w+)/i)

            const decimals = tokenMap[ coinBase ] ? tokenMap[ coinBase ].decimals : -1

            if (decimals > 0) {
                const rep: sdk.GetCandlestickRequest = {
                    market,
                    interval: timeInterval
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
                        volume: sdk.toBig(item.baseVol).div('1e' + decimals).toNumber()
                    }

                    candlestickViewData.push(dataItem)

                })

                setCandlestickViewData(candlestickViewData.reverse())

            } else {
                throw Error('wrong decimals')
            }

        }

    }, [tokenMap])

    React.useEffect(() => {
        genCandlestickData({market})
    }, [market, genCandlestickData])

    return {
        market,
        candlestickViewData,
        setCandlestickViewData,
        genCandlestickData,
    }
}
