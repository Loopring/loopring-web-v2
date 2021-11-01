import React from 'react'
import { LoopringAPI } from "api_wrapper";
import { AssetType } from '@loopring-web/loopring-sdk'
import { useAccount } from 'stores/account'

export function useGetVIPInfo() {
    const {account: {accountId, accAddress, apiKey}} = useAccount()
    const [tradeAmountInfo, setTraeAmountInfo] = React.useState<any>(null)
    const [userVIPInfo, setUserVIPInfo] = React.useState<any>(null)
    const [userAssets, setUserAssets] = React.useState<any>(null)

    const getUserTradeAmount = React.useCallback(async (markets: string = '', limit: number = 30) => {
        if (LoopringAPI && LoopringAPI.walletAPI && accountId) {
            const data = await LoopringAPI.walletAPI.getUserTradeAmount({
                accountId,
                markets,
                limit,
            })
            setTraeAmountInfo(data)
        }
    }, [accountId])

    const getUserVIPInfo = React.useCallback(async () => {
        if (LoopringAPI && LoopringAPI.userAPI && accountId) {
            const data = await LoopringAPI.userAPI.getUserVIPInfo({
                address: accAddress,
            })
            setUserVIPInfo(data)
        }
    }, [accAddress, accountId])

    const getUserAssets = React.useCallback(async () => {
        if (LoopringAPI && LoopringAPI.userAPI) { 
            const data = await LoopringAPI.userAPI.getUserVIPAssets({
                address: accAddress,
                assetTypes: 'DEX',
            })
            setUserAssets(data)
        }
    }, [])

    return {
        tradeAmountInfo,
        getUserTradeAmount,
        userVIPInfo,
        getUserVIPInfo,
        userAssets,
        getUserAssets,
    }
}
