import React, { useCallback } from 'react'
import store from 'stores'
import { TokenType } from '@loopring-web/component-lib'
import { AccountStatus, EmptyValueTag, globalSetup, SagaStatus } from '@loopring-web/common-resources'
import { useWalletLayer2 } from 'stores/walletLayer2'
import { useAccount } from 'stores/account';
import { LoopringAPI } from 'api_wrapper'
import { makeWalletLayer2, volumeToCountAsBigNumber, useAmmTotalValue } from 'hooks/help'
import { AssetType, WsTopicType } from 'loopring-sdk'
import { volumeToCount } from 'hooks/help'
import { useAmmMap } from '../../../stores/Amm/AmmMap';
import { useSocket } from '../../../stores/socket';
import { useWalletHook } from '../../../services/wallet/useWalletHook';

export type TrendDataItem = {
    timeStamp: number;
    close: number;
}

export type ITokenInfoItem = {
    token: string,
    detail: {
        price: string,
        symbol: string,
        updatedAt: number
    }
}

export const useGetAssets = () => {
    const [chartData, setChartData] = React.useState<TrendDataItem[]>([])
    const [assetsList, setAssetsList] = React.useState<any[]>([])
    const [formattedData, setFormattedData] = React.useState<{name: string; value: number}[]>([])
    const { account } = useAccount();
    const {sendSocketTopic,socketEnd} = useSocket();
    // const {  } = store.getState().walletLayer2;
    const { ammMap } = useAmmMap()//store.getState().amm.ammMap
    const { walletLayer2 } = useWalletLayer2();
    const { marketArray, addressIndex } = store.getState().tokenMap
    const [lpTokenList, setLpTokenList] = React.useState<{addr: string; price: number}[]>([])

    const getLpTokenList = React.useCallback(async () => {
        if (LoopringAPI.walletAPI) {
            const result = await LoopringAPI.walletAPI.getLatestTokenPrices()
            const list = Object.entries(result.tokenPrices).map(([addr, price]) => ({
                addr,
                price,
            }))
            setLpTokenList(list)
        }
    }, [])

    React.useEffect(() => {
        getLpTokenList()
    }, [getLpTokenList])
    React.useEffect(() => {
        if(account.readyState === AccountStatus.ACTIVATED){
            sendSocketTopic({[ WsTopicType.account ]: true});
        }else{
            socketEnd()
        }
        return ()=>{
            socketEnd()
        }
    }, [account.readyState]);
    // const getUserTotalAssets = React.useCallback(async (limit: number = 7) => {
    //     const userAssets = await LoopringAPI.walletAPI?.getUserAssets({
    //         wallet: account.accAddress,
    //         assetType: AssetType.DEX,
    //         limit: limit // TODO: minium unit is day, discuss with pm later
    //     })
        
    //     if (userAssets && userAssets.userAssets.length && !!userAssets.userAssets.length) {
    //         setChartData(userAssets.userAssets.map(o => ({
    //             timeStamp: Number(o.createdAt),
    //             // close: o.amount && o.amount !== NaN ? Number(o.amount) : 0
    //             close: Number(o.amount)
    //         })))
    //     }
    // }, [account.accAddress])

    const walletLayer2Callback = React.useCallback(()=>{
        const walletMap = makeWalletLayer2()
        const assetsKeyList = walletMap && walletMap.walletMap ? Object.keys(walletMap.walletMap) : []
        const assetsDetailList = walletMap && walletMap.walletMap ? Object.values(walletMap.walletMap) : []
        const list = assetsKeyList.map((key, index) => ({
            token: key,
            detail: assetsDetailList[index]
        }))
        setAssetsList(list)
    },[])
    useWalletHook({walletLayer2Callback})

    const { faitPrices } = store.getState().system

    const tokenPriceList = faitPrices ? Object.entries(faitPrices).map(o => ({
        token: o[ 0 ],
        detail: o[ 1 ]
    })) as ITokenInfoItem[] : []

    const getLpTokenPrice = useCallback((market: string) => {
        if (addressIndex) {
            const address = Object.entries(addressIndex).find(([_, token]) => token === market)?.[0]
            if (address && lpTokenList) {
                return lpTokenList.find((o) => o.addr === address)?.price
            }
            return undefined
        }
        return undefined
    }, [addressIndex, lpTokenList])

    const getFormattedData = React.useCallback(() => {
        if (!!assetsList.length && !!lpTokenList.length) {
            const data = assetsList.map(item => {
                const isLpToken = item.token.split('-')[0] === 'LP'
                if (!isLpToken) {
                    const tokenPriceUSDT = item.token === 'DAI'
                        ? 1
                        : Number(tokenPriceList.find(o => o.token === item.token) ? tokenPriceList.find(o => o.token === item.token)?.detail.price : 0) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
                    return ({
                        name: item.token,
                        value: Number(volumeToCount(item.token, item.detail?.detail?.total as string)) * tokenPriceUSDT
                    })
                }
                const formattedBalance = Number(volumeToCount(item.token, item.detail?.detail.total))
                // const tokenValue = await getAmmLiquidity({ market: item.token, balance: balance })
                const price = getLpTokenPrice(item.token)
                // const balance = Object.entries(walletLayer2 || {}).find(([token]) => token === item.token)?.[1].total
                // const formattedBalance = volumeToCount(item.token, (balance || 0))
                let tokenValue: number = 0;
                if (formattedBalance && price){
                    // tokenValue = ammMap[ammToken].totalLPToken as any;
                    tokenValue = (formattedBalance || 0) * price as any;
                }
                return ({
                    name: item.token,
                    value: tokenValue
                })
            })
            setFormattedData(data)
        }
    }, [getLpTokenPrice, assetsList, lpTokenList])

    React.useEffect(() => {
        getFormattedData()
    }, [getFormattedData])

    // React.useEffect(() => {
    //     if (LoopringAPI && LoopringAPI.walletAPI && walletLayer2) {
    //          getUserTotalAssets()
    //     }
    // }, [walletLayer2, getFormattedData])

    // React.useEffect(() => {
    //     getFormattedData()
    // }, [getFormattedData])

    // const formattedData = assetsList.map(item => {
    //     const isLpToken = item.token.split('-')[0] === 'LP'
    //     if (!isLpToken) {
    //         const tokenPriceUSDT = item.token === 'DAI'
    //             ? 1
    //             : Number(tokenPriceList.find(o => o.token === item.token) ? tokenPriceList.find(o => o.token === item.token)?.detail.price : 0) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
    //         return ({
    //             name: item.token,
    //             value: Number(volumeToCount(item.token, item.detail?.detail?.total as string)) * tokenPriceUSDT
    //         })
    //     }
    //     const formattedBalance = Number(volumeToCount(item.token, item.detail?.detail.total))
    //     // const tokenValue = await getAmmLiquidity({ market: item.token, balance: balance })
    //     const price = getLpTokenPrice(item.token)
    //     // const balance = Object.entries(walletLayer2 || {}).find(([token]) => token === item.token)?.[1].total
    //     // const formattedBalance = volumeToCount(item.token, (balance || 0))
    //     let tokenValue: number = 0;
    //     if (formattedBalance && price){
    //         // tokenValue = ammMap[ammToken].totalLPToken as any;
    //         tokenValue = (formattedBalance || 0) * price as any;
    //     }
    //     return ({
    //         name: item.token,
    //         value: tokenValue
    //     })
    // })
    // const formattedData = await Promise.all(promises)
    // const total = formattedData.map(o => o.value).reduce((a, b) => a + b, 0)
    // const percentList = formattedData.map(o => ({
    //     ...o,
    //     value: o.value / total,
    // }))

    // const lpTotalData = percentList
    //     .filter(o => o.name.split('-')[0] === 'LP')
    //     .reduce((prev, next) => ({
    //         name: 'LP-Token',
    //         value: prev.value + next.value
    //     }), {
    //         name: 'LP-Token',
    //         value: 0
    //     })
    
    // const formattedDoughnutData = percentList.filter(o => o.name.split('-')[0] === 'LP').length > 0
    //     ? [...percentList.filter(o => o.name.split('-')[0] !== 'LP'), lpTotalData]
    //     : percentList

    const assetsRawData = assetsList.map((tokenInfo) => {
        const tokenPriceUSDT = Number(tokenPriceList.find(o => o.token === tokenInfo.token)?.detail.price) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
        return ({
            token: {
                type: tokenInfo.token.split('-')[0] === 'LP' ? TokenType.lp : TokenType.single,
                value: tokenInfo.token
            },
            amount: String(Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)).toFixed(6)) || EmptyValueTag,
            available: String(tokenInfo.detail?.count) || EmptyValueTag,
            locked: String(volumeToCountAsBigNumber(tokenInfo.token, tokenInfo.detail?.detail.locked)) || EmptyValueTag,
            smallBalance: tokenPriceUSDT * Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) < 1,
        })
    })

    return {
        // chartData,
        // assetsList,
        formattedData,
        // formattedDoughnutData,
        assetsRawData,
        marketArray,
    }
}
