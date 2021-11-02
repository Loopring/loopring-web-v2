import React from 'react'
import { LoopringAPI } from 'api_wrapper'
import { useTokenMap, } from 'stores/token'
import { useWalletLayer2 } from 'stores/walletLayer2'
import { volumeToCount } from 'hooks/help'
import store from 'stores'
import { Currency } from '@loopring-web/loopring-sdk';

export const useAmmTotalValue = () => {
    const {addressIndex} = useTokenMap();
    const {walletLayer2} = useWalletLayer2();
    const {forex} = store.getState().system

    const getLpTokenPrice = React.useCallback(async (market: string) => {
        if (addressIndex && LoopringAPI.walletAPI) {
            const result = await LoopringAPI.walletAPI.getLatestTokenPrices()
            const list = Object.entries(result.tokenPrices).map(([addr, price]) => ({
                addr,
                price,
            }))
            const address = Object.entries(addressIndex).find(([_, token]) => token === market)?.[ 0 ]
            if (address && !!list.length) {
                return list.find((o) => o.addr === address)?.price
            }
            return undefined
        }
        return undefined
    }, [addressIndex])

    type GetAmmLiquidityProps = {
        market: string;
        balance?: number;
        currency?: Currency
    }

    const getAmmLiquidity = React.useCallback(async ({market, balance, currency =  Currency.usd}: GetAmmLiquidityProps) => {
        const price = await getLpTokenPrice(market)
        let curBalance = 0
        if (balance) {
            curBalance = balance
        } else {
            // if balance is not given, use walletl2 total lp token balance instead
            curBalance = Number(Object.entries(walletLayer2 || {}).find(([token]) => token === market)?.[ 1 ].total || 0)
        }
        const formattedBalance = volumeToCount(market, curBalance)
        const unit = currency && currency === Currency.cny ? forex : 1
        return (price || 0) * (formattedBalance || 0) * (unit as number)
    }, [walletLayer2, getLpTokenPrice, forex])

    return {
        getAmmLiquidity
    }
}
