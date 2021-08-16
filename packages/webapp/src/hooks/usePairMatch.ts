import { useState } from "react"
import { useRouteMatch } from "react-router-dom"
import { useTokenMap } from "stores/token"
import { CoinInfo } from "@loopring-web/common-resources"
import { useCustomDCEffect } from "./common/useCustomDCEffect"
import { myLog } from "utils/log_tools"
import { getExistedMarket } from "loopring-sdk"

export function usePairMatch<C extends { [key: string]: any }>(path: string) {
    const { coinMap, tokenMap, marketArray, } = useTokenMap()
    const match: any = useRouteMatch(`${path}/:market`)

    const [pair, setPair] = useState<{ coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined }>({ coinAInfo: undefined, coinBInfo: undefined})
    const [market, setMarket] = useState('')
    
    useCustomDCEffect(() => {

        if (!coinMap || !tokenMap || !marketArray) {
            return
        }

        let market = match?.params?.market

        let coinA = 'LRC'

        let coinB = 'ETH'

        let realMarket = `${coinA}-${coinB}`

        if (market) {

            const matchRes = market.match(/(\w+)-(\w+)/i)
    
            if (matchRes && matchRes.length >= 3 && coinMap[matchRes[1]] && coinMap[matchRes[2]]) {
                coinA = matchRes[1]
                coinB = matchRes[2]
            }
    
            const { market: marketTemp } = getExistedMarket(marketArray, coinA, coinB)
            realMarket = marketTemp
     
            myLog('-------> coinA:', coinA, ' coinB:', coinB, ' realMarket:', realMarket)

        }

        let coinAInfo = coinMap[coinA]
        let coinBInfo = coinMap[coinB]

        setPair({ coinAInfo, coinBInfo, })
        setMarket(realMarket)
    }, [coinMap, tokenMap, marketArray, match])

    return {
        market,
        pair,
        setPair,
    }
}
