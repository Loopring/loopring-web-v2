import React from 'react'
import { LoopringAPI, useAccount, useTokenMap } from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'
import { myLog } from '@loopring-web/common-resources'

export function useGetVIPInfo() {
  const {
    account: { accountId, accAddress, apiKey },
  } = useAccount()
  const [tradeAmountInfo, setTraeAmountInfo] = React.useState<any>(null)
  const [userVIPInfo, setUserVIPInfo] = React.useState<any>(null)
  const [userAssets, setUserAssets] = React.useState<any[]>([])

  const { tokenMap } = useTokenMap()

  const getUserTradeAmount = React.useCallback(
    async (markets: string = '', limit: number = 30) => {
      if (LoopringAPI && LoopringAPI.walletAPI && accountId) {
        const data = await LoopringAPI.walletAPI.getUserTradeAmount({
          accountId,
          markets,
          limit,
        })
        setTraeAmountInfo(data)
      }
    },
    [accountId],
  )

  const getUserVIPInfo = React.useCallback(async () => {
    if (LoopringAPI && LoopringAPI.userAPI && accountId) {
      const data = await LoopringAPI.userAPI.getUserVIPInfo(
        {
          userAddress: accAddress,
        },
        apiKey,
      )
      setUserVIPInfo(data)
    }
  }, [accAddress, accountId, apiKey])

  const getUserAssets = React.useCallback(async () => {
    if (LoopringAPI && LoopringAPI.userAPI && tokenMap) {
      const lrcAddress = tokenMap['LRC'].address
      const response = await LoopringAPI.userAPI.getUserVIPAssets({
        address: accAddress,
        assetTypes: 'DEX',
        token: lrcAddress,
      })
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        myLog((response as sdk.RESULT_INFO).message)
      } else {
        setUserAssets(response.vipAsset as any[])
      }
    }
    setUserAssets([])
  }, [accAddress, tokenMap])

  return {
    tradeAmountInfo,
    getUserTradeAmount,
    userVIPInfo,
    getUserVIPInfo,
    userAssets,
    getUserAssets,
  }
}
