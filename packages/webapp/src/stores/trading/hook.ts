import { useAmmpoolAPI, useExchangeAPI } from 'hooks/exchange/useApi'
import { useSelector, useDispatch } from 'react-redux'
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect'

import store, { RootState } from 'stores'

import { 
    setMarkets, 
    setExchangeInfo, 
    setTokens, 
    setTickerMap, 
    setAmmPoolStats,
    setAmmPoolConf, 
    setMarketTrades,
    setAmmActivityRules,
    setChainId, 
} from 'stores/trading/reducer'

import { dumpError400, ChainId, AmmPoolStat, Currency, } from 'loopring-sdk'
import { useActiveWeb3React } from 'hooks/web3/useWeb3'
import { useEffect } from 'react'

import { ammpoolAPI, exchangeAPI } from "stores/apis/api"

export function getTradingInfo() {
    const tradingInfo = store.getState().trading
    return {
        tradingInfo,
        chainId: tradingInfo.chainId,
    }
}

export function getAccount() {
    return  store.getState().account

}

export function getChainId(){
    const chainId = store.getState().system.chainId;
    return chainId

}

export function useGetTradingInfo() {
    const tradingInfo = useSelector((state: RootState) => state.trading)
    return {
        tradingInfo,
        chainId: tradingInfo.chainId,
    }
}

export function useUpdateChainId() {
    const { chainId } = useActiveWeb3React()
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setChainId(chainId ?? ChainId.GORLI))
    }, [chainId, dispatch])
}

export function useUpdateExchangeMarkets() {
    const dispatch = useDispatch()
    const api = useExchangeAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const response = await api.getMixMarkets()
            dispatch(setMarkets(response))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api])

}

export function useUpdateExchangeInfo() {

    const dispatch = useDispatch()
    const api = useExchangeAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const response = await api.getExchangeInfo()
            dispatch(setExchangeInfo(response.exchangeInfo))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api])

}

export function useUpdateAmmPoolConf() {

    const dispatch = useDispatch()
    const api = useAmmpoolAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const ammPoolConf = await api.getAmmPoolConf()
            dispatch(setAmmPoolConf(ammPoolConf))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api])

}

export function useUpdateAmmPoolStats() {

    const dispatch = useDispatch()
    const api = useAmmpoolAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const ammPoolStats = await api.getAmmPoolStats()
            dispatch(setAmmPoolStats(ammPoolStats))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api])

}

export function useUpdateAmmActivityRules() {

    const dispatch = useDispatch()
    const api = useAmmpoolAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const ammActivityRules = await api.getAmmPoolActivityRules()
            dispatch(setAmmActivityRules(ammActivityRules.activityRules))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api])

}

export function useUpdateTokens() {

    const dispatch = useDispatch()
    const api = useExchangeAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const tokens = await api.getTokens()
            dispatch(setTokens(tokens))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api])

}

export function useUpdateTickerMap(market: string) {

    const dispatch = useDispatch()
    const api = useExchangeAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const tickMap = await api.getTicker({
                market
              })
            dispatch(setTickerMap(tickMap))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api])

}

export function useMarketTrades(market: string) {
  
    const dispatch = useDispatch()
    const api = useExchangeAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const marketTrades = await api.getMarketTrades({
                market
              })
            dispatch(setMarketTrades(marketTrades))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api, dispatch])

}

export function useUpdateFiatPrice() {
  
    const dispatch = useDispatch()
    const api = useExchangeAPI()

    useCustomDCEffect(async() => {

        if (!api) {
            return
        }

        try {
            const usdFiatPrices = await api.getFiatPrice({
                legal: Currency.USD
            })
            const cnyFiatPrices = await api.getFiatPrice({
                legal: Currency.CNY
            })
            dispatch(setMarketTrades({}))
        } catch (reason) {
            dumpError400(reason)
        }

    }, [api, dispatch])

}

// export const asyncGetTradingInfo = async() => {
//
//     const { tradingInfo } = getTradingInfo()
//     console.log('--- tradingInfo', tradingInfo)
//
//     let tokens: any = undefined
//
//     if (tradingInfo.tokens?.tokenIdMap) {
//         tokens = tradingInfo.tokens
//     } else {
//         tokens = (await exchangeAPI().getTokens())
//     }
//
//     let ammpools: any = undefined
//
//     if (tradingInfo.ammPoolConf?.ammpools) {
//         ammpools = tradingInfo.ammPoolConf.ammpools
//     } else {
//         ammpools = (await ammpoolAPI().getAmmPoolConf()).ammpools
//     }
//
//     let ammPoolStats: { [key: string] : AmmPoolStat } = {}
//
//     if (tradingInfo.ammPoolStats.ammPoolStats) {
//         ammPoolStats = tradingInfo.ammPoolStats.ammPoolStats
//     } else {
//         ammPoolStats = (await ammpoolAPI().getAmmPoolStats()).ammPoolStats
//     }
//
//     return {
//         tokens,
//         ammpools,
//         ammPoolStats,
//     }
// }