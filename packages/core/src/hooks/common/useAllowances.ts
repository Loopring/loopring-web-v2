import BigNumber from 'bignumber.js'
import { LoopringAPI, useSystem, useTokenMap } from '../../index'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'

export function useAllowances({ owner, symbol }: { owner: string; symbol: string }) {
  const { tokenMap } = useTokenMap()
  const { status: systemStatus } = useSystem()

  const [allowanceInfo, setAllowanceInfo] = React.useState<{
    allowance: BigNumber
    needCheck: boolean
    tokenInfo: sdk.TokenInfo
  }>()

  const updateAllowance = React.useCallback(
    async (symbol: string) => {
      if (owner && tokenMap && LoopringAPI.exchangeAPI && symbol) {
        const tokenInfo = tokenMap[symbol]

        if (tokenInfo) {
          let allowance = sdk.toBig(0)
          let needCheck = false

          if (tokenInfo?.symbol.toUpperCase() !== 'ETH') {
            const { tokenAllowances } = await LoopringAPI.exchangeAPI.getAllowances({
              owner,
              token: [tokenInfo.address],
            })
            allowance = sdk.toBig(tokenAllowances.get(tokenInfo.address) ?? '')
            needCheck = true
          }

          setAllowanceInfo({
            allowance,
            needCheck,
            tokenInfo,
          })
        } else {
          setAllowanceInfo(undefined)
        }
      }
    },
    [tokenMap, owner],
  )

  React.useEffect(() => {
    updateAllowance(symbol)
  }, [owner, symbol, systemStatus])

  return {
    allowanceInfo,
  }
}
