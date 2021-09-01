import { useState } from "react"
import { useSelector } from "react-redux"

import { useCustomDCEffect } from "hooks/common/useCustomDCEffect"
import { getExistedMarket, toBig } from 'loopring-sdk'
import { RootState } from "stores"

import store from 'stores'

export function formatedVal(rawData: string, base: string, quote: string) {

    const { marketMap, marketArray } =  store.getState().tokenMap

        if (!rawData || !base || !quote || !marketMap || !marketArray) {
            return ''
        }

        const { market } = getExistedMarket(marketArray, base, quote)
        const marketInfo = marketMap[market]

        const showVal = toBig(rawData).toFixed(marketInfo.precisionForPrice)

    return showVal

}

export function useFormatedVal(rawData: string, base: string, quote: string) {

    const { marketMap, marketArray } = useSelector((state: RootState) => state.tokenMap)

    const [showVal, setShowVal] = useState<string>(rawData)

    useCustomDCEffect(() => {

        if (!rawData || !base || !quote || !marketMap || !marketArray) {
            setShowVal('')
            return
        }

        const { market } = getExistedMarket(marketArray, base, quote)
        const marketInfo = marketMap[market]

        setShowVal(toBig(rawData).toFixed(marketInfo.precisionForPrice))

    }, [marketMap, marketArray, base, quote])

    return {
        formatedVal: showVal,
    }

}
