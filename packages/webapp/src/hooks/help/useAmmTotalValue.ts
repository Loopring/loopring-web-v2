import React from 'react'
import { LoopringAPI } from 'api_wrapper'
import { useTokenMap, } from 'stores/token'
import { useWalletLayer2 } from 'stores/walletLayer2'
import { volumeToCount } from 'hooks/help'
import store from 'stores'

export const useAmmTotalValue = () => {
    const {addressIndex} = useTokenMap();
    const {walletLayer2} = useWalletLayer2();
    const { forex } = store.getState().system

    const getLpTokenPrice = React.useCallback(async (market: string) => {
        if (addressIndex && LoopringAPI.walletAPI) {
            const result = await LoopringAPI.walletAPI.getLatestTokenPrices()
            const list = Object.entries(result.tokenPrices).map(([addr, price]) => ({
                addr,
                price,
            }))
            const address = Object.entries(addressIndex).find(([_, token]) => token === market)?.[0]
            if (address && !!list.length) {
                return list.find((o) => o.addr === address)?.price
            }
            return undefined
        }
        return undefined
    }, [addressIndex])
    
    type GetAmmLiquidityProps = {
        market: string, 
        balance?: number, 
        currency?: 'USD' | 'CNY'
    }

    const getAmmLiquidity = React.useCallback(async ({market, balance, currency = 'USD'}: GetAmmLiquidityProps) => {
        const price = await getLpTokenPrice(market)
        let curBalance: any
        if (balance) {
            curBalance = balance
        } else {
            curBalance = Object.entries(walletLayer2 || {}).find(([token]) => token === market)?.[1].total
        }
        const formattedBalance = volumeToCount(market, (curBalance || 0))
        const unit = currency && currency === 'CNY' ? forex : 1
        return (price || 0) * (formattedBalance || 0) * (unit as number)
    }, [walletLayer2, getLpTokenPrice, forex])

    return {
        getAmmLiquidity
    }
}
