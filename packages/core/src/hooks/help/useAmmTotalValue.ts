import React from 'react'
import { volumeToCount, useWalletLayer2, useTokenPrices, useSystem } from '../../index'
import { Currency } from '@loopring-web/loopring-sdk'

export const useAmmTotalValue = () => {
  const { walletLayer2 } = useWalletLayer2()
  const { tokenPrices } = useTokenPrices()
  const { forexMap } = useSystem()

  type GetAmmLiquidityProps = {
    market: string
    balance?: number
    currency?: Currency
  }

  const getAmmLiquidity = React.useCallback(
    ({ market, balance, currency = Currency.usd }: GetAmmLiquidityProps) => {
      const price = tokenPrices && tokenPrices[market]
      let curBalance = 0
      if (balance) {
        curBalance = balance
      } else {
        // if balance is not given, use walletl2 total lp token balance instead
        curBalance = Number(
          Object.entries(walletLayer2 || {}).find(([token]) => token === market)?.[1].total || 0,
        )
      }
      const formattedBalance = volumeToCount(market, curBalance)
      const unit = forexMap[currency]
      return (price || 0) * (formattedBalance || 0) * (unit as number)
    },
    [forexMap, tokenPrices, walletLayer2],
  )

  return {
    getAmmLiquidity,
  }
}
