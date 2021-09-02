import React, { useCallback } from 'react'
import store from 'stores'
import { TokenType } from '@loopring-web/component-lib'
import {
    AccountStatus,
    EmptyValueTag,
    getThousandFormattedNumbers,
    getValuePrecision
} from '@loopring-web/common-resources'
import { useAccount } from 'stores/account';
import { LoopringAPI } from 'api_wrapper'
import { makeWalletLayer2, volumeToCount, volumeToCountAsBigNumber } from 'hooks/help'
import { WsTopicType } from 'loopring-sdk'
import { useSocket } from '../../../stores/socket';
import { useWalletLayer2Socket } from 'services/socket/';
import { useSystem } from 'stores/system'
import { myLog } from 'utils/log_tools'

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

export type AssetsRawDataItem = {
    token: {
        type: TokenType;
        value: string;
    },
    amount: string;
    available: string;
    locked: string;
    smallBalance: boolean;
    tokenValueDollar: number;
    name: string;
    tokenValueYuan: number;
}

export const useGetAssets = () => {
    // const [chartData, setChartData] = React.useState<TrendDataItem[]>([])
    const [assetsMap, setAssetsMap] = React.useState<{ [ key: string ]: any }>({})
    const [assetsRawData, setAssetsRawData] = React.useState<AssetsRawDataItem[]>([])
    // const [formattedData, setFormattedData] = React.useState<{name: string; value: number}[]>([])
    const {account} = useAccount();
    const {sendSocketTopic, socketEnd} = useSocket();
    const {forex} = useSystem()

    const {marketArray, addressIndex, tokenMap,} = store.getState().tokenMap
    const [lpTokenList, setLpTokenList] = React.useState<{ addr: string; price: number }[]>([])

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
        if (account.readyState === AccountStatus.ACTIVATED) {
            sendSocketTopic({[ WsTopicType.account ]: true});
        } else {
            socketEnd()
        }
        return () => {
            socketEnd()
        }
    }, [account.readyState]);

    const walletLayer2Callback = React.useCallback(() => {
        const walletMap = makeWalletLayer2()
        const assetsKeyList = walletMap && walletMap.walletMap ? Object.keys(walletMap.walletMap) : []
        const assetsDetailList = walletMap && walletMap.walletMap ? Object.values(walletMap.walletMap) : []
        let map: { [ key: string ]: any } = {}

        assetsKeyList.forEach((key, index) => (map[ key ] = {
            token: key,
            detail: assetsDetailList[ index ]
        }))

        setAssetsMap(map)
    }, [])
    useWalletLayer2Socket({walletLayer2Callback})

    const {faitPrices} = store.getState().system

    const tokenPriceList = faitPrices ? Object.entries(faitPrices).map(o => ({
        token: o[ 0 ],
        detail: o[ 1 ]
    })) as ITokenInfoItem[] : []

    const getLpTokenPrice = useCallback((market: string) => {
        if (addressIndex) {
            const address = Object.entries(addressIndex).find(([_, token]) => token === market)?.[ 0 ]
            if (address && lpTokenList) {
                return lpTokenList.find((o) => o.addr === address)?.price
            }
            return undefined
        }
        return undefined
    }, [addressIndex, lpTokenList])

    const getAssetsRawData = React.useCallback(() => {
        if (tokenMap && !!Object.keys(tokenMap).length && !!Object.keys(assetsMap).length && !!tokenPriceList.length && !!lpTokenList.length) {
            const tokenKeys = Object.keys(tokenMap)
            let data: any[] = []
            tokenKeys.forEach((key, index) => {
                let item = undefined
                if (assetsMap[ key ]) {
                    const tokenInfo = assetsMap[ key ]
                    const isLpToken = tokenInfo.token.split('-')[ 0 ] === 'LP'
                    let tokenValueDollar = 0
                    if (!isLpToken) {
                        const tokenPriceUSDT = tokenInfo.token === 'DAI'
                            ? 1
                            : Number(tokenPriceList.find(o => o.token === tokenInfo.token) ? tokenPriceList.find(o => o.token === tokenInfo.token)?.detail.price : 0) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
                        const rawData = Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail?.total)) * tokenPriceUSDT
                        tokenValueDollar = Number(getValuePrecision(rawData, 2)) || 0
                    } else {
                        const formattedBalance = Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total))
                        const price = getLpTokenPrice(tokenInfo.token)
                        if (formattedBalance && price) {
                            tokenValueDollar = Number(getValuePrecision((formattedBalance || 0) * price, 2)) || 0 as any;
                        }
                    }
                    const isSmallBalance = tokenValueDollar < 1
                    item = {
                        token: {
                            type: tokenInfo.token.split('-')[ 0 ] === 'LP' ? TokenType.lp : TokenType.single,
                            value: tokenInfo.token
                        },
                        // amount: getThousandFormattedNumbers(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) || EmptyValueTag,
                        amount: (volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) || EmptyValueTag,
                        // available: getThousandFormattedNumbers(Number(tokenInfo.detail?.count)) || EmptyValueTag,
                        available: (Number(tokenInfo.detail?.count)) || EmptyValueTag,
                        locked: String(volumeToCountAsBigNumber(tokenInfo.token, tokenInfo.detail?.detail.locked)) || EmptyValueTag,
                        smallBalance: isSmallBalance,
                        tokenValueDollar,
                        name: tokenInfo.token,
                        tokenValueYuan: Number((tokenValueDollar * (Number(forex) || 6.5)).toFixed(2))
                    }
                } else {
                    item = {
                        token: {
                            type: key.split('-')[ 0 ] === 'LP' ? TokenType.lp : TokenType.single,
                            value: key
                        },
                        amount: EmptyValueTag,
                        available: EmptyValueTag,
                        locked: 0,
                        smallBalance: true,
                        tokenValueDollar: 0,
                        name: key,
                        tokenValueYuan: 0,
                    }
                }
                if (item) {
                    data.push(item)
                }
            })
            data.sort((a, b) => {
                const deltaDollar = b.tokenValueDollar - a.tokenValueDollar
                const deltaAmount = ((b.amount && Number(b.amount)) ? Number(b.amount) : 0) - (a.amount && Number(a.amount) ? Number(a.amount) : 0)
                const deltaName = b.token.value < a.token.value ? 1 : -1
                return deltaDollar !== 0
                    ? deltaDollar
                    : deltaAmount !== 0
                        ? deltaAmount
                        : deltaName
            })
            setAssetsRawData(data)
        } else {
            myLog('emmmmmmmpty')
        }
    }, [assetsMap, tokenMap, lpTokenList])

    React.useEffect(() => {
        getAssetsRawData()
    }, [getAssetsRawData])

    return {
        // chartData,
        // assetsList,
        // formattedData,
        // formattedDoughnutData,
        assetsRawData,
        marketArray,
    }
}
