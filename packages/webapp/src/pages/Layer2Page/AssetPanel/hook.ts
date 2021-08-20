import React from 'react'
import store from 'stores'
import { TokenType } from '@loopring-web/component-lib'
import { EmptyValueTag } from '@loopring-web/common-resources'
import { useWalletLayer2 } from 'stores/walletLayer2'
import { useAccount } from 'stores/account';
import { LoopringAPI } from 'api_wrapper'
import { makeWalletLayer2 } from 'hooks/help'
import { AssetType, WsTopicType } from 'loopring-sdk'
import { volumeToCount } from 'hooks/help'
import { accountService } from '../../../services/accountService';
import { useAmmMap } from '../../../stores/Amm/AmmMap';
import { useSocket } from '../../../stores/socket';

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
    
    const { account: { accAddress }, } = useAccount();
    const {sendSocketTopic} = useSocket();
    // const {  } = store.getState().walletLayer2;
    const { ammMap } = useAmmMap()//store.getState().amm.ammMap
    const { status: walletLayer2Status, walletLayer2,socketUpdateBalance } = useWalletLayer2();
    const { marketArray } = store.getState().tokenMap
    const subject = React.useMemo(() => accountService.onSocket(), []);
    React.useEffect(() => {
        sendSocketTopic({[ WsTopicType.account ]: true});
    }, []);

    React.useEffect(() => {
        const subscription = subject.subscribe((balance) => {
            if (balance) {
                socketUpdateBalance(balance)
            }
        });
        return () => subscription.unsubscribe();
    }, [subject]);

    const getUserTotalAssets = React.useCallback(async (limit: number = 7) => {
        const userAssets = await LoopringAPI.walletAPI?.getUserAssets({
            wallet: accAddress,
            assetType: AssetType.DEX,
            limit: limit // TODO: minium unit is day, discuss with pm later
        })
        if (userAssets && userAssets.userAssets.length && !!userAssets.userAssets.length) {
            // console.log(userAssets.userAssets)
            setChartData(userAssets.userAssets.map(o => ({
                timeStamp: Number(o.createdAt),
                // close: o.amount && o.amount !== NaN ? Number(o.amount) : 0
                close: Number(o.amount)
            })))
        }
    }, [accAddress])

    React.useEffect(() => {
        if (walletLayer2Status === 'UNSET') {
            const walletMap = makeWalletLayer2()
            const assetsKeyList = walletMap && walletMap.walletMap ? Object.keys(walletMap.walletMap) : []
            const assetsDetailList = walletMap && walletMap.walletMap ? Object.values(walletMap.walletMap) : []
            const list = assetsKeyList.map((key, index) => ({
                token: key,
                detail: assetsDetailList[index]
            }))
            setAssetsList(list)
        }
    }, [walletLayer2Status])

    React.useEffect(() => {
        if (LoopringAPI && LoopringAPI.walletAPI && walletLayer2) {
            getUserTotalAssets()
        }
    }, [walletLayer2, getUserTotalAssets])

    const { faitPrices } = store.getState().system

    const tokenPriceList = faitPrices ? Object.entries(faitPrices).map(o => ({
        token: o[ 0 ],
        detail: o[ 1 ]
    })) as ITokenInfoItem[] : []

    const formattedData = assetsList.map(item => {
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
        const result = item.token.split('-')
        result.splice(0, 1, 'AMM')
        const ammToken = result.join('-')
        // const ammTokenList = Object.keys(ammMap)
        // const ammTokenPrice = ammTokenList.includes(ammToken) && ammMap[ammToken] && ammMap[ammToken].amountDollar ? (ammMap[ammToken].totalLPToken || 0) / ammMap[ammToken].amountDollar : 0
        // const tokenValue =  ammTokenPrice * (item.detail?.count || 0)
        let tokenValue:number  = 0;
        if(ammMap){
            tokenValue = ammMap[ammToken].totalLPToken as any;
        }
        return ({
            name: item.token,
            value: tokenValue
        })
    })
    const total = formattedData.map(o => o.value).reduce((a, b) => a + b, 0)
    const percentList = formattedData.map(o => ({
        ...o,
        value: o.value / total,
    }))

    const lpTotalData = percentList
        .filter(o => o.name.split('-')[0] === 'LP')
        .reduce((prev, next) => ({
            name: 'LP-Token',
            value: prev.value + next.value
        }), {
            name: 'LP-Token',
            value: 0
        })
    
    const formattedDoughnutData = percentList.filter(o => o.name.split('-')[0] === 'LP').length > 0
        ? [...percentList.filter(o => o.name.split('-')[0] !== 'LP'), lpTotalData]
        : percentList

    const assetsRawData = assetsList.map((tokenInfo) => {
        const tokenPriceUSDT = Number(tokenPriceList.find(o => o.token === tokenInfo.token)?.detail.price) / Number(tokenPriceList.find(o => o.token === 'USDT')?.detail.price)
        return ({
            token: {
                type: tokenInfo.token.split('-')[0] === 'LP' ? TokenType.lp : TokenType.single,
                value: tokenInfo.token
            },
            amount: String(Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)).toFixed(6)) || EmptyValueTag,
            available: String(tokenInfo.detail?.count) || EmptyValueTag,
            locked: String(tokenInfo.detail?.detail.locked) || EmptyValueTag,
            smallBalance: tokenPriceUSDT * Number(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) < 1,
        })
    })


    return {
        chartData,
        // assetsList,
        formattedData,
        formattedDoughnutData,
        assetsRawData,
        marketArray,
    }
}
