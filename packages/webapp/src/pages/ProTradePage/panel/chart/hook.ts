import { LoopringAPI } from 'api_wrapper'
import React from 'react'
import * as sdk from 'loopring-sdk'

export function useKlineChart(market: string | undefined) {

    const getCandlestickData = React.useCallback((market: string) => {

        // if (market && LoopringAPI.exchangeAPI) {
        
        //     const rep: sdk.GetCandlestickRequest = {
    
        //     }

        //     await LoopringAPI.exchangeAPI.getMixCandlestick(rep))
        // }

    }, [])

    React.useEffect(() => {

    }, [market])

    return {
        market,
    }
}
